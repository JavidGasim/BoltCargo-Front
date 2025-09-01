import React, { useEffect, useState } from "react";
import "./AdminComplaints.css";
import axios from "axios";
import Cookies from "js-cookie";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/complaints.webp";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const generalUrl = "https://localhost:5000/api/v1/";
  const [connection, setConnection] = useState(null);

  const connectSignalR = async () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    if (!connection) {
      const newConnection = new HubConnectionBuilder()
        .withUrl("https://localhost:5000/messageHub", {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        console.log("SignalR Connected");

        newConnection.on("ReceiveComplaints", () => {
          GetAllComplaints();
        });

        setConnection(newConnection);
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  const GetAllComplaints = () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + "Complaint";
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setComplaints(response.data);
      })
      .catch((error) => {
        console.log(error.response?.data?.message || "An error occurred");
      });
  };

  useEffect(() => {
    GetAllComplaints();
    connectSignalR();
  }, []);

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${process.env.PUBLIC_URL}/mainpagebg.jpg)`,
        backgroundSize: "cover",
        //Arkaplanın tam sığmasını sağlamak için
        backgroundPosition: "center", // Arkaplanı ortalamak için
        backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
        height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
        width: "100vw", // Genişlik tüm ekranı kaplar
        overflow: "auto", // İçeriğin kaydırılmasını sağlar
      }}
    >
      <AdminNavbar />
      <div className="complaints-container">
        <h2 className="complaints-title" >
          Complaints
        </h2>
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="user-section sender">
                <img
                  src={complaint.sender?.imagePath || "/default-user.png"}
                  alt="Sender"
                  className="user-avatar"
                />
                <div>
                  <p className="user-name">
                    {complaint.sender?.userName || "Unknown"}
                  </p>
                  <p className="user-role">This is the sender</p>
                </div>
              </div>

              <div className="complaint-content">
                <p className="complaint-label">Complaint:</p>
                <p className="complaint-text">
                  {complaint.content || "No content provided."}
                </p>
              </div>

              <div className="user-section receiver">
                <img
                  src={complaint.receiver?.imagePath || "/default-user.png"}
                  alt="Receiver"
                  className="user-avatar"
                />
                <div>
                  <p className="user-name">
                    {complaint.receiver?.userName || "Unknown"}
                  </p>
                  <p className="user-role">This is the receiver</p>
                </div>
              </div>

              <div className="complaint-footer">
                <span className="complaint-date">
                  {new Date(complaint.date).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
