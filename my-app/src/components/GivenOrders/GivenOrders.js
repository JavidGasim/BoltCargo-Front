import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { generatePath, Link, useNavigate } from "react-router-dom";
import "./GivenOrders.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/driver.webp";


const GivenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();

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
      connection.invoke("AllClientOrders");
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

        newConnection.on("ReceiveGivenOrders", async () => {
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
    const url = generalUrl + `Order/ordersWithCarType?carType=${user.carType}`;

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
            const userUrl = `${generalUrl}User/${order.userId}`;
            const userResponse = await axios.get(userUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { ...order, user: userResponse.data.user };
          })
        );

        setOrders(ordersWithUserInfo);
      })
      .catch((error) => {
        console.log(error.response.data.message);
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

  const createChat = async (userId, senderId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url =
      generalUrl +
      `Request/acceptRequest?userId=${userId}&senderId=${senderId}`;
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {})
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  async function SendEmailNotification() {
    var message = `${user.userName} accepted your order.`;
    var url =
      generalUrl + `Email/emailNotification?email=${email}&message=${message}`;
    await axios
      .post(url)
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  async function GetEmail(id) {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    var url = generalUrl + `User/email/${id}`;
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEmail(response.data.email);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  useEffect(() => {
    if (email != null) {
      SendEmailNotification();
      navigate("/driverOrders");
    }
  }, [email]);

  const handleAccept = async (orderId, senderId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const obj = {
      orderAcceptedDate: new Date(),
      isAccept: true,
      driverId: user.id,
    };
    const url = generalUrl + `Order/acceptedOrder/${orderId}`;
    await axios
      .put(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        // if (connection) {
        //   await connection.invoke("AllClientOrders"); // Ensure this matches the backend method's signature
        // }
        GetEmail(senderId);
        createChat(user.id, senderId);
        startSignalRConnection();
        GetAllOrders();
        
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
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
      width: "100%", // Genişlik tüm ekranı kaplar
      overflow: "auto", // İçeriğin kaydırılmasını sağlar
    }}
    >
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
              user: orderUser,
              message,
            } = order;

            const mainDetails = [
              { label: "Car Type", value: carType },
              { label: "Current Location", value: currentLocation },
              { label: "Destination", value: destination },
              {
                label: "Order Date",
                value: new Date(orderDate).toLocaleDateString(),
              },
            ];

            const additionalDetails = [
              { label: "Total Price", value: `$${totalPrice}` },
              { label: "Distance (km)", value: order.km },
              { label: "Message", value: message },
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
                      className="square-image" // Change class name from circular-image to square-image
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
                  {/* Display main details always */}
                  {mainDetails.map((item, idx) => (
                    <div key={idx} className="order-detail">
                      <span className="order-label">{item.label}:</span>
                      <span className="order-value">{item.value}</span>
                    </div>
                  ))}

                  {/* Display additional details on click */}
                  {expandedOrders[index] &&
                    additionalDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="order-detail additional-details"
                      >
                        <span className="order-label">{item.label}:</span>
                        <span className="order-value">{item.value}</span>
                      </div>
                    ))}

                  {/* User info and order image section */}
                  {expandedOrders[index] && (
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
                        <a
                          href={`tel:${orderUser.phoneNumber}`}
                          className="user-name"
                          style={{ display: "block" }}
                        >
                          {orderUser.phoneNumber}
                        </a>
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
                        style={{ backgroundColor: "green", margin: "auto" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(order.id, order.userId);
                        }}
                      >
                        Accept
                      </button>
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

export default GivenOrders;
