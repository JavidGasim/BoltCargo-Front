import React, { useState } from "react";
import "./RateStar.css";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { HubConnectionBuilder } from "@microsoft/signalr";


const RateStar = () => {
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { idC } = location.state;
  const generalUrl = "https://localhost:5000/api/v1/";


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
      connection.invoke("AllRating");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

  async function GiveRating(e) {
    e.preventDefault();
    var id = Cookies.get("ratingId");
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `User/rating?id=${id}&rating=${selectedStars}`;
    await axios
      .put(url,{}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        startSignalRConnection();
        navigate("/history");
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  const handleStarClick = (index) => {
    setSelectedStars(index + 1);
  };

  const handleStarHover = (index) => {
    setHoveredStars(index + 1);
  };

  const handleMouseLeave = () => {
    setHoveredStars(0);
  };

  return (
    <div className="rate-container">
      <div className="background-div"></div> {/* Arka plan */}
      <button className="close-button" onClick={() => navigate("/history")}>
        ✖
      </button>
      <div className="stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="star-item" key={index}>
            <span
              className={`star ${
                index < (hoveredStars || selectedStars) ? "active" : ""
              }`}
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              onMouseLeave={handleMouseLeave}
            >
              ★
            </span>
            <span className="number">{index + 1}</span>
          </div>
        ))}
      </div>
      <button className="give-star-button" onClick={(e) => GiveRating(e)}>
        Give Star
      </button>
    </div>
  );
};

export default RateStar;
