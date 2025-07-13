import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import "./Navbar.css";
import axios from "axios";
import Cookies from "js-cookie";
import { IconContext } from "react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUser,
  faRoute,
  faArrowRightFromBracket,
  faUsers,
  faWallet,
  faCreditCard,
  faClockRotateLeft,
  faMessage,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import { HubConnectionBuilder } from "@microsoft/signalr";

let connection; // Store the SignalR connection globally for access across functions

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [role, setRole] = useState("");
  const [path2, setPath2] = useState("");
  const [path3, setPath3] = useState("");

  const [sidebars, setSidebars] = useState([]);

  const generalUrl = "https://localhost:5000/api/v1/";

  function CurrentUser() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = `${generalUrl}Account/currentUser`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRole(response.data.role);
        setPath2(response.data.role == "Client" ? "/client" : "/driver");
        setPath3(
          response.data.role == "Client" ? "/clientOrders" : "/driverOrders"
        );

        console.log(response.data.user.id);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    const sidebarItems = [
      {
        title: "Home",
        path: path2,
        icon: <AiIcons.AiFillHome />,
        cName: "nav-text",
      },
      {
        title: "Feedback",
        path: "/feedback",
        icon: <FontAwesomeIcon icon={faComment} />,
        cName: "nav-text",
      },
      {
        title: "Order",
        path: path3,
        icon: <FontAwesomeIcon icon={faRoute} />,
        cName: "nav-text",
      },
      {
        title: "Users",
        path: "/users",
        icon: <FontAwesomeIcon icon={faUsers} />,
        cName: "nav-text",
      },
      {
        title: "Chat",
        path: "/message",
        icon: <FontAwesomeIcon icon={faMessage} />,
        cName: "nav-text",
      },
      {
        title: "History",
        path: "/history",
        icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        cName: "nav-text",
      },
      {
        title: "Rating",
        path: "/rating",
        icon: <FontAwesomeIcon icon={faStar} />,
        cName: "nav-text",
      },
      {
        title: "Profile",
        path: "/profile",
        icon: <FontAwesomeIcon icon={faUser} />,
        cName: "nav-text",
      },
    ];

    if (role == "Driver") {
      sidebarItems.push({
        title: "Balance",
        path: "/balance",
        icon: <FontAwesomeIcon icon={faWallet} />,
        cName: "nav-text",
      });
    }

    if (role == "Client") {
      sidebarItems.push({
        title: "Card",
        path: "/card",
        icon: <FontAwesomeIcon icon={faCreditCard} />,
        cName: "nav-text",
      });
    }

    sidebarItems.push({
      title: "Log Out",
      path: "/",
      icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
      cName: "nav-text",
    });

    setSidebars(sidebarItems);
  }, [path2, role]);

  const showSidebar = () => setSidebar(!sidebar);

  async function startSignalRConnection() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    connection = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/messageHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // connection.onclose(async () => {
    //   console.log("SignalR Disconnected");
    //   await handleAfterDisconnect();
    // });

    try {
      await connection.start();
      console.log("SignalR Connected");
      // connection.invoke("AllUsers");
    } catch (error) {
      console.error("SignalR connection failed:", error);
    }
  }

  // async function handleAfterDisconnect() {
  //   try {
  //     connection.invoke("AllUsers");
  //     console.log("Invoked method after disconnection");
  //   } catch (error) {
  //     console.error("Failed to invoke method after disconnection:", error);
  //   }
  // }

  async function LogOut(path) {
    if (path == "/") {
      if (connection) {
        await connection.invoke("AllUsers");
        await connection.invoke("DisconnectForAdmin");
        await connection.stop();
      }

      const name = Cookies.get("username");
      const token = Cookies.get(name);
      const url = `${generalUrl}Account/logout`;

      try {
        await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User logged out, online status set to false.");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  }

  useEffect(() => {
    startSignalRConnection(); // Start connection on component mount
  }, []);

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {sidebars.map((item, index) => (
              <li key={index} className={item.cName}>
                <Link
                  to={item.path}
                  onClick={async () => await LogOut(item.path)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
