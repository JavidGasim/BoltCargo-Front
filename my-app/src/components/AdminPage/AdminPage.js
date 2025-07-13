import React, { useEffect, useState } from "react";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import "./AdminPage.css";
import axios from "axios";
import Cookies from "js-cookie";

const AdminPage = () => {
  const [count, setCount] = useState({});
  const generalUrl = "https://localhost:5000/api/v1/";

  async function Count() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + "User/count";
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCount(response.data.count);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }
  useEffect(() => {
    Count();
  }, []);
  return (
    <div style={{ position: "relative", height: "100vh", overflow: "auto" }}>
      {/* Animated Gradient Background */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(45deg, #ff6f61, #6a1b9a, #2a5298, #00bcd4)", // Multiple colors
          animation: "gradientShift 10s ease-in-out infinite", // Smooth gradient animation
          zIndex: "-1",
        }}
      />
      <AdminNavbar />

      <div
        style={{
          textAlign: "center",
          color: "#fff",
          fontSize: "36px",
          fontWeight: "bold",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
          marginTop: "50px",
        }}
      >
        Admin Dashboard
      </div>

      {/* Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "40px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "20px",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <h3>Users</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Users Count : {count.allUsersCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Admins Count : {count.adminsCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Drivers Count : {count.driversCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Clients Count : {count.clientsCount}
          </p>
          <p style={{ fontSize: "16px" }}>
            View and manage users. Check their activity, roles, and details.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "20px",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <h3>Orders</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Orders Count : {count.allOrdersCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Accepted Orders Count : {count.acceptedOrdersCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Un Accepted Orders Count : {count.unAcceptedOrdersCount}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            All Finished Orders Count : {count.finishedOrdersCount}
          </p>
          <p style={{ fontSize: "16px" }}>
            Track and manage customer orders. View order status and details.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "20px",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <h3>Complaints</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            All Complaints Count : {count.allComplaintsCount}
          </p>
          <p style={{ fontSize: "16px" }}>
            View and resolve complaints submitted by users or customers.
          </p>
        </div>
      </div>

      {/* More Functionality Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          marginTop: "40px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "20px",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <h3>Profile</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>Admin</p>
          <p style={{ fontSize: "16px" }}>
            View and edit your admin profile settings.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "20px",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <h3>Logout</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>-</p>
          <p style={{ fontSize: "16px" }}>
            Click to log out of the admin panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
