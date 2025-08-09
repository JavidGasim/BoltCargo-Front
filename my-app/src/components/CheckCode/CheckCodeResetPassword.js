import React, { useState } from "react";
import "./CheckCode.css"; // CSS dosyasını dışarıdan ekliyoruz
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CheckCodeResetPassword = () => {
  const [code, setCode] = useState();
  const location = useLocation();
  const { data, imageUrl } = location.state;
  var generalUrl = "https://localhost:5000/api/v1/";
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const newCode = e.target.value.replace(/[^0-9]/g, ""); // Sadece rakamlar kabul edilir
    setCode(newCode);
  };

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [checkMail, setCheckMail] = useState(false);

  const handleButtonClick = () => {
    // alert(`Entered code: ${code}`);
    var cookiesCode = Cookies.get("code");

    if (newPassword !== newPasswordRepeat) {
      // alert("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (code == cookiesCode) {
      //   RegisterUser();
      setCheckMail(true);

      if (checkMail) {
        ResetPassword();
      }
    } else {
      // alert("Your code is invalid");
      toast.error("Your code is invalid");
    }
  };

  //   function RegisterUser() {
  //     var url = generalUrl + "Account/register";
  //     var obj = {
  //       username: data.userName,
  //       surname: data.surName,
  //       name: data.name,
  //       email: data.email,
  //       password: data.password,
  //       carType: "no",
  //       imagePath: imageUrl,
  //       role: "Client",
  //       bankName: data.bankName,
  //       cardNumber: data.cardNumber,
  //       phoneNumber: data.phoneNumber,
  //     };

  //     axios
  //       .post(url, obj)
  //       .then((response) => {
  //         console.log(response.data.message);
  //         navigate("/login");
  //       })
  //       .catch((error) => {
  //         if (error.response) {
  //           console.log("Status:", error.response.data.status);
  //           console.log("Message:", error.response.data.message);
  //           console.log("Errors:", error.response.data.error);
  //         } else {
  //           console.log("An unexpected error occurred.");
  //         }
  //       });
  //   }

  function ResetPassword() {
    var url = generalUrl + "Account/reset-password";

    console.log(data);

    var obj = {
      username: Cookies.get("username"), // Əgər username olaraq email istifadə edirsinizsə
      email: Cookies.get("email"),
      newPassword: newPassword,
      confirmNewPassword: newPasswordRepeat, // varsa inputda
      token: code,
    };

    console.log(obj);

    axios
      .post(url, obj)
      .then((response) => {
        console.log(response.data.message);
        navigate("/login");
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

  return (
    <div
      className="check-code-container"
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
      {/* <div className="check-code-box">
        <h1 style={{ color: "white", marginTop: "-10px" }}>EMAIL CODE</h1>
        <input
          type="text"
          value={code}
          onChange={handleInputChange}
          placeholder="Enter code"
          className="check-code-input"
        />
        <button onClick={handleButtonClick} className="check-code-button">
          Check Code
        </button>
      </div> */}

      {checkMail ? (
        <div
          className="loginForm"
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            height: "40%",
          }}
        >
          <h1 style={{ color: "white", marginTop: "-10px" }}>RESET PASSWORD</h1>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="check-code-input"
            style={{ width: "300px" }}
          />
          <input
            type="password"
            value={newPasswordRepeat}
            onChange={(e) => setNewPasswordRepeat(e.target.value)}
            placeholder="Repeat new password"
            className="check-code-input"
            style={{ width: "300px" }}
          />
          <button
            onClick={handleButtonClick}
            className="check-code-button"
            style={{ backgroundColor: "#00cca6" }}
          >
            Reset Password
          </button>
        </div>
      ) : (
        <div
          className="loginForm"
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            height: "40%",
          }}
        >
          <h1 style={{ color: "white", marginTop: "-10px" }}>EMAIL CODE</h1>
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="Enter code"
            className="check-code-input"
            style={{ width: "300px" }}
          />
          <button
            onClick={handleButtonClick}
            className="check-code-button"
            style={{ backgroundColor: "#00cca6" }}
          >
            Check Code
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckCodeResetPassword;
