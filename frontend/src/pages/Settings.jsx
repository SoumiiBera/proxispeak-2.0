
import React, { useEffect, useState } from "react";
import "./Settings.css";
import { Link } from "react-router-dom";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [notifications, setNotifications] = useState({
    messages: true,
    meetings: true,
    updates: false,
  });

  const [privacy, setPrivacy] = useState({
    onlineStatus: true,
    profileVisibility: true,
  });

  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // LOAD SETTINGS FROM BACKEND
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!token) {
          alert("Please login first!");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/users/settings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load settings");
        }

        setProfile(data.profile);
        setNotifications(data.notifications);
        setPrivacy(data.privacy);
        setTheme(data.theme);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE SETTINGS TO MONGODB
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/users/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile,
            notifications,
            privacy,
            theme,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      alert("Settings saved successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2>Loading Settings...</h2>;
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Manage your account and workspace preferences</p>
        </div>

        <Link to="/dashboard" className="settings-back">
          ← Back to Dashboard
        </Link>
      </header>

      <section className="settings-welcome">
        <div>
          <span>ACCOUNT PREFERENCES</span>
          <h2>Personalize Your Workspace</h2>
          <p>Customize your ProxiSpeak experience according to your preferences.</p>
        </div>
        <div className="settings-welcome-icon">⚙️</div>
      </section>

      <form onSubmit={handleSave}>
        <div className="settings-layout">
          <div className="settings-main">

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon purple">👤</div>
                <div>
                  <h3>Profile Information</h3>
                  <p>Update your personal information</p>
                </div>
              </div>

              <div className="settings-form-grid">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                  />
                </label>

                <label className="full-width">
                  Role
                  <input
                    type="text"
                    name="role"
                    value={profile.role}
                    onChange={handleProfileChange}
                  />
                </label>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon orange">🔔</div>
                <div>
                  <h3>Notifications</h3>
                  <p>Choose which notifications you receive</p>
                </div>
              </div>

              <div className="settings-options">
                {[
                  ["messages", "New Messages", "Get notified about new messages"],
                  ["meetings", "Meeting Reminders", "Receive upcoming meeting reminders"],
                  ["updates", "Project Updates", "Receive workspace announcements"],
                ].map(([key, title, description]) => (
                  <label className="settings-option" key={key}>
                    <div>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [key]: e.target.checked,
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon green">🔒</div>
                <div>
                  <h3>Privacy Settings</h3>
                  <p>Control your profile visibility</p>
                </div>
              </div>

              <div className="settings-options">
                {[
                  ["onlineStatus", "Show Online Status", "Allow teammates to see when you are online"],
                  ["profileVisibility", "Profile Visibility", "Allow teammates to view your profile"],
                ].map(([key, title, description]) => (
                  <label className="settings-option" key={key}>
                    <div>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy[key]}
                      onChange={(e) =>
                        setPrivacy({
                          ...privacy,
                          [key]: e.target.checked,
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon blue">🎨</div>
                <div>
                  <h3>Appearance</h3>
                  <p>Choose your preferred workspace theme</p>
                </div>
              </div>

              <div className="theme-options">
                {["light", "dark", "system"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`theme-choice ${
                      theme === item ? "selected" : ""
                    }`}
                    onClick={() => setTheme(item)}
                  >
                    <span className={`theme-preview ${item}`}>
                      {item === "light" ? "☀️" : item === "dark" ? "🌙" : "💻"}
                    </span>
                    <strong>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </strong>
                    <small>
                      {theme === item ? "Selected" : "Select theme"}
                    </small>
                  </button>
                ))}
              </div>
            </section>

            <div className="settings-save-area">
              <button
                type="submit"
                className="settings-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes →"}
              </button>
            </div>
          </div>

          <aside className="settings-sidebar">
            <div className="settings-account-card">
              <div className="settings-account-avatar">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <h3>{profile.name}</h3>
              <p>{profile.role}</p>
              <span>● Online</span>
            </div>

            <div className="settings-help-card">
              <div>💡</div>
              <h3>Need Help?</h3>
              <p>
                Manage your preferences to make your workspace more comfortable.
              </p>
              <Link to="/dashboard">Go to Dashboard →</Link>
            </div>
          </aside>
        </div>
      </form>

      <footer className="settings-footer">
        ProxiSpeak 2.0 · Workspace Settings
      </footer>
    </div>
  );
}

export default Settings;
