import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./Message.css"; // CSS dosyası ekleniyor
import { HubConnectionBuilder } from "@microsoft/signalr";
import Navbar from "../Navbar/Navbar";

const Message = () => {
  const generalUrl = "https://localhost:5000/api/v1/";
  const [model, setModel] = useState([]); // Sohbetler
  const [currentMessages, setCurrentMessages] = useState([]); // Aktif sohbet mesajları
  const [newMessage, setNewMessage] = useState(""); // Yeni mesaj
  // const [receiverId, setReceiverId] = useState();
  // const [senderId, setSenderId] = useState();
  const [connection, setConnection] = useState(null);
  const [chat, setChat] = useState({});

  async function startSignalRConnection(receiverId, senderId) {
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
      connection.invoke("AllMessages", receiverId, senderId);
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

        newConnection.on("ReceiveMessages", async (receiverId, senderId) => {
          // alert(chat.receiverId);
          await GetAllMessages(receiverId, senderId); // Call fetchUsers when the event is triggered
        });

        newConnection.on("ReceiveDeleteChat", async () => {
          // alert(chat.receiverId);
          await fetchChats();
        });
        
        setConnection(newConnection); // Save the connection
      } catch (error) {
        console.error("SignalR connection failed: ", error);
      }
    }
  };

  async function fetchChats(id = "") {
    const url = `${generalUrl}Chat/Chats?id=${id}`;
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModel(response.data.allChats);
      setCurrentMessages(response.data.allChats.currentChat.messages);
      // setChat(response.data.allChats.currentChat);
      // setReceiverId(response.data.allChats.currentChat.receiverId);
      // setSenderId(response.data.allChats.currentChat.senderId);
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  }

  useEffect(() => {
    fetchChats(); // İlk sohbet yüklemesi
    connectSignalR();
  }, []);

  // useEffect(() => {
  //   setSenderId(chat.senderId);
  //   setReceiverId(chat.receiverId);
  // },[chat])

  async function GetAllMessages(receiverId, senderId) {
    const url = `${generalUrl}Chat/AllMessages?receiverId=${receiverId}&senderId=${senderId}`;
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentMessages(response.data.messages);
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  }

  const sendMessage = async (receiverId, senderId) => {
    if (!newMessage.trim()) return;

    const obj = {
      content: newMessage,
      receiverId: receiverId,
      senderId: senderId,
      dateTime: new Date(),
    };

    const url = `${generalUrl}Chat/AddMessage`;
    const name = Cookies.get("username");
    const token = Cookies.get(name);

    try {
      await axios.post(url, obj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // setReceiverId(receiverId);
      // setSenderId(senderId);
      startSignalRConnection(receiverId, senderId);
      GetAllMessages(receiverId, senderId); // Mesajları yenile
      setNewMessage(""); // Mesaj kutusunu temizle
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <>
      <Navbar />
      <div className="message-container">
        <div className="sidebar">
          {model.chats &&
            model.chats.map((item, index) => (
              <div
                key={index}
                className={`chat-item ${
                  model.currentReceiver == item.receiverId ? "active" : ""
                }`}
                onClick={() => fetchChats(item.receiverId)}
              >
                <img
                  src={item.receiver?.imagePath || "/default-avatar.png"}
                  alt="avatar"
                  className="avatar"
                />
                <div className="chat-info">
                  <h4>{item.receiver?.userName || "Unknown User"}</h4>
                  <span
                    className={`status ${
                      item.receiver?.isOnline ? "online" : "offline"
                    }`}
                  >
                    {item.receiver?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            ))}
        </div>

        <div className="chat-area">
          {model.currentUserName && (
            <>
              <div className="chat-header">
                <img
                  src={model.currentReceiverImage || "/default-avatar.png"}
                  alt="profile"
                  className="header-avatar"
                />
                <h2>{model.currentUserName}</h2>
              </div>

              <div className="chat-body">
                {currentMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.receiverId == model.currentUserId
                        ? "incoming"
                        : "outgoing"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="time">
                      {new Date(message.dateTime).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  onClick={() =>
                    sendMessage(
                      model.currentChat.receiverId,
                      model.currentChat.senderId
                    )
                  }
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Message;
