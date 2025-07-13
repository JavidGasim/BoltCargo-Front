import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import "./AdminAllUsers.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminHeader from "./AdminHeader";
import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Font Awesome ikonu
import backgroundImage from "../../img/usersadmin.webp";


const AdminAllClient = () => {
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

        newConnection.on("ReceiveComplaints", async () => {
          await fetchUsers();
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  const fetchUserReportCounts = async (users) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const reportCounts = {};

    await Promise.all(
      users.map(async (user) => {
        try {
          const url = `${generalUrl}Complaint/receiverComplaintsCount/${user.id}`;
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          reportCounts[user.id] = response.data.count;
        } catch (error) {
          console.error(
            `Failed to fetch report count for user ${user.id}:`,
            error
          );
          reportCounts[user.id] = 0;
        }
      })
    );

    return reportCounts;
  };

  const fetchUsers = async () => {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + "User/AllClients";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data;

      // Hesabat saylarını əlavə edin
      const counts = await fetchUserReportCounts(users);

      // Rolları əlavə edin

      const usersWithDetails = users.map((user) => ({
        ...user,
        reportCount: counts[user.id] || 0,
      }));

      setMyUsers(usersWithDetails);
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

      // alert(response.data.message);
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

  const maxRating = 5;

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
        <h1 className="main-header">These Are All Clients</h1>
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
              <div className="rating-stars">
                <div className="stars">
                  {Array.from({ length: maxRating }).map((_, index) => {
                    const fraction = Math.max(
                      0,
                      Math.min(1, parseFloat(user.ratingAverage) - index)
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

              <p className="report-count">Reports: {user.reportCount || 0}</p>

              {!user.isBan ? (
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
                    style={{ color: "red", fontStyle: "italic" }}
                  >
                    Get a Banned Acoount
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAllClient;
