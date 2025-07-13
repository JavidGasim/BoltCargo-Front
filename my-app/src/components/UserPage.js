import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import styles from "./UserPage.module.css";



const UserPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
  
  const handleChange = (event) => {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    // You can add API call here to send user data to server
    toast.success("User Registered Successfully");
  };

  return (
    <div className={styles.container}>
      <form onSubmit={submitHandler} className={styles.formLogin}>
        <h2>User Sign Up</h2>

        <div className={styles.formGroup}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            placeholder="U"
            className={styles.inputField} // Make sure this class is defined
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="E"
            className={styles.inputField} // Make sure this class is defined
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            placeholder="P"
            className={styles.inputField} // Make sure this class is defined
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Sign Up
        </button>

        {/* Link to navigate back to Sign Up page */}
        <div className={styles.backLink}>
          <Link to="/signup" id="backToSignUp">
            Back to Sign Up
          </Link>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UserPage;
