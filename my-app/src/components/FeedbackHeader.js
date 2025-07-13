// FeedBackHeader.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import "./FeedbackHeader.css";

const FeedBackHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="feedback-menu animated-fade-in">
        <ul className="feedback-header">
          <li className="header" onClick={() => navigate("/new-feedback")}>
            New Feedback
          </li>
          <li className="header" onClick={() => navigate("/my-feedback")}>
            My Feedback
          </li>
          <li className="header" onClick={() => navigate("/another-feedback")}>
            Another Feedback
          </li>
        </ul>
      </div>
    </>
  );
};

export default FeedBackHeader;
