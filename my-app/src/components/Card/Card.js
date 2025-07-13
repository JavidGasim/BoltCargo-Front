import React, { useEffect, useState } from "react";
import "./Card.css";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { FaCopy } from "react-icons/fa"; // Font Awesome ikonu


const Card = () => {
  const [user, setUser] = useState({});
  const [card, setCard] = useState({});
  const generalUrl = "https://localhost:5000/api/v1/";
  const navigate = useNavigate();

  async function CurrentUser() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + "Account/currentUser";
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  async function CurrentCard() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Card/CardWithUserId/${user.id}`;
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCard(response.data.card);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  const handleAddBalance = () => {
    navigate("/addBalance");
  };

  const handleCopyCardNumber = () => {
    navigator.clipboard.writeText(card.cardNumber || "Card Number");
  };

  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    if (user.id) CurrentCard();
  }, [user]);

  return (
    <div
      style={{
        backgroundImage: `url("https://www.shutterstock.com/image-photo/close-female-hand-holds-levitating-600nw-1782418211.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        width: "100vw",
        overflow: "auto",
      }}
    >
      <Navbar />
      <div className="card-container">
        <div className="card-design">
          <h3 className="bank-name">{card.bankName || "Bank Name"}</h3>
          <div className="card-details">
            <span className="balance-label">Current Balance</span>
            <h2 className="balance-amount">${card.balance || "0.00"}</h2>
            <div className="card-number-container">
              <p className="card-number">{card.cardNumber || "Card Number"}</p>
              <h1
                style={{
                  margin: "10px -70px 0px 0px",
                  fontSize: "1.3em",
                  cursor: "pointer",
                }}
                className="copy-button"
                onClick={handleCopyCardNumber}
              >
                <FaCopy className="fas fa-copy"></FaCopy> {/* Font Awesome Copy Icon */}
              </h1>
            </div>
            <p className="expiry-date">09/25</p>
          </div>
          <div className="card-logo">
            <span className="mastercard-logo" />
          </div>
        </div>
        <button className="add-balance-button" onClick={handleAddBalance}>
          Add Balance
        </button>
      </div>
    </div>
  );
};

export default Card;
