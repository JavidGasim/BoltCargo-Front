import React, { useEffect, useState } from "react";
import userIcon from "../img/user.png";
import emailIcon from "../img/email.png";
import passwordIcon from "../img/password.png";
import bankIcon from "../img/Bank.jpg";
import cardIcon from "../img/card.png";
import phoneIcon from "../img/phone.png";
import { validate } from "./validate";
import styles from "./SignUp.module.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { notify } from "./toast";
import { Link, useNavigate } from "react-router-dom";
import axios, { toFormData } from "axios";
import Cookies from "js-cookie";
import { HubConnectionBuilder } from "@microsoft/signalr";
// import backgroundImage from "../img/signup.webp";
// import backgroundImage from "../../public/mainpagebg.png";

const SignUp = () => {
  const [data, setData] = useState({
    userName: "",
    name: "",
    surName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    IsAccepted: false,
    role: "",
    bankName: "",
    cardNumber: "",
    phoneNumber: "+994()",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [check, setCheck] = useState({
    message: "",
    isValid: false,
  });
  const [phoneNumber, setPhoneNumber] = useState("");

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
  // };

  var generalUrl = "https://localhost:5000/api/v1/Account/";
  const navigate = useNavigate();

  // const defaulImageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const phoneRegex =
    /^\+994\((50|51|55|70|77|10)\)\s\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

  const handleSendCodeClick = () => {
    setShowCodeInput((prev) => !prev); // Butona tıklandığında input alanını toggle et
  };
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

  useEffect(() => {
    setErrors(validate(data, "signUp"));
  }, [data, touched]);

  const changeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    let newData;

    if (type == "checkbox") {
      newData = { ...data, [name]: checked };
    } else {
      if (name == "name" || name == "surName") {
        const lettersOnlyRegex = /^[a-zA-ZğüşöçıəĞÜŞÖÇİƏ ]*$/;
        if (lettersOnlyRegex.test(value)) {
          newData = { ...data, [name]: value };
        } else {
          return; // düzgün olmayan simvol yazılarsa dayandırırıq
        }
      } else {
        newData = { ...data, [name]: value };

        if (name == "role" && value == "driver") {
          navigate("/signUpDriver");
        }
      }
    }

    // State yenilə
    setData(newData);

    // Cookie-yə yaz (7 gün qalacaq)
    Cookies.set("signupData", JSON.stringify(newData), { expires: 7 });
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) {
      value = value.replace(/(.{4})(?=.)/g, "$1 ");
    }
    setData({ ...data, cardNumber: value });
  };

  const changeHandlerAdmin = (event) => {
    const { name, value, type, checked } = event.target;
    if (type == "checkbox") {
      setData({ ...data, [name]: checked });
    } else {
      setData({ ...data, [name]: value });

      if (name == "role") {
        if (value == "admin") {
          navigate("/signUpAdmin");
        }
      }
    }
  };

  function RegisterUser() {
    var url = generalUrl + "register";
    var obj = {
      username: data.userName,
      surname: data.surName,
      name: data.name,
      email: data.email,
      password: data.password,
      carType: "no",
      imagePath: imageUrl,
      role: "Client",
      bankName: data.bankName,
      cardNumber: data.cardNumber,
      phoneNumber: data.phoneNumber,
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

    if (!data.userName) {
      toast.error("User Name is required");
      isValid = false;
    }

    if (!data.surName) {
      toast.error("Surname is required");
      isValid = false;
    }

    if (!data.name) {
      toast.error("Name is required");
      isValid = false;
    }

    if (!data.email) {
      toast.error("Email is required");
      isValid = false;
    } else if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.]*)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(data.email).toLowerCase()
      )
    ) {
      toast.error("Invalid email");
      isValid = false;
    }

    const password = data.password;
    if (!password) {
      toast.error("Password is required");
      isValid = false;
    } else if (password.length < 9) {
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

    if (!data.confirmPassword) {
      toast.error("Confirm password is required");
      isValid = false;
    } else if (data.confirmPassword !== password) {
      toast.error("Confirm password must be the same as the password");
      isValid = false;
    }

    if (!imageUrl) {
      toast.error("Please select an image");
      isValid = false;
    }

    if (!data.bankName) {
      toast.error("Bank Name is required");
      isValid = false;
    }

    const cardNumber = data.cardNumber;
    if (!cardNumber) {
      toast.error("Card number is required");
      isValid = false;
    } else if (cardNumber.length != 19) {
      toast.error("Card number must be at least 16 characters long");
      isValid = false;
    }
    const phoneNumber = data.phoneNumber;
    if (!phoneNumber) {
      toast.error("Phone number is required");
      isValid = false;
    } else if (!/^\+994\(\d{2}\)\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phoneNumber)) {
      toast.error(
        "Invalid phone number format. Correct format: +994(XX) XXX XX XX"
      );
      isValid = false;
    }

    return isValid;
  };

  const focusHandler = (event) => {
    setTouched({ ...touched, [event.target.name]: true });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      var message = "";
      var url = generalUrl + `existUser?name=${data.userName}`;
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
        toast.success("Client Registered Successfully");
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
      `Email/emailVerificationCode?email=${data.email}`;
    await axios
      .post(url)
      .then((response) => {
        Cookies.set("code", response.data.code, { expires: 30 });
        navigate("/checkCode", { state: { data, imageUrl } });
      })
      .catch((error) => {
        console.log(error.response.data.message);
        alert(error.response.data.message);
      });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setIsValid(phoneRegex.test(value));
  };

  useEffect(() => {
    const savedData = Cookies.get("signupData");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url(${process.env.PUBLIC_URL}/mainpagebg.jpg)`,
        backgroundSize: "cover",
        //Arkaplanın tam sığmasını sağlamak için
        backgroundPosition: "center", // Arkaplanı ortalamak için
        backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
        height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
        width: "100vw", // Genişlik tüm ekranı kaplar
        overflow: "auto", // İçeriğin kaydırılmasını sağlar
      }}
    >
      <form
        onSubmit={submitHandler}
        // className={styles.formLogin}
        className="loginForm"
        autoComplete="off"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ color: "white" }}>Sign Up</h2>
        <div style={{ marginLeft: "35%", marginBottom: "20px" }}>
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
        <div
          style={{
            maxWidth: "300px",
            margin: "0 auto",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              paddingLeft: "30px",
              padding: "8px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <div
            className={
              errors.userName && touched.userName
                ? styles.unCompleted
                : !errors.userName && touched.userName
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={userIcon}
              alt="User Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="userName"
              value={data.userName}
              placeholder="Username"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "15px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.name && touched.name
                ? styles.unCompleted
                : !errors.name && touched.name
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={userIcon}
              alt="User Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="name"
              value={data.name}
              placeholder="Name"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.surName && touched.surName
                ? styles.unCompleted
                : !errors.surName && touched.surName
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={userIcon}
              alt="User Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="surName"
              value={data.surName}
              placeholder="Surname"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.password && touched.password
                ? styles.unCompleted
                : !errors.password && touched.password
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={passwordIcon}
              alt="Password Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="password"
              name="password"
              value={data.password}
              placeholder="Password"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.confirmPassword && touched.confirmPassword
                ? styles.unCompleted
                : !errors.confirmPassword && touched.confirmPassword
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={passwordIcon}
              alt="Password Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="password"
              name="confirmPassword"
              value={data.confirmPassword}
              placeholder="Confirm Password"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.bankName && touched.bankName
                ? styles.unCompleted
                : !errors.bankName && touched.bankName
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={bankIcon}
              alt="Bank Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="bankName"
              value={data.bankName}
              placeholder="Bank Name"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={
              errors.cardNumber && touched.cardNumber
                ? styles.unCompleted
                : !errors.cardNumber && touched.cardNumber
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={cardIcon}
              alt="Card Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="cardNumber"
              value={data.cardNumber}
              onChange={handleCardNumberChange}
              onFocus={focusHandler}
              maxLength="19"
              placeholder="**** **** **** ****"
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <div
            className={
              errors.email && touched.email
                ? styles.unCompleted
                : !errors.email && touched.email
                ? styles.completed
                : undefined
            }
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <img
              src={emailIcon}
              alt="Email Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="email"
              value={data.email}
              placeholder="E-mail"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
              style={{
                paddingLeft: "30px",
                padding: "8px",
                width: "100%",
                marginTop: "7px",
              }}
            />
          </div>

          <div
            style={{
              maxWidth: "300px",
              margin: "0 auto",
              marginBottom: "15px",
              position: "relative",
            }}
          >
            <img
              src={phoneIcon}
              alt="Phone Icon"
              style={{
                position: "absolute",
                left: "-25px",
                top: "65%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
              }}
            />
            <input
              type="text"
              name="phoneNumber"
              value={data.phoneNumber}
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
                marginTop: "7px",
              }}
              placeholder=""
            />
          </div>
        </div>
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <label style={{ color: "white" }}>
            <input
              type="radio"
              name="role"
              value="driver"
              checked={data.role == "driver"}
              onChange={changeHandler}
            />
            Driver
          </label>
          <label style={{ color: "white" }}>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={data.role == "admin"}
              onChange={changeHandlerAdmin}
            />
            Admin
          </label>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            type="submit"
            style={{
              maxWidth: "300px",
              width: "100%",
              margin: "20px auto",
              padding: "10px",
              backgroundColor: "#00cca6",
            }}
          >
            Create Account
          </button>
          <span
            style={{
              color: "white",
              textAlign: "center",
              display: "inline-block",
              width: "100%",
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#00cca6" }}>
              Sign In
            </Link>
          </span>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
