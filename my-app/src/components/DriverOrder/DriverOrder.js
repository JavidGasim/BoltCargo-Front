import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../../img/order.webp";

const DriverOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState({});
  const [role, setRole] = useState();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [email, setEmail] = useState();
  const [type, setType] = useState();
  const [id, setId] = useState();
  const [finishedCheck, setFinishedCheck] = useState(false);

  var generalUrl = "https://localhost:5000/api/v1/";

  const [connection, setConnection] = useState(null);
  const navigate = useNavigate();

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
      connection.invoke("AllFinishOrders");
      connection.invoke("GiveRateStar", finishedCheck);
      connection.invoke("DeleteChat");
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

        newConnection.on("ReceiveOrders", async () => {
          await GetAllOrders(); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveUser", async () => {
          await GetAllOrders(); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveRateStar", async (finish) => {
          if (finish) {
            const idC = id;
            navigate("/rateStar", { state: { idC } });
          }
        });

        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

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

  async function GetAllOrders() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    // setGlobalString(data.username);
    var url = generalUrl + `Order/driverOrders/${user.id}`;
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

  const toggleOrderDetails = (index) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleCancel = async (orderId, userId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Order/acceptedOrder/${orderId}`;
    const obj = {
      orderAcceptedDate: new Date(),
      isAccept: false,
      driverId: "no",
    };

    await axios
      .put(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        startSignalRConnection();
        GetAllOrders();
        GetEmail(userId);
        setType("canceled");
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  const handleFinish = async (orderId, userId) => {
    const name = Cookies.get("username");
    const token = Cookies.get(name);
    const url = generalUrl + `Order/driverFinished/${orderId}`;
    var obj = {
      isFinish: true,
    };
    await axios
      .put(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        startSignalRConnection();
        GetAllOrders();
        GetEmail(userId);
        setType("finished");
        setFinishedCheck(response.data.finish);
        setId(userId);
        Cookies.set("ratingId", userId, { expires: 30 });
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  useEffect(() => {
    CurrentUser();
    // alert(role)
  }, []);

  useEffect(() => {
    if (user.id) {
      GetAllOrders();
      connectSignalR();
    }
  }, [user]);

  const handleMessage = () => {
    navigate("/message");
  };

  async function SendEmailNotification() {
    var message = `${user.userName} ${type} your order.`;
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
      if (finishedCheck) {
        startSignalRConnection();
        const idC = id;
        navigate("/rateStar", { state: { idC } });
      }
    }
  }, [email]);

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
      <Navbar />
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
              orderAcceptedDate,
              isAccept,
              roadPrice,
              carPrice,
              userId,
              driverId,
              message,
              user: orderUser,
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
                      {!order.isDriverFinish ? (
                        <button
                          className="order-button delete"
                          style={{ margin: "auto", backgroundColor: "green" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinish(order.id, userId);
                          }}
                        >
                          Finish
                        </button>
                      ) : (
                        <span>Wait for the client to finish</span>
                      )}
                      <button
                        style={{ margin: "auto" }}
                        className="order-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(order.id, userId);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="order-button delete"
                        style={{ margin: "auto", backgroundColor: "blue" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessage(order.id);
                        }}
                      >
                        Message
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

export default DriverOrder;
