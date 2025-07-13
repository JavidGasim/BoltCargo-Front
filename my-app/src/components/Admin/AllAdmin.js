import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import "./AdminAllUsers.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminHeader from "./AdminHeader";
import backgroundImage from "../../img/usersadmin.webp";


const AllAdmin = () => {
  const generalUrl = "https://localhost:5000/api/v1/";
  const [user, setUser] = useState({});
  const [myUsers, setMyUsers] = useState([]);
  const [role, setRole] = useState();
  const [connection, setConnection] = useState(null);

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

        newConnection.on("ReceiveAdminConnect", async () => {
          await fetchUsers(); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveUser", async () => {
          await fetchUsers(); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveAdminDisConnect", async () => {
          await fetchUsers(); // Call fetchUsers when the event is triggered
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + "User/AllAdmins";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyUsers(response.data);
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    fetchUsers(); // Role ayarlandığında kullanıcıları al
    connectSignalR();
  }, []);

  async function Ban(id) {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + `User/BanUser/${id}`;
      const ban = true;
      const response = await axios.put(url, ban, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchUsers();
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  }

  async function UnBan(id) {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + `User/BanUser/${id}`;
      const ban = false;
      const response = await axios.put(url, ban, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchUsers();

      // alert(response.data.message);
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  }

  return (
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
      <AdminHeader />
      <div className="header-container">
        <h1 className="main-header">These Are All Admins</h1>
      </div>
      <div className="grid-container">
        {myUsers.map((user) => (
          <div
            key={user.id}
            className="card"
            style={{
              border: user.isOnline ? "solid 3px green" : "solid 3px red",
              marginTop: "50px",
              marginLeft: "50px",
            }}
          >
            <img
              src={`${user.imagePath}`}
              alt="Profile"
              className="profile-img"
            />
            <div className="card-content">
              <h2 className="name">{user.userName}</h2>
              <div className="status-container">
                <div
                  className={`status-circle ${
                    user.isOnline ? "online" : "offline"
                  }`}
                ></div>
                <p>{user.isOnline ? "Online" : "Offline"}</p>
              </div>
              <p className="description">{user.email}</p>
              {/* {!user.isBan ? (
                <button
                  className="button"
                  onClick={() => Ban(user.id)}
                  style={{ backgroundColor: "red" }}
                >
                  BAN
                </button>
              ) : (
                <div>
                  
                  <span
                    onClick={() => UnBan(user.id)}
                    style={{ color: "red",fontStyle:"italic" }}
                  >
                    Get a Banned Acoount
                  </span>
                </div>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAdmin;
