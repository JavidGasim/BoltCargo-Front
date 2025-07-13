import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "./AdminHeader.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminNavbar from "../AdminNavbar/AdminNavbar";

const AdminHeader = () => {
  const generalUrl = "https://localhost:5000/api/v1/";
  const [user, setUser] = useState({});
  const [myUsers, setMyUsers] = useState([]);
  const [role, setRole] = useState();
  const [connection, setConnection] = useState(null);
  const [filterRole, setFilterRole] = useState(""); // Filtreleme durumu

  const navigate = useNavigate();

  return (
    <>
      <AdminNavbar />
      <div className="button-container">
        <button
          className="filter-button all-users-button"
          onClick={() => navigate("/adminAllUsers")}
        >
          All Users
        </button>
        <button
          className="filter-button admin-button"
          onClick={() => navigate("/allAdmin")}
        >
          Admin
        </button>
        <button
          className="filter-button driver-button"
          onClick={() => navigate("/adminAllDriver")}
        >
          Driver
        </button>
        <button
          className="filter-button client-button"
          onClick={() => navigate("/adminAllClient")}
        >
          Client
        </button>
      </div>
    </>
  );
};

export default AdminHeader;
