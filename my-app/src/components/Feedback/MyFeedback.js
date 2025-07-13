import React, { useState, useEffect, useContext } from "react";
import FeedbackHeader from "../FeedbackHeader";
import axios from "axios";
import Cookies from "js-cookie";
import "./MyFeedback.css";
import { GlobalContext } from "../GlobalContext";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/feedback.webp";

const MyFeedback = () => {
  const [myFeedBacks, setMyFeedBacks] = useState([]);
  const [user, setUser] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  const { globalString, setGlobalString } = useContext(GlobalContext);

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
      connection.invoke("AllFeedBacks");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

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
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response.data.message);
        setLoading(false);
      });
  };

  const FeedBacks = async () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const userId = user.id;
    const url = generalUrl + `FeedBack/myFeedBacks/${userId}`;

    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMyFeedBacks(response.data.myFeedBacks);
      })
      .catch((error) => {
        setError(error.response.data.message);
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

  const deleteFeedback = (feedbackId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = `${generalUrl}FeedBack/${feedbackId}`;

    axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        FeedBacks();
        startSignalRConnection();
      })
      .catch((error) => {
        setError(error.response ? error.response.data.message : error.message);
      });
  };

  useEffect(() => {
    CurrentUser();
    connectSignalR();
  }, []);

  useEffect(() => {
    FeedBacks();
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
          <h2>My Feedback</h2>
          <div className="feedback-list">
            {myFeedBacks.length > 0 ? (
              myFeedBacks.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <h3>{feedback.name}</h3>
                  <p>{feedback.content}</p>
                  <button
                    className="delete-button"
                    onClick={() => deleteFeedback(feedback.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No feedback available yet.</p>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default MyFeedback;
