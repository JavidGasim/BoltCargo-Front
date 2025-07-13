import React, { useState, useEffect, useContext } from "react";
import usernameIcon from "../img/user.png";
import passwordIcon from "../img/password.png";
import styles from "./SignUp.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notify } from "./toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { GlobalContext } from "./GlobalContext";
import { HubConnectionBuilder } from "@microsoft/signalr";
import backgroundImage from "../img/login.webp";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  async function startSignalRConnection() {
    // const name = Cookies.get("username");
    const token = Cookies.get(data.username);
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/messageHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    try {
      await connection.start();
      console.log("SignalR Connected");
      connection.invoke("AllUsers");
      connection.invoke("ConnectForAdmin");
      // alert("SignalR isledi");
    } catch (error) {
      console.error("SignalR connection failed: ", error);
    }
  }

  const navigate = useNavigate();
  const [touched, setTouched] = useState({});
  const [role, setRole] = useState();
  const [click, setClick] = useState(false);
  const { globalString, setGlobalString } = useContext(GlobalContext);

  var generalUrl = "https://localhost:5000/api/v1/Account/";

  function CurrentUser() {
    var token = Cookies.get(data.username);

    // setGlobalString(data.username);
    var url = generalUrl + "currentUser";
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRole(response.data.role);

        console.log(response.data.role);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  // useEffect(() =>{
  //   CurrentUser();
  // },[]);

  function LoginUser() {
    var url = generalUrl + "login";
    var obj = {
      username: data.username,
      password: data.password,
    };

    axios
      .post(url, obj)
      .then((response) => {
        // console.log(response.data.token);
        toast.success("Login is Successfully");
        Cookies.set(data.username, response.data.token, { expires: 30 });
        Cookies.set("username", data.username, { expires: 30 });
        CurrentUser();
        startSignalRConnection();
        // alert(Cookies.get(data.username));
      })
      .catch((error) => {
        // console.log(error.response.data.message);

        if (error.response.data.error == "BAN") {
          toast.error(error.response.data.message);
        } else if (data.username != "") {
          toast.error("Not found User!");
        }
      });
  }

  const changeHandler = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const focusHandler = (event) => {
    setTouched({ ...touched, [event.target.name]: true });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    // setClick(true);
    LoginUser();
  };

  useEffect(() => {
    if (role == "Client") {
      navigate("/client");
    } else if (role == "Driver") {
      navigate("/driver");
    } else if (role == "Admin") {
      navigate("/admin");
    }
  }, [role]);

  return (
    <div
      className={styles.container}
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
      <form
      style={{marginTop: "-100px"}}
        className={styles.formLogin}
        onSubmit={submitHandler}
        autoComplete="off"
      >
        <h2>Sign In</h2>

        <div
          style={{ position: "relative", maxWidth: "300px", margin: "0 auto" }}
        >
          <input
            type="text" // Change input type to text
            name="username" // Change to username
            value={data.username} // Change to username state
            placeholder="Username" // Change placeholder to Username
            onChange={changeHandler}
            onFocus={focusHandler}
            required
            autoComplete="off"
            style={{ width: "100%", padding: "8px" }}
          />
          <img
            src={usernameIcon} // Change icon to username icon
            alt="Username"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "300px",
            margin: "20px auto 0",
          }}
        >
          <input
            type="password"
            name="password"
            value={data.password}
            placeholder="Password"
            onChange={changeHandler}
            onFocus={focusHandler}
            required
            autoComplete="off"
            minLength={8}
            style={{ width: "100%", padding: "8px" }}
          />
          <img
            src={passwordIcon}
            alt="Password"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            maxWidth: "300px",
            margin: "20px auto",
            padding: "10px",
          }}
        >
          Login
        </button>

        <span
          style={{
            color: "#a29494",
            textAlign: "center",
            display: "block",
            marginTop: "10px",
          }}
        >
          Don't have an account? <Link to="/signup">Create account</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
};

export default Login;
