import React, { useState, useEffect } from "react";
import "./AdminOrders.css";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import AdminOrderHeader from "./AdminOrderHeader";
import backgroundImage from "../../img/orderAdmin.webp";


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});

  const generalUrl = "https://localhost:5000/api/v1/";  

  const [connection, setConnection] = useState(null);

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
      connection.invoke("AllGivenOrders");
      connection.invoke("AllOrders");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

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

        newConnection.on("ReceiveClientOrders", async () => {
          await GetAllOrders(); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveUser", async () => {
          await GetAllOrders(); // Call fetchUsers when the event is triggered
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  async function CurrentUser() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + "Account/currentUser";
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  async function GetAllOrders() {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Order/clientOrders/${user.id}`;
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        const ordersData = response.data.orders;

        const ordersWithUserInfo = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const userUrl = `${generalUrl}User/${order.driverId}`;
              const userResponse = await axios.get(userUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return { ...order, user: userResponse.data.user };
            } catch (error) {
              // Kullanıcı bulunamadığında veya bir hata oluştuğunda user alanını null olarak ayarla
              return { ...order, user: null };
            }
          })
        );

        setOrders(ordersWithUserInfo);
      })
      .catch((error) => {
        // console.log(error.response.data.message);
      });
  }

  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    if (user.id) {
      GetAllOrders();
      connectSignalR();
    }
  }, [user]);

  const toggleOrderDetails = (index) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleDelete = async (orderId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Order/${orderId}`;
    console.log(`Delete order ${orderId}`);
    await axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        alert(response.data.message);
        startSignalRConnection();
        GetAllOrders();
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  const handleUpdate = (orderId) => {
    console.log(`Update order ${orderId}`);
  };

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
      <AdminOrderHeader />
      <div className="order-card" style={{ marginTop: "35px" }}>
        <h2 className="order-heading">Order Summary</h2>

        <div className="orders-container">
          {orders.map((order, index) => {
            const {
              carType,
              currentLocation,
              destination,
              totalPrice,
              imagePath,
              orderDate,
              isAccept,
              roadPrice,
              carPrice,
              userId,
              driverId,
              user: orderUser,
              message,
            } = order;

            const orderDetails = [
              { label: "Car Type", value: carType },
              { label: "Current Location", value: currentLocation },
              { label: "Destination", value: destination },
              { label: "Total Price", value: `$${totalPrice}` },
              { label: "Distance (km)", value: order.km },
              { label: "Message", value: message },
              {
                label: "Order Date",
                value: new Date(orderDate).toLocaleDateString(),
              },
              { label: "Road Price", value: `$${roadPrice}` },
              { label: "Car Price", value: `$${carPrice}` },
              {
                label: "Accepted Status",
                value: isAccept ? "Accepted" : "Pending",
              },
            ];

            return (
              <div
                key={index}
                className={`order-info ${
                  expandedOrders[index] ? "expanded" : ""
                }`}
                style={{
                  paddingBottom: expandedOrders[index] ? "30px" : "150px",
                }}
                onClick={() => toggleOrderDetails(index)}
              >
                <div className="order-image-container">
                  {imagePath && (
                    <img
                      src={imagePath}
                      alt="Order"
                      className="circular-image"
                      style={{
                        width: "440px",
                        height: "200px",
                        borderRadius: "10px",
                        border: "3px solid lightgray",
                        marginLeft: "10px",
                      }}
                    />
                  )}
                </div>

                <div className="order-details">
                  {orderDetails.slice(0, 4).map(
                    (
                      item,
                      idx // Display first 4 items (including Total Price)
                    ) => (
                      <div key={idx} className="order-detail">
                        <span className="order-label">{item.label}:</span>
                        <span className="order-value">{item.value}</span>
                      </div>
                    )
                  )}
                  {expandedOrders[index] &&
                    orderDetails.slice(4).map((item, idx) => (
                      <div
                        key={idx}
                        className="order-detail additional-details"
                      >
                        <span className="order-label">{item.label}:</span>
                        <span className="order-value">{item.value}</span>
                      </div>
                    ))}
                  {expandedOrders[index] && orderUser && (
                    <div
                      className="user-order-info"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                        padding: "20px",
                      }}
                    >
                      <div
                        className="order-user"
                        style={{ marginRight: "10px" }}
                      >
                        <img
                          src={orderUser.imagePath}
                          alt="User"
                          className="user-photo"
                          style={{
                            borderRadius: "50%",
                            width: "100px",
                            height: "100px",
                          }}
                        />
                      </div>
                      <div>
                        <span
                          className="user-name"
                          style={{ display: "block" }}
                        >
                          {orderUser.userName}
                        </span>
                        <span
                          className="user-email"
                          style={{ display: "block" }}
                        >
                          {orderUser.email}
                        </span>
                      </div>
                      <div
                        className="order-image"
                        style={{
                          position: "absolute",
                          top: 0,
                          right: "0",
                          zIndex: 1,
                        }}
                      ></div>
                    </div>
                  )}
                  {expandedOrders[index] && (
                    <div className="order-buttons">
                      <button
                        className="order-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id);
                        }}
                      >
                        Delete
                      </button>

                      <Link
                        to={`${order.id}`}
                        className="order-button update"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(order.id);
                        }}
                      >
                        Update
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
