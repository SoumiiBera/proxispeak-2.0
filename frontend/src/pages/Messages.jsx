
import React, { useEffect, useState } from "react";
import "./Messages.css";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/messages";

function Messages() {
  const [activeChat, setActiveChat] = useState("ProxiSpeak Team");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const chatNames = ["ProxiSpeak Team", "Project Updates"];

  // LOAD MESSAGES FROM MONGODB
  const loadMessages = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load messages");
      }

      setMessages(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMessages();
    } else {
      setLoading(false);
      alert("Please login first!");
    }
  }, [token]);

  // SEND MESSAGE TO MONGODB
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatName: activeChat,
          text: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setMessages((previous) => [...previous, data.data]);
      setMessage("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chatNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = messages.filter(
    (msg) => msg.chatName === activeChat
  );

  if (loading) {
    return <h2>Loading Messages...</h2>;
  }

  return (
    <div className="messages-page">
      <header className="messages-header">
        <div>
          <h1>💬 Messages</h1>
          <p>Stay connected with your workspace</p>
        </div>

        <Link to="/dashboard" className="messages-back">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="chat-container">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-heading">
            <div>
              <h2>Conversations</h2>
              <p>Your recent chats</p>
            </div>
            <span className="chat-count">{chatNames.length}</span>
          </div>

          <div className="chat-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="conversation-list">
            {filteredChats.map((name) => {
              const lastMessage = messages
                .filter((msg) => msg.chatName === name)
                .slice(-1)[0];

              return (
                <button
                  className={`conversation-item ${
                    activeChat === name ? "active" : ""
                  }`}
                  key={name}
                  onClick={() => setActiveChat(name)}
                >
                  <div
                    className="conversation-avatar"
                    style={{
                      background:
                        name === "ProxiSpeak Team" ? "#7058d8" : "#0ea5e9",
                    }}
                  >
                    {name.charAt(0)}
                  </div>

                  <div className="conversation-details">
                    <strong>{name}</strong>
                    <small>
                      {name === "ProxiSpeak Team"
                        ? "Team Workspace"
                        : "Project Channel"}
                    </small>
                    <p>{lastMessage?.text || "No messages yet"}</p>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <p className="no-conversations">No conversations found.</p>
            )}
          </div>
        </aside>

        <section className="chat-main">
          <div className="chat-topbar">
            <div className="chat-contact">
              <div
                className="conversation-avatar"
                style={{
                  background:
                    activeChat === "ProxiSpeak Team" ? "#7058d8" : "#0ea5e9",
                }}
              >
                {activeChat.charAt(0)}
              </div>

              <div>
                <h3>{activeChat}</h3>
                <span>
                  <i></i> Workspace conversation
                </span>
              </div>
            </div>

            <span className="chat-topbar-icon">•••</span>
          </div>

          <div className="chat-date">
            <span>TODAY</span>
          </div>

          <div className="chat-messages">
            {currentMessages.map((msg) => (
              <div
                className={`message-row ${
                  msg.sender?._id === currentUser.id ||
                  msg.sender === currentUser.id
                    ? "my-message"
                    : ""
                }`}
                key={msg._id}
              >
                <div className="message-bubble">
                  <strong>{msg.senderName || msg.sender?.name}</strong>
                  <p>{msg.text}</p>
                  <small>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            ))}

            {currentMessages.length === 0 && (
              <p className="no-conversations">
                No messages yet. Start the conversation!
              </p>
            )}
          </div>

          <form className="message-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit" disabled={!message.trim() || sending}>
              {sending ? "Sending..." : "Send ➤"}
            </button>
          </form>
        </section>
      </main>

      <footer className="messages-footer">
        ProxiSpeak 2.0 · Team Communication Workspace
      </footer>
    </div>
  );
}

export default Messages;
