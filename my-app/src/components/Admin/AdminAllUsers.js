import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import "./AdminAllUsers.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminHeader from "./AdminHeader";
import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Font Awesome ikonu
import backgroundImage from "../../img/usersadmin.webp";

const AdminAllUsers = () => {
  const generalUrl = "https://localhost:5000/api/v1/";
  const [myUsers, setMyUsers] = useState([]);
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
          await fetchUsers();
        });

        newConnection.on("ReceivecUser", async () => {
          await fetchUsers();
        });

        newConnection.on("ReceiveAdminDisConnect", async () => {
          await fetchUsers();
        });

        newConnection.on("ReceiveComplaints", async () => {
          await fetchUsers();
        });

        setConnection(newConnection);
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  // Fetch user roles
  const fetchUserRoles = async (users) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const userRoles = {};

    await Promise.all(
      users.map(async (user) => {
        try {
          const url = `${generalUrl}User/userRole/${user.id}`;
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userRoles[user.id] = response.data.role; // Rol məlumatını saxla
        } catch (error) {
          console.error(`Failed to fetch role for user ${user.id}:`, error);
          userRoles[user.id] = "Unknown"; // Sorğu uğursuz olsa, default dəyər
        }
      })
    );

    return userRoles;
  };

  // Fetch users and their details
  const fetchUsers = async () => {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + "User";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = response.data;

      // Hesabat saylarını əlavə edin
      const counts = await fetchUserReportCounts(users);

      // Rolları əlavə edin
      const roles = await fetchUserRoles(users);

      const usersWithDetails = users.map((user) => ({
        ...user,
        reportCount: counts[user.id] || 0,
        role: roles[user.id] || "Unknown",
      }));

      setMyUsers(usersWithDetails);
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  };

  // Fetch user report counts
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

  // Ban user
  async function Ban(id) {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + `User/BanUser/${id}`;
      const ban = true;
      await axios.put(url, ban, {
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

  // Unban user
  async function UnBan(id) {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      const url = generalUrl + `User/BanUser/${id}`;
      const ban = false;
      await axios.put(url, ban, {
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

  useEffect(() => {
    fetchUsers();
    connectSignalR();
  }, []);

  const maxRating = 5;

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
      <AdminHeader />
      <div className="header-container">
        <h1 className="main-header" style={{ color: "#060b26" }}>These Are All Users</h1>
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

              {user.role != "Admin" && (
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
              )}

              {/* Report Count yalnız Admin olmayan istifadəçilər üçün */}
              <p className="role" style={{ textTransform: "uppercase" }}>
                {user.role}
              </p>
              {user.role != "Admin" && (
                <p className="report-count">Reports: {user.reportCount || 0}</p>
              )}

              {/* Role display */}

              {user.role != "Admin" &&
                (!user.isBan ? (
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
                      Get a Banned Account
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAllUsers;
