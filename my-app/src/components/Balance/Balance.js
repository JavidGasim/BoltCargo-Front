import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./Balance.css";
import axios from "axios";
import Cookies from "js-cookie";
import backgroundImage from "../../img/balance.webp";

const Balance = () => {
  const [balanceData, setBalanceData] = useState({
    carPrice: 0,
    totalPrice: 0,
    roadPrice: 0,
    orderCount: 0,
  });
  const [role, setRole] = useState();
  const [user, setUser] = useState({});

  var generalUrl = "https://localhost:5000/api/v1/";

  function CurrentUser() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    // setGlobalString(data.username);
    var url = generalUrl + "Account/currentUser";
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
        setRole(response.data.role);
        // GetAllOrders(response.data.user.id);

        console.log(response.data.role);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  function GetBalance() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    // setGlobalString(data.username);
    var url = generalUrl + `Price/balance/${user.id}`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setTimeout(() => {
          setBalanceData({
            carPrice: response.data.totalCarPrice,
            totalPrice: response.data.totalPrice,
            roadPrice: response.data.totalRoadPrice,
            ordersCount: response.data.ordersCount,
          });
        }, 500);
        // alert(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  // Fake veri yüklemesi veya API çağrısı
  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    GetBalance();
  }, [user]);

  return (
    <>
      <Navbar />
      <div
        className="balance-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          //Arkaplanın tam sığmasını sağlamak için
          backgroundAttachment: "fixed", // Kaydırma sırasında sabit tutar
          height: "100vh", // Görüntüyü görünüm alanına uyacak şekilde yapar
          width: "100%", // Genişlik tüm ekranı kaplar
          overflow: "auto", // İçeriğin kaydırılmasını sağlar
        }}
      >
        <h2 className="balance-heading">Balance Dashboard</h2>
        <div className="balance-card">
          <ul className="balance-list">
            <li className="balance-item">
              <span className="balance-label">Orders Count</span>
              <span
                className="balance-value"
                data-value={balanceData.ordersCount}
              >
                {balanceData.ordersCount}
              </span>
            </li>
            <li className="balance-item">
              <span className="balance-label">Car Price</span>
              <span className="balance-value" data-value={balanceData.carPrice}>
                ${balanceData.carPrice}
              </span>
            </li>
            <li className="balance-item">
              <span className="balance-label">Road Price</span>
              <span
                className="balance-value"
                data-value={balanceData.roadPrice}
              >
                ${balanceData.roadPrice}
              </span>
            </li>
            <li className="balance-item">
              <span className="balance-label">Total Price</span>
              <span
                className="balance-value"
                data-value={balanceData.totalPrice}
              >
                ${balanceData.totalPrice}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Balance;
