import React, { useState, useEffect, useContext } from "react";
import "./AnotherFeedback.css";
import axios from "axios";
import Cookies from "js-cookie";
import FeedbackHeader from "../FeedbackHeader";
import { GlobalContext } from "../GlobalContext";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/feedback.webp";

const AnotherFeedback = () => {
  const [myFeedBacks, setMyFeedBacks] = useState([]);
  const [user, setUser] = useState({});
  const { globalString, setGlobalString } = useContext(GlobalContext);
  const [connection, setConnection] = useState(null);

  const generalUrl = "https://localhost:5000/api/v1/";

  const CurrentUser = async () => {
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
  };

  const FeedBacks = async () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const userId = user.id;
    const url = generalUrl + `FeedBack/anotherFeedBacks/${userId}`;

    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMyFeedBacks(response.data.anotherFeedBacks);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

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

        newConnection.on("ReceiveFeedBacks", async () => {
          await FeedBacks(); // Call fetchUsers when the event is triggered
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    if (user.id) {
      FeedBacks();
      connectSignalR();
    }
  }, [user]);

  return (
    <>
      <div
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
        <FeedbackHeader />
        <div className="another-feedback-container">
          <h2>Other People's Feedback</h2>
          <div className="feedback-list">
            {myFeedBacks.length > 0 ? (
              myFeedBacks.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <h3>{feedback.name}</h3>
                  <p>{feedback.content}</p>
                </div>
              ))
            ) : (
              <p>No feedback available yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnotherFeedback;
