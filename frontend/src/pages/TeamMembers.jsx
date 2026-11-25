
import React, { useEffect, useState } from "react";
import "./TeamMembers.css";
import { Link } from "react-router-dom";

function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/users/team",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load team members");
        }

        setMembers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const colors = ["#8b5cf6", "#ec4899", "#0ea5e9", "#f59e0b"];

  const onlineCount = 0;

  return (
    <div className="team-page">
      <header className="team-header">
        <div className="team-heading">
          <div className="team-heading-icon">👥</div>
          <div>
            <h1>Team Members</h1>
            <p>Manage your team and stay connected</p>
          </div>
        </div>

        <Link to="/dashboard" className="team-back-btn">
          ← Back to Dashboard
        </Link>
      </header>

      <section className="team-welcome">
        <div>
          <span className="team-welcome-tag">YOUR WORKSPACE</span>
          <h2>Meet Your Team</h2>
          <p>
            Stay connected, collaborate and grow together
            with ProxiSpeak 2.0.
          </p>
        </div>
        <div className="team-welcome-icon">🤝</div>
      </section>

      <section className="team-summary">
        <div className="team-summary-card">
          <span className="summary-icon purple">👥</span>
          <div>
            <strong>{String(members.length).padStart(2, "0")}</strong>
            <span>Total Members</span>
          </div>
        </div>

        <div className="team-summary-card">
          <span className="summary-icon green">🟢</span>
          <div>
            <strong>{String(onlineCount).padStart(2, "0")}</strong>
            <span>Online Now</span>
          </div>
        </div>

        <div className="team-summary-card">
          <span className="summary-icon orange">🌙</span>
          <div>
            <strong>00</strong>
            <span>Away</span>
          </div>
        </div>

        <div className="team-summary-card">
          <span className="summary-icon gray">⚫</span>
          <div>
            <strong>00</strong>
            <span>Offline</span>
          </div>
        </div>
      </section>

      <section className="team-members-section">
        <div className="team-section-heading">
          <div>
            <h2>All Members</h2>
            <p>Your workspace members</p>
          </div>
          <span className="team-count">
            {members.length} Members
          </span>
        </div>

        {loading && <p>Loading team members...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && members.length === 0 && (
          <p>No team members registered yet.</p>
        )}

        <div className="team-grid">
          {members.map((member, index) => (
            <div className="team-card" key={member._id}>
              <div className="team-card-top">
                <span className="team-status">
                  <span></span> Offline
                </span>
                <span className="team-more">•••</span>
              </div>

              <div
                className="team-avatar"
                style={{
                  backgroundColor: colors[index % colors.length],
                }}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>

              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>

              <div className="team-email">
                <span>✉</span>
                {member.email}
              </div>

              <div className="team-card-divider"></div>

              <div className="team-card-footer">
                <span>Team Profile</span>
                <button
                  onClick={() =>
                    alert(`Welcome, ${member.name}!`)
                  }
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="team-footer">
        ProxiSpeak 2.0 · Bringing Teams Together
      </footer>
    </div>
  );
}

export default TeamMembers;
