import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./AddOrder.css";
import axios from "axios";
import Cookies from "js-cookie";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../../img/addorder.webp";

const AddOrder = ({
  initialKm = 0,
  initialCarType = "",
  initialCurrentLocation = "",
  initialDestination = "",
  initialImagePath = "",
  initialMessage = "",
  initialRoadPrice = 0,
  initialCarPrice = 0,
  initialTotalPrice = 0,
  initialUserId = "",
}) => {
  const [km, setKm] = useState(initialKm);
  const [carType, setCarType] = useState(initialCarType);
  const [currentLocation, setCurrentLocation] = useState(
    initialCurrentLocation
  );
  const [destination, setDestination] = useState(initialDestination);
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [message, setMessage] = useState(initialMessage);
  const [roadPrice, setRoadPrice] = useState(initialRoadPrice);
  const [carPrice, setCarPrice] = useState(initialCarPrice);
  const [totalPrice, setTotalPrice] = useState(initialTotalPrice);
  const [userId, setUserId] = useState(initialUserId);
  const [role, setRole] = useState();
  const [user, setUser] = useState({});
  const [distance, setDistance] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
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
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!allowedFormats.includes(file.type)) {
      alert("Yalnız şəkil formatında fayllara icazə verilir!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePath(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const navigate = useNavigate();

  var generalUrl = "https://localhost:5000/api/v1/";

  async function CurrentUser() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    // setGlobalString(data.username);
    var url = generalUrl + "Account/currentUser";
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
        setRole(response.data.role);

        console.log(response.data.role);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  async function SendEmailNotification() {
    var message = `${user.userName} shared new order.Go check out this order.`;
    var url =
      generalUrl +
      `Email/emailNotificationDrivers?message=${message}&carType=${carType}`;
    await axios
      .post(url)
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  async function ShareOrder() {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    var obj = {
      km: distance,
      carType: carType,
      currentLocation: from,
      destination: to,
      imagePath: imagePath,
      message: message,
      orderDate: new Date(),
      roadPrice: roadPrice,
      carPrice: carPrice,
      totalPrice: roadPrice + carPrice,
      userId: user.id,
    };
    var url = generalUrl + "Order";
    await axios
      .post(url, obj, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // alert(response.data.message);

        // Sipariş eklendikten sonra inputları sıfırlama
        // setKm(0);
        // setCarType("");
        // setCurrentLocation("");
        // setDestination("");
        // setImagePath("");
        // setMessage("");
        // setRoadPrice(0);
        // setCarPrice(0);
        // setTotalPrice(0);
        // setDistance(0);
        // setFrom("");
        // setTo("");
        SendEmailNotification();
        startSignalRConnection();
        navigate("/clientOrders");
      })
      .catch((error) => {
        if (error.response.data.error == "Balance") {
          alert(error.response.data.message);
        }
      });
  }

  const handleChange = (event) => {
    setCarType(event.target.value);
    GetCarPrice(event.target.value);
    // GetTotalPrice();
    // GetRoadPrice();
  };

  const GetRoadPrice = async () => {
    if (carType != "") {
      var name = Cookies.get("username");
      var token = Cookies.get(name);
      // setGlobalString(data.username);
      var url =
        generalUrl + `Price/roadPrice?carType=${carType}&km=${distance}`;
      await axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setRoadPrice(response.data.price);
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    }
  };

  const GetTotalPrice = async () => {
    if (roadPrice != 0 && carPrice != 0) {
      setTotalPrice(roadPrice + carPrice);
    }
  };

  const GetCarPrice = async (carType) => {
    var name = Cookies.get("username");
    var token = Cookies.get(name);
    // setGlobalString(data.username);
    var url = generalUrl + `Price/carPrice?carType=${carType}`;
    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCarPrice(response.data.price);

        console.log(response.data.role);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  useEffect(() => {
    CurrentUser();
  }, []);

  const handleSave = async () => {
    if (!carType || !currentLocation || !destination || !message) {
      alert("inputs cannot be empty");
      return;
    }

    if (error != "") {
      alert("Your locations are incorrect format");
      return;
    }

    await ShareOrder();
    // alert("Order saved successfully!");
  };

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (fromCoords && toCoords) {
      const calculatedDistance = calculateDistance(fromCoords, toCoords);
      setDistance(calculatedDistance);
    }
  }, [fromCoords, toCoords]);

  const fetchSuggestions = async (query, setSuggestions, setCoords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=AZ&q=${query}&format=json&addressdetails=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        setSuggestions(data);
        setError("");
        setCurrentLocation(from);
        setDestination(to);
      } else {
        setSuggestions([]);
        setCoords(null);
        setError("This place not found!");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const calculateDistance = (coords1, coords2) => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
    const lat1 = coords1.lat * (Math.PI / 180);
    const lat2 = coords2.lat * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2)); // Noktadan sonra 2 basamak
  };

  const handleSelect = (place, setCoords, setInput, setSuggestions) => {
    setCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    setInput(place.display_name);
    setSuggestions([]);
  };

  useEffect(() => {
    GetRoadPrice();
    // GetTotalPrice();
  }, [carType]);

  useEffect(() => {
    if (distance != 0) {
      GetRoadPrice();
      // GetTotalPrice();
    }
  }, [distance]);

  useEffect(() => {
    GetTotalPrice();
  }, [carPrice, roadPrice]);

  return (
    <>
      <div
        // className="add-order-card animate-fade-in"
        className="loginForm"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "40px",
          height:"auto", 
          marginBottom:"40px"
        }}
      >
        <h2
          className="add-order-heading animate-heading"
          style={{ color: "white" }}
        >
          Add Order
        </h2>

        <div className="upload-section animate-slide-up">
          <input
            type="file"
            accept="image/*"
            className="image-upload-input"
            onChange={handleImageUpload}
          />
        </div>

        {imagePath && (
          <div className="add-order-image-container animate-slide-up">
            <img
              style={{
                width: "500px",
                height: "230px",
                border: "2px solid black",
                borderRadius: "20px",
              }}
              src={imagePath}
              alt="Order"
              className="add-order-image circular-image animate-scale"
            />
          </div>
        )}

        <div className="add-order-info animate-slide-up">
          {/* <label className="add-order-label">Car Type:</label>
          <input
            type="text"
            className="add-order-input"
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            /> */}
          <label className="add-order-label" style={{ color: "white" }}>
            Car Type
          </label>
          <select
            className="add-order-input"
            name="carType"
            value={carType}
            onChange={handleChange}
          >
            <option value="">Select Car Type</option>{" "}
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        <div className="add-order-info animate-slide-up">
          <label className="add-order-label" style={{ color: "white" }}>
            Message:
          </label>
          <input
            type="text"
            className="add-order-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
          />
        </div>

        {/* Diğer alanlar en alta yerleştirildi */}
        {/* <div className="add-order-info animate-slide-up">
          <label className="add-order-label">Current Location:</label>
          <input
            type="text"
            className="add-order-input"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
          />
        </div>

        <div className="add-order-info animate-slide-up">
          <label className="add-order-label">Destination:</label>
          <input
            type="text"
            className="add-order-input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div> */}

        <div>
          <label className="add-order-label" style={{ color: "white" }}>
            Current Location:
          </label>
          <input
            type="text"
            className="add-order-input"
            placeholder="From"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setFromCoords(null);
              setDistance(0);
              fetchSuggestions(
                e.target.value,
                setFromSuggestions,
                setFromCoords
              );
            }}
          />
          {fromSuggestions.length > 0 && (
            <div>
              {fromSuggestions.map((place, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleSelect(
                      place,
                      setFromCoords,
                      setFrom,
                      setFromSuggestions
                    )
                  }
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    background: "#f0f0f0",
                    margin: "2px 0",
                  }}
                >
                  {place.display_name}
                </div>
              ))}
            </div>
          )}

          <label
            className="add-order-label"
            style={{ marginTop: "30px", color: "white" }}
          >
            Destination:
          </label>
          <input
            type="text"
            className="add-order-input"
            placeholder="To"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setToCoords(null);
              setDistance(0);
              fetchSuggestions(e.target.value, setToSuggestions, setToCoords);
            }}
          />
          {toSuggestions.length > 0 && (
            <div>
              {toSuggestions.map((place, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleSelect(place, setToCoords, setTo, setToSuggestions)
                  }
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    background: "#f0f0f0",
                    margin: "2px 0",
                  }}
                >
                  {place.display_name}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
          )}
        </div>

        <ul className="price-list animate-slide-up">
          <li className="price-item">
            <span className="add-order-label">Distance (km):</span>
            <span className="price-value">{distance.toFixed(2)}</span>
          </li>

          <li className="price-item">
            <span className="add-order-label">Road Price:</span>
            <span className="price-value">{roadPrice.toFixed(2)}</span>
          </li>

          <li className="price-item">
            <span className="add-order-label">Car Price:</span>
            <span className="price-value">{carPrice.toFixed(2)}</span>
          </li>

          <li className="price-item">
            <span className="add-order-label">Total Price:</span>
            <span className="price-value">{totalPrice.toFixed(2)}</span>
          </li>
        </ul>

        {/* Save Button */}
        <div className="add-order-info animate-slide-up">
          <button
            className="save-button"
            onClick={handleSave}
            style={{ backgroundColor: "#00cca6", color: "white" }}
          >
            Add Order
          </button>
        </div>
      </div>
    </>
  );
};

export default AddOrder;
