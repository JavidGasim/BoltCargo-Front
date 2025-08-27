import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import backgroundImage from "../../img/users.webp";
import Cookies from "js-cookie";
import axios from "axios";
import "./Users.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Font Awesome ikonu

const Users = () => {
  const generalUrl = "https://localhost:5000/api/v1/";
  const [user, setUser] = useState({});
  const [myUsers, setMyUsers] = useState([]);
  const [role, setRole] = useState();
  const [connection, setConnection] = useState(null);
  const [activeReport, setActiveReport] = useState(null); // Aktif report edilen kullanıcı
  const [reportMessage, setReportMessage] = useState(""); // Report mesajı

  const fetchCurrentUser = async () => {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);
      const response = await axios.get(`${generalUrl}Account/currentUser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setRole(response.data.role);
      if (response.data.role) {
        await connectSignalR(); // Role alındığında SignalR bağlantısını başlat
      }
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  };

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
      connection.invoke("AllComplaints");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

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

        newConnection.on("ReceiveUsers", (userDtos) => {
          setMyUsers(userDtos);
        });

        setConnection(newConnection);
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const name = Cookies.get("username");
      const token = Cookies.get(name);

      if (role == "Client" || role == "Driver") {
        const url =
          role == "Client"
            ? `${generalUrl}User/AllDrivers`
            : `${generalUrl}User/AllClients`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyUsers(response.data);
      } else {
        console.log("Role is not 'Client' or 'Driver'. No request made.");
      }
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleReportClick = (userId) => {
    // Toggle the report section for the selected user.
    if (activeReport == userId) {
      setActiveReport(null); // Close the report section if it's already open.
    } else {
      setActiveReport(userId); // Open the report section for the selected user.
    }
    setReportMessage(""); // Reset the report message each time the modal is opened.
  };

  const handleSendReport = async (receiverId) => {
    if (!user || !user.id) {
      console.error("User not found");
      return; // Do nothing if the user object is not loaded.
    }

    if (reportMessage.trim() == "") {
      alert("You cannot send an empty report.");
      return;
    }

    console.log(`Reporting user: ${reportMessage}`);

    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = `${generalUrl}Complaint`;

    const obj = {
      senderId: user.id,
      receiverId: receiverId,
      content: reportMessage,
      date: new Date(),
    };

    try {
      const response = await axios.post(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Optionally update the user data if necessary.
      setUser(response.data.user || user);
      startSignalRConnection();

      // Reset the report section.
      setActiveReport(null);
      setReportMessage("");

      console.log("Report sent successfully.");
    } catch (error) {
      console.error("Failed to send report: ", error.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchCurrentUser(); // Component mount olduğunda kullanıcıyı al
  }, []);

  useEffect(() => {
    if (role) {
      fetchUsers(); // Role ayarlandığında kullanıcıları al
    }
  }, [role]);

  const maxRating = 5;

  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url(${process.env.PUBLIC_URL}/mainpagebg.jpg)`,
          backgroundSize: "cover",
          //Arkaplanın tam sığmasını sağlamak için
          backgroundPosition: "center", // Arkaplanı ortalamak için
          backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
          height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
          width: "100vw", // Genişlik tüm ekranı kaplar
          overflow: "auto", // İçeriğin kaydırılmasını sağlar
        }}
      >
        <Navbar />
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
                {role == "Client" && (
                  <p className="description">{user.carType}</p>
                )}
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

                <p className="role">{role == "Client" ? "Driver" : "Client"}</p>
                <button
                  className="report-button"
                  onClick={() => handleReportClick(user.id)}
                >
                  Report
                </button>
                {activeReport == user.id && (
                  <div
                    className={`report-section ${activeReport ? "open" : ""}`}
                  >
                    <input
                      type="text"
                      placeholder="Write your report..."
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      className="report-input"
                    />
                    <button
                      className="send-report-button"
                      onClick={() => handleSendReport(user.id)}
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Users;
