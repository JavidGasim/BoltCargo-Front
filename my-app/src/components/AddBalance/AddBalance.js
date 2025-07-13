import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddBalance.css";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import Balance from "../Balance/Balance";

const AddBalance = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const navigate = useNavigate();
  const generalUrl = "https://localhost:5000/api/v1/";

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) {
      value = value.replace(/(.{4})(?=.)/g, "$1 ");
    }
    setCardNumber(value);
  };

  async function IncreaseBalance() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Card/cardBalance?cardNumber=${cardNumber}`;
    var obj = {
      bankName: bankName,
      balance: amount,
    };
    await axios
      .put(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => { 
        navigate("/card");
      })

      .catch((error) => {
        if(error.response.data.check == false){
            alert(error.response.data.message);
        }
      });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber && amount && bankName) {
      //   alert(
      //     `$${amount} successfully added to card ${cardNumber} at ${bankName}`
      //   );
      IncreaseBalance();
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goBack = () => {
    navigate("/card");
  };

  return (
    <>
      <Navbar />
      <div className="add-balance-container">
        <div className="form-container">
          <h2 className="header-text">Add Balance to Your Card</h2>
          <form className="add-balance-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter Bank Name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                placeholder="**** **** **** ****"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                min="1"
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              Increase Balance
            </button>
            <button type="button" className="go-back" onClick={goBack}>
              Go Back
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBalance;
