import React, { useEffect, useState, useContext } from "react";
import Navbar from "../Navbar/Navbar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { notify } from "../toast";
import "./NewFeedback.css"; // Import the CSS for animation and design
import FeedbackHeader from "../FeedbackHeader";
import Cookies from "js-cookie";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/feedback.webp";

const NewFeedBack = () => {
  // Add name state to store user's name
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState({});
  const { globalString, setGlobalString } = useContext(GlobalContext);

  var generalUrl = "https://localhost:5000/api/v1/";

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

  async function CurrentUser() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    var url = generalUrl + "Account/currentUser";
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);

        console.log(response.data.user);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  useEffect(() => {
    CurrentUser();
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim() && feedback.trim()) {
      if (name.length >= 3 && feedback.length >= 5) {
        var username = Cookies.get("username");
        var token = Cookies.get(username);
        var url = generalUrl + "FeedBack";
        var obj = {
          name: name,
          content: feedback,
          userId: user.id,
        };

        axios
          .post(url, obj, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log(response.data.message);
            setSubmitted(true);
            startSignalRConnection();
          });
      } else if (name.length < 4) {
        alert("Name should be 3 symbol");
        setSubmitted(false);
      } else if (feedback.length < 6) {
        alert("Feedback should be 5 symbol");
        setSubmitted(false);
      }
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setFeedback("");
  };

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
        <div className="feedback-container animated-fade-in">
          <h2>Share Your Feedback!</h2>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Name field */}
              <div className="form-group animated-slide-up">
                <label htmlFor="name">Your Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Feedback field */}
              <div className="form-group animated-slide-up">
                <label htmlFor="feedback">Your Feedback:</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think..."
                  required
                />
              </div>
              <button type="submit" className="submit-btn animated-grow">
                Submit
              </button>
            </form>
          ) : (
            <div className="thank-you-message animated-fade-in">
              <h3>Thank you for your feedback, {name}!</h3>{" "}
              {/* Display name after submission */}
              <button onClick={handleReset} className="reset-btn animated-grow">
                Submit more feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewFeedBack;
