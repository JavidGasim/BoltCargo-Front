import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";
import AdminOrderHeader from "./AdminOrderHeader";
import backgroundImage from "../../img/orderAdmin.webp";

const AdminUnAcceptedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState({});
  const [role, setRole] = useState();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [connection, setConnection] = useState(null);

  const generalUrl = "https://localhost:5000/api/v1/";

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

  const CurrentUser = () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + "Account/currentUser";

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
        setRole(response.data.role);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  const GetAllOrders = async () => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    let url = `${generalUrl}Order/unAcceptedOrders`;

    if (url) {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = response.data;

        const ordersWithUserInfo = await Promise.all(
          ordersData.map(async (order) => {
            let userUrl = `${generalUrl}User/${order.userId}`;

            const userResponse = await axios.get(userUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });

            return {
              ...order,
              user: userResponse.data.user,
            };
          })
        );

        setOrders(ordersWithUserInfo);
      } catch (error) {
        console.log(error.response.data.message);
      }
    }
  };

  const toggleOrderDetails = (index) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  useEffect(() => {
    CurrentUser();
  }, []);

  useEffect(() => {
    if (role && user.id) {
      GetAllOrders();
      connectSignalR();
    }
  }, [role, user]);

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
      <AdminOrderHeader />
      <div className="order-card" style={{ marginTop: "35px" }}>
        <h2 className="order-heading">UnAccepted Orders</h2>

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
            } = order;

            const orderDetails = [
              { label: "Car Type", value: carType },
              { label: "Current Location", value: currentLocation },
              { label: "Destination", value: destination },
              { label: "Total Price", value: `$${totalPrice}` },
              { label: "Distance (km)", value: order.km },
              { label: "Message", value: order.message },
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
                  position: "relative", // For positioning the overlay image
                  paddingBottom: expandedOrders[index] ? "30px" : "150px",
                }}
                onClick={() => toggleOrderDetails(index)}
              >
                {/* Overlay image */}
                <div
                  className="order-overlay"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                  }}
                ></div>

                <div className="order-image-container" style={{ zIndex: 0 }}>
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

                <div className="order-details" style={{ zIndex: 0 }}>
                  {orderDetails.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="order-detail">
                      <span className="order-label">{item.label}:</span>
                      <span className="order-value">{item.value}</span>
                    </div>
                  ))}

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
                        <h1 style={{ fontSize: "0.8em" }}>Client Info</h1>
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

export default AdminUnAcceptedOrders;
