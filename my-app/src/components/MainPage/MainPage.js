import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="mainpageContainer">
      <header className="mainpageHeader">
        <div className="headerLogo">
          <img src="./boltcargologobgtrans.png" alt="bolt cargo logo" />
        </div>
        <div className="headerButtons">
          <button
            onClick={() => navigate("/login")}
            style={{
              marginRight: "10px",
              backgroundColor: "transparent",
              color: "white",
              border: "2px solid transparent",
              fontSize: "1.2em",
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              backgroundColor: "#00CCA6",
              color: "white",
              fontSize: "1.2em",
              border: "2px solid #00CCA6",
              borderRadius: "5px",
            }}
          >
            Register
          </button>
        </div>
      </header>
      <main className="mainpageMain">
        <h1>Digital platform for cargo transportation</h1>
        <p>
          Ecosystem of services for transport logistics Transport tenders | Spot
          auctions | TMS | Cargo tracking
        </p>
        <button
          style={{
            backgroundColor: "#00CCA6",
            color: "white",
            fontSize: "20px",
            border: "2px solid #00CCA6",
            borderRadius: "5px",
            cursor: "pointer",
            width: "200px",
            height: "50px",
            marginTop: "40px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/login")}
        >
          Try it
        </button>

        <div className="mainpageCardsContainer">
          <div className="mainpageCard">
            <img src="./handshake.png" alt="handshake" />
            <p>More than 6,000 carriers already work with us</p>
          </div>
          <div className="mainpageCard">
            <img src="./truck.png" alt="plane" />
            <p>Over 100,000 deliveries per year</p>
          </div>
          <div className="mainpageCard" style={{ backgroundColor: "#00CCA6" }}>
            <img
              src="./insurance.png"
              alt="plane"
              style={{ width: "100px", height: "100px" }}
            />
            <p style={{ color: "white", marginTop: "50px" }}>
              Own security service
            </p>
          </div>
        </div>
      </main>
      <footer className="mainpageFooter">
        <div className="mainpageFooterLeftSide">
          <h1>For carriers</h1>
          <div>
            <div class="circle-icon">✅</div>
            <p>
              All cargo owners on one platform – participate in auctions and
              tenders, receive profitable orders
            </p>
          </div>
          <div>
            <div class="circle-icon">✅</div>

            <p>
              Only profitable flights - our carriers earn more than 200,000
              rubles per year from each car
            </p>
          </div>
          <div>
            <div class="circle-icon">✅</div>
            <p>Load guarantee - we have over 70,000 flights</p>
          </div>
        </div>
        <div className="mainpageFooterRightSide">
          <button>Join us</button>
        </div>
      </footer>
    </div>
  );
}
