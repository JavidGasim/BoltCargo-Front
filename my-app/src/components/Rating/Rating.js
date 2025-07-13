import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import "./Rating.css";
import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Font Awesome ikonu
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/rating.webp";

const Rating = () => {
  const [user, setUser] = useState({});
  const [animate, setAnimate] = useState(false);
  const [connection, setConnection] = useState(null);
  const generalUrl = "https://localhost:5000/api/v1/";

  const connectSignalR = async () => {
    if (!connection) {
      const name = Cookies.get("username");
      const token = Cookies.get(name);
      const newConnection = new HubConnectionBuilder()
        .withUrl("https://localhost:5000/messageHub", {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        console.log("SignalR Connected");

        newConnection.on("ReceiveRating", async () => {
          await CurrentUser(); // Call fetchUsers when the event is triggered
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

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
        setTimeout(() => setAnimate(true), 500);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  useEffect(() => {
    CurrentUser();
    connectSignalR();
  }, []);

  const ratingAverage = parseFloat(user.ratingAverage) || 0; // Ortalama
  const maxRating = 5;

  return (
    <>
      <Navbar />
      <div
        className="rating-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          //Arkaplanın tam sığmasını sağlamak için
          backgroundPosition: "center", // Arkaplanı ortalamak için
          backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
          height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
          width: "98%", // Genişlik tüm ekranı kaplar
          overflow: "auto", // İçeriğin kaydırılmasını sağlar
        }}
      >
        <div className="rating-card">
          <div className="rating-header">
            <div className="rating-user-info">
              <h3>{user.userName}</h3>
              <p>
                {user.name} {user.surname}
              </p>
            </div>
            <div className="rating-stats">
              <h4>Total Rating: {user.totalRating}</h4>
              <p>Rating Count: {user.ratingCount} people</p>
              <h4 className={`rating-average ${animate ? "visible" : ""}`}>
                Rating Average: {ratingAverage.toFixed(1)}
              </h4>
            </div>
          </div>

          <div className="rating-stars">
            <div className="stars">
              {Array.from({ length: maxRating }).map((_, index) => {
                const fraction = Math.max(
                  0,
                  Math.min(1, ratingAverage - index)
                ); // Kısmi doluluk (0 ile 1 arasında)

                if (fraction == 1) {
                  return <FaStar key={index} color="#ffcc00" />;
                } else if (fraction > 0) {
                  return <FaStarHalfAlt key={index} color="#ffcc00" />;
                } else {
                  return <FaStar key={index} color="#ccc" />;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rating;
