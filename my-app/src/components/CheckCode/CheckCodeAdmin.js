import React, { useState } from "react";
import "./CheckCode.css"; // CSS dosyasını dışarıdan ekliyoruz
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

const CheckCodeAdmin = () => {
  const [code, setCode] = useState();
  const location = useLocation();
  const { adminData, imageUrl } = location.state;
  var generalUrl = "https://localhost:5000/api/v1/";
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const newCode = e.target.value.replace(/[^0-9]/g, ""); // Sadece rakamlar kabul edilir
    setCode(newCode);
  };

  const handleButtonClick = () => {
    // alert(`Entered code: ${code}`);
    var cookiesCode = Cookies.get("code");

    if (code == cookiesCode) {
      RegisterUser();
    } else {
      alert("Your code is invalid");
    }
  };

  function RegisterUser() {
    var url = generalUrl + "Account/register";
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
    <div className="check-code-container">
      <div className="check-code-box">
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
      </div>
    </div>
  );
};

export default CheckCodeAdmin;
