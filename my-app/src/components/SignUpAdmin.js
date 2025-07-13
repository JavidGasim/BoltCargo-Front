import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { generatePath, Link } from "react-router-dom";
import styles from "./DriverPage.module.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import Cookies from "js-cookie";
import backgroundImage from "../img/admin.webp";

const SignUpAdmin = () => {
  const [adminData, setAdminData] = useState({
    userName: "",
    name: "",
    surName: "",
    email: "",
    password: "",
    secretKey: "",
    phoneNumber: "+994()",
  });

  const navigate = useNavigate();

  const [chechkData, setCheckData] = useState();
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // async function startSignalRConnection() {
  //   const connection = new HubConnectionBuilder()
  //     .withUrl("https://localhost:5000/messageHub")
  //     .withAutomaticReconnect()
  //     .build();

  //   try {
  //     await connection.start();
  //     console.log("SignalR Connected");
  //     connection.invoke("AllUsers");
  //     // alert("SignalR isledi");
  //   } catch (error) {
  //     console.error("SignalR connection failed: ", error);
  //   }
  // }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Faylın MIME tipini yoxlama
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!allowedFormats.includes(file.type)) {
      alert("Yalnız şəkil formatında fayllara icazə verilir!");
      return;
    }

    // Şəkil önizləmə üçün URL yaratma
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Şəkil yükləmə
      const response = await axios.post(
        "https://localhost:5000/api/v1/Image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setImageUrl(response.data.imageUrl);
      console.log("Şəkil yükləndi:", response.data.imageUrl);
    } catch (error) {
      console.error("Yükləmə xətası:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const lettersOnlyRegex = /^[a-zA-ZğüşöçıəĞÜŞÖÇİƏ ]*$/;

    if (name == "name" || name == "surName") {
      if (lettersOnlyRegex.test(value)) {
        setAdminData({
          ...adminData,
          [name]: value,
        });
      }
    } else {
      setAdminData({
        ...adminData,
        [name]: value,
      });
    }
  };

  var generalUrl = "https://localhost:5000/api/v1/Account/";

  function RegisterUser() {
    var url = generalUrl + "register";
    var obj = {
      username: adminData.userName,
      surname: adminData.surName,
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      imagePath: imageUrl,
      carType: "no",
      role: "Admin",
      bankName: "no",
      cardNumber: "no",
      phoneNumber: adminData.phoneNumber,
    };

    axios
      .post(url, obj)
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response) {
          console.log("Status:", error.response.data.status);
          console.log("Message:", error.response.data.message);
          console.log("Errors:", error.response.data.error);
        } else {
          console.log("An unexpected error occurred.");
        }
      });
  }

  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (!adminData.userName) {
      toast.error("User Name is required");
      isValid = false;
    }
    if (!adminData.name) {
      toast.error("Name is required");
      isValid = false;
    }

    if (!adminData.surName) {
      toast.error("Surname is required");
      isValid = false;
    }

    // Email validation

    if (!adminData.email) {
      toast.error("Email is required");
      isValid = false;
    } else if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(adminData.email).toLowerCase()
      )
    ) {
      toast.error("Invalid email");
      isValid = false;
    }

    // Password validation
    const password = adminData.password;
    if (!password) {
      toast.error("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number");
      isValid = false;
    } else if (!/[!@#_$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password must contain at least one symbol");
      isValid = false;
    }

    const phoneNumber = adminData.phoneNumber;
    if (!phoneNumber) {
      toast.error("Phone number is required");
      isValid = false;
    } else if (!/^\+994\(\d{2}\)\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phoneNumber)) {
      toast.error(
        "Invalid phone number format. Correct format: +994(XX) XXX XX XX"
      );
      isValid = false;
    }
    if (!adminData.secretKey) {
      toast.error("Secret key is required");
      isValid = false;
    } else if (adminData.secretKey != "admin123") {
      toast.error("Enter true secret key");
      isValid = false;
    }

    if (!imageUrl) {
      toast.error("Please select a image");
      isValid = false;
    }

    return isValid;
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      var message = "";
      var url = generalUrl + `existUser?name=${adminData.userName}`;
      await axios
        .post(url)
        .then((response) => {
          console.log(response.data.message);
          // startSignalRConnection();
        })
        .catch((error) => {
          if (error.response) {
            console.log("Status:", error.response.data.status);
            console.log("Message:", error.response.data.message);
            console.log("Errors:", error.response.data.error);
            message = error.response.data.message;
          } else {
            console.log("An unexpected error occurred.");
          }
        });
      if (message == "") {
        toast.success("Admin Registered Successfully");
        SendCode();
        // RegisterUser();
        // setTimeout(() => {
        //   navigate("/login");
        // }, 1000);
      } else {
        toast.error(message);
      }
    }
  };

  const SendCode = async () => {
    var url =
      "https://localhost:5000/api/v1/" +
      `Email/emailVerificationCode?email=${adminData.email}`;
    await axios
      .post(url)
      .then((response) => {
        Cookies.set("code", response.data.code, { expires: 30 });
        navigate("/checkCodeAdmin", { state: { adminData, imageUrl } });
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  };

  const changeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    if (type == "checkbox") {
      setAdminData({ ...adminData, [name]: checked });
    } else {
      setAdminData({ ...adminData, [name]: value });

      if (name == "role") {
        if (value == "driver") {
          navigate("/signUpDriver");
        }
      }
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        //Arkaplanın tam sığmasını sağlamak için
        backgroundPosition: "center", // Arkaplanı ortalamak için
        backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
        height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
        width: "100vw", // Genişlik tüm ekranı kaplar
        overflow: "auto", // İçeriğin kaydırılmasını sağlar
      }}
    >
      <form onSubmit={submitHandler} className={styles.form}>
        <h2>Admin Sign Up</h2>

        <div style={{ marginLeft: "30%", marginBottom: "20px" }}>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                margin: "auto",
                borderRadius: "50%",
                width: "150px",
                height: "150px",
              }}
            />
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className={styles.formGroup}>
          <label>User Name</label>
          <input
            type="text"
            name="userName"
            value={adminData.userName}
            onChange={handleChange}
            placeholder="User Name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={adminData.name}
            onChange={handleChange}
            placeholder="Name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Surname</label>
          <input
            type="text"
            name="surName"
            value={adminData.surName}
            onChange={handleChange}
            placeholder="Surname"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            placeholder="Password"
          />
        </div>

        <div
          className={styles.formGroup}
          style={{
            maxWidth: "315px",
            margin: "0 auto",
            marginLeft: "125px",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <label>Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={adminData.phoneNumber}
            onChange={changeHandler}
            onInput={(e) => {
              let inputValue = e.target.value.replace(/[^0-9]/g, "");

              if (inputValue.startsWith("994")) {
                inputValue = "994" + inputValue.slice(3);
              }

              if (inputValue.length > 3 && inputValue.length <= 5) {
                e.target.value = `+994(${inputValue.slice(3, 5)})`;
              } else if (inputValue.length > 5 && inputValue.length <= 8) {
                e.target.value = `+994(${inputValue.slice(
                  3,
                  5
                )}) ${inputValue.slice(5, 8)}`;
              } else if (inputValue.length > 8 && inputValue.length <= 10) {
                e.target.value = `+994(${inputValue.slice(
                  3,
                  5
                )}) ${inputValue.slice(5, 8)} ${inputValue.slice(8, 10)}`;
              } else if (inputValue.length > 10) {
                e.target.value = `+994(${inputValue.slice(
                  3,
                  5
                )}) ${inputValue.slice(5, 8)} ${inputValue.slice(
                  8,
                  10
                )} ${inputValue.slice(10, 12)}`;
              }
            }}
            onFocus={(e) => {
              if (e.target.value == "+994()") {
                e.target.setSelectionRange(7, 7);
              }
            }}
            onKeyDown={(e) => {
              if (e.target.value == "+994()" && e.key == "Backspace") {
                e.preventDefault();
              }
            }}
            onBlur={(e) => {
              if (e.target.value == "") {
                e.target.value = "+994()";
              }
            }}
            style={{
              paddingLeft: "30px",
              padding: "8px",
              width: "100%",
              // marginTop: "15px",
              marginBottom: "15px",
              paddingBottom: "10px",
              paddingTop: "10px",
              fontSize: "1.2em",
            }}
            placeholder=""
          />
        </div>

        <div className={styles.formGroup}>
          <label>Secret Key</label>
          <input
            type="password"
            name="secretKey"
            value={adminData.secretKey}
            onChange={handleChange}
            placeholder="SecretKey"
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Sign Up
        </button>

        <div className={styles.backLink}>
          <Link to="/signup" id="backToSignUp">
            Back to Sign Up
          </Link>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SignUpAdmin;
