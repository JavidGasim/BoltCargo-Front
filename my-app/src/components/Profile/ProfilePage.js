import React, { useState, useContext, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./ProfilePage.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/userprofile.webp";

const ProfilePage = () => {
  const [userName, setUserName] = useState();
  const [name1, setName] = useState();
  const [surName, setSurname] = useState();
  const [password, setPassword] = useState();
  const [userId, setUserId] = useState();
  const [email, setEmail] = useState();
  const [carType, setCarType] = useState();
  // const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [connection, setConnection] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Toggle function
  const togglePasswordChange = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  // Toggle function
  const navigate = useNavigate();

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setProfileImage(file);
  //     // setImagePreview(URL.createObjectURL(file));
  //   }
  // };

  async function startSignalRConnection() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/messageHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    try {
      await connection.start();
      console.log("SignalR Connected");
      connection.invoke("SendUser");
      connection.invoke("AllUsers");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

  var generalUrl = "https://localhost:5000/api/v1/";
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
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
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

  function CurrentUser() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    var url = generalUrl + "Account/currentUser";
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserName(response.data.user.userName);
        setEmail(response.data.user.email);
        setCarType(response.data.user.carType.toLowerCase());
        setUserId(response.data.user.id);
        setRole(response.data.role);
        setImageUrl(response.data.user.imagePath);
        setPhoneNumber(response.data.user.phoneNumber);
        setSurname(response.data.user.surname);
        setName(response.data.user.name);
        // setPreviewUrl(response.data.user.imagePath);
      })
      .catch((error) => {
        // console.log(error.response.data.message);
      });
  }

  async function validate(data) {
    let errors = {};
    let message = "ok";
    var name = Cookies.get("username");
    if (data.userName != name) {
      var url = generalUrl + `Account/existUser?name=${data.userName}`;
      await axios
        .post(url)
        .then((response) => {
          console.log(response.data.message);
          message = "ok";
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
    }

    if (message != "ok") {
      errors.userName = message;
    }

    if (!data.userName || data.userName.length < 3) {
      errors.userName = "User name must be at least 3 characters!";
    }
    if (!data.name || data.name.length < 3) {
      errors.name = "Name must be at least 3 characters!";
    }
    if (!data.surName || data.surName.length < 5) {
      errors.surName = "Surname name must be at least 5 characters!";
    }

    if (isChangingPassword) {
      if (!data.password) {
        errors.password = "Password is required!";
      } else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters!";
      } else if (!/[A-Z]/.test(data.password)) {
        errors.password =
          "Password must contain at least one uppercase letter!";
      } else if (!/[0-9]/.test(data.password)) {
        errors.password = "Password must contain at least one number!";
      } else if (!/[!@#_$%^&*(),.?":{}|<>]/.test(data.password)) {
        errors.password = "Password must contain at least one symbol!";
      }

      const phoneNumber = data.phoneNumber;
      if (!phoneNumber) {
        errors.phoneNumber = "Phone number is required";
        isValid = false;
      } else if (
        !/^\+994\(\d{2}\)\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phoneNumber)
      ) {
        errors.phoneNumber =
          "Invalid phone number format. Correct format: +994(XX) XXX XX XX";
        isValid = false;
      }
    }
    return errors;
  }

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      password: isChangingPassword ? password : null, // Şifre değişikliği varsa gönder
      // Diğer form verileri burada olabilir
    };

    const data = {
      userName: userName,
      password: password,
      imagePath: imageUrl,
      email: email,
      carType: carType,
      phoneNumber: phoneNumber,
      name: name1,
      surName: surName,
    };

    let errors = await validate(data);
    // var lastUsername="";
    if (Object.keys(errors).length == 0) {
      var name = Cookies.get("username");
      // lastUsername=name;
      var token = Cookies.get(name);
      var url = generalUrl + `User/${userId}`;
      var obj = {
        userName: userName,
        email: email,
        carType: carType,
        password: isChangingPassword == true ? password : "",
        imagePath: imageUrl,
        phoneNumber: phoneNumber,
        name: name1,
        surName: surName,
      };

      let check = "";

      await axios
        .put(url, obj, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        .then((response) => {
          Cookies.set("username", userName, { expires: 30 });
          Cookies.set(userName, response.data.token);
          startSignalRConnection();
          // var s = Cookies.get("username");
          // const token=Cookies.get(lastUsername);
          // Cookies.set(userName, token, {expires:30});
          // Cookies.set(lastUsername,"");
          // console.log("token", token);
          // console.log("lastusername", lastUsername);
          // console.log("username", userName);
          // CurrentUser();

          check = "ok";
        })
        .catch((error) => {
          check = "no";
          console.log(error.response.data.message);
        });

      if (check == "ok") {
        setTimeout(() => {
          if (role == "Client") {
            navigate("/client");
          } else if (role == "Driver") {
            navigate("/driver");
          }
        }, 1000);
      }
    } else {
      alert(
        Object.values(errors)
          .map((err) => err)
          .join("\n")
      );
    }
  }

  useEffect(() => {
    CurrentUser();
  }, []);

  return (
    <div
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
      <Navbar />

      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-name">Edit Profile</h1>
        </div>

        <form className="profile-form" onSubmit={(e) => handleSubmit(e)}>
          <div style={{ margin: "auto", marginBottom: "20px" }}>
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
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <label htmlFor="userName">User Name</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name1}
            onChange={(e) => {
              const value = e.target.value;
              const lettersOnlyRegex = /^[a-zA-ZğüşöçıəĞÜŞÖÇİƏ ]*$/;
              if (lettersOnlyRegex.test(value)) {
                setName(value);
              }
            }}
          />

          <label htmlFor="surName">Surname</label>
          <input
            type="text"
            id="surName"
            value={surName}
            onChange={(e) => {
              const value = e.target.value;
              const lettersOnlyRegex = /^[a-zA-ZğüşöçıəĞÜŞÖÇİƏ ]*$/;
              if (lettersOnlyRegex.test(value)) {
                setSurname(value);
              }
            }}
          />

          {role == "Driver" && (
            <>
              <label htmlFor="carType">Car Type</label>
              <select
                id="carType"
                value={carType}
                onChange={(e) => setCarType(e.target.value.toLowerCase())}
                style={{ marginBottom: "15px", padding: "5px" }}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </select>
            </>
          )}

          <div>
            <label htmlFor="userName">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              placeholder=""
            />
          </div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-toggle">
            <p>Do you want to change your password?</p>
            <button
              type="button"
              onClick={togglePasswordChange}
              className={`toggle-button ${isChangingPassword ? "active" : ""}`}
            >
              {isChangingPassword ? "Cancel" : "Change Password"}
            </button>

            <div
              className={`password-input-container ${
                isChangingPassword ? "slide-in" : "slide-out"
              }`}
            >
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
          </div>

          <button type="submit" className="save-button">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
