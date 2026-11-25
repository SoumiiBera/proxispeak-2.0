
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const socket = io("http://localhost:5000", {
      transports: ["polling"],
      auth: {
        token,
     },
   });
    const updateOnlineCount = async () => {
      try {
        const response = await fetch(`${API_URL}/online-count`);
        if (!response.ok) throw new Error("Online count failed");

        const data = await response.json();
        setOnlineCount(data.onlineCount || 0);
      } catch (error) {
        console.error("Online count error:", error);
      }
    };

    socket.on("connect", updateOnlineCount);

    const onlineInterval = setInterval(updateOnlineCount, 3000);

    const loadDashboard = async () => {
      try {
        const [teamRes, meetingRes, messageRes, registrationRes] =
          await Promise.all([
            fetch(`${API_URL}/users/team`, { headers }),
            fetch(`${API_URL}/meetings`, { headers }),
            fetch(`${API_URL}/messages`, { headers }),
            fetch(`${API_URL}/users/registration-count`, { headers }),
          ]);

        if (
          !teamRes.ok ||
          !meetingRes.ok ||
          !messageRes.ok ||
          !registrationRes.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const teamData = await teamRes.json();
        const meetingData = await meetingRes.json();
        const messageData = await messageRes.json();
        const registrationData = await registrationRes.json();

        setTeamMembers(Array.isArray(teamData) ? teamData : []);
        setMeetings(Array.isArray(meetingData) ? meetingData : []);
        setMessages(Array.isArray(messageData) ? messageData : []);
        setRegistrationCount(registrationData.total || 0);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    updateOnlineCount();

    return () => {
      socket.disconnect();
      clearInterval(onlineInterval);
    };
  }, [navigate]);

  const stats = [
    {
      icon: "👥",
      label: "Total Members",
      value: String(registrationCount).padStart(2, "0"),
      color: "purple",
    },
    {
      icon: "🟢",
      label: "Online Members",
      value: String(onlineCount).padStart(2, "0"),
      color: "green",
    },
    {
      icon: "🎥",
      label: "Active Meetings",
      value: String(
        meetings.filter((meeting) => meeting.status === "Scheduled").length
      ).padStart(2, "0"),
      color: "blue",
    },
    {
      icon: "💬",
      label: "Messages",
      value: String(messages.length).padStart(2, "0"),
      color: "orange",
    },
  ];

  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/";
};

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">P</span>
          <h2>ProxiSpeak<span> 2.0</span></h2>
        </div>

        <p className="menu-title">WORKSPACE</p>

        <nav>
          <Link className="active" to="/dashboard"><span>⌂</span> Dashboard</Link>
          <Link to="/office"><span>▦</span> Virtual Office</Link>
          <Link to="/team"><span>♧</span> Team Members</Link>
          <Link to="/meetings"><span>◉</span> Meetings</Link>
          <Link to="/messages"><span>✉</span> Messages</Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/settings">⚙ Settings</Link>
          <button onClick={logout}>↪ Logout</button>
        </div>

        <div className="sidebar-note">
          <span>✨</span>
          <strong>Work together.</strong>
          <small>Stay connected with your team.</small>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="topbar-label">WORKSPACE OVERVIEW</p>
            <h2>Dashboard</h2>
            <p className="topbar-subtitle">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="user-profile">
            <div className="notification">♧</div>
            <div className="user-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <strong>{user.name || "User"}</strong>
              <small>{user.role || "Team Member"}</small>
            </div>
          </div>
        </header>

        <section className="welcome-card">
          <div className="welcome-content">
            <span className="welcome-tag">YOUR DIGITAL WORKSPACE</span>
            <h1>Make teamwork feel closer. ✨</h1>
            <p>
              Connect, collaborate and communicate with your team
              in one virtual workspace.
            </p>
            <button onClick={() => navigate("/office")}>
              Enter Virtual Office <span>→</span>
            </button>
          </div>

          <div className="welcome-illustration">
            <div className="welcome-circle">🏢</div>
            <span className="floating-icon">💬</span>
            <span className="floating-icon second">🎥</span>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item, index) => (
            <div className="stat-card" key={index}>
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
              <p>{item.label}</p>
              <h2>{loading ? "..." : item.value}</h2>
              <small>Workspace overview</small>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="content-card">
            <div className="section-heading">
              <div>
                <span className="section-label">YOUR WORKSPACE</span>
                <h3>Team Members</h3>
              </div>
              <Link to="/team">View All →</Link>
            </div>

            {loading ? (
              <p>Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p>No team members found.</p>
            ) : (
              teamMembers.slice(0, 4).map((member, index) => (
                <div className="team-member" key={member._id || index}>
                  <div
                    className="member-avatar"
                    style={{
                      backgroundColor: ["#8b5cf6", "#ec4899", "#0ea5e9", "#16a34a"][index % 4],
                    }}
                  >
                    {(member.name || "U").charAt(0).toUpperCase()}
                  </div>

                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <small>{member.role || "Team Member"}</small>
                  </div>

                  <span className="status offline">● Offline</span>
                </div>
              ))
            )}
          </div>

          <div className="content-card quick-actions">
            <div className="section-heading">
              <div>
                <span className="section-label">GET STARTED</span>
                <h3>Quick Actions</h3>
              </div>
            </div>

            <Link to="/meetings" className="action-item">
              <span className="action-icon purple">🎥</span>
              <span><strong>Meetings</strong><small>View your meetings</small></span>
              <b>→</b>
            </Link>

            <Link to="/messages" className="action-item">
              <span className="action-icon blue">💬</span>
              <span><strong>Messages</strong><small>Open team conversations</small></span>
              <b>→</b>
            </Link>

            <Link to="/office" className="action-item">
              <span className="action-icon green">🏢</span>
              <span><strong>Virtual Office</strong><small>Explore your workspace</small></span>
              <b>→</b>
            </Link>

            <Link to="/team" className="action-item">
              <span className="action-icon orange">👤</span>
              <span><strong>Team Members</strong><small>View team profiles</small></span>
              <b>→</b>
            </Link>
          </div>
        </section>

        <footer className="dashboard-footer">
          © 2026 ProxiSpeak 2.0 · Built for better collaboration.
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
