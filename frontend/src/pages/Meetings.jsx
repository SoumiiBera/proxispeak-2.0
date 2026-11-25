
import React, { useState, useEffect } from "react";
import "./Meetings.css";

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Team Meeting");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  // LOAD MEETINGS
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/meetings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load meetings");
        }

        setMeetings(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMeetings();
    } else {
      setLoading(false);
      alert("Please login first.");
    }
  }, [token]);

  // RESET FORM
  const resetForm = () => {
    setTitle("");
    setDate("");
    setTime("");
    setType("Team Meeting");
    setEditingId(null);
  };

  // CREATE OR UPDATE MEETING
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setSaving(true);

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `http://localhost:5000/api/meetings/${editingId}`
        : "http://localhost:5000/api/meetings";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          date: date || "To be decided",
          time: time || "To be decided",
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Meeting operation failed");
      }

      if (isEditing) {
        setMeetings((previous) =>
          previous.map((meeting) =>
            meeting._id === editingId ? data.data : meeting
          )
        );
        alert("Meeting updated successfully!");
      } else {
        setMeetings((previous) => [data.data, ...previous]);
        alert("Meeting created successfully!");
      }

      resetForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // EDIT MEETING
  const editMeeting = (meeting) => {
    setEditingId(meeting._id);
    setTitle(meeting.title);
    setDate(
      meeting.date === "To be decided" ? "" : meeting.date
    );
    setTime(
      meeting.time === "To be decided" ? "" : meeting.time
    );
    setType(meeting.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE MEETING
  const deleteMeeting = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meeting?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/meetings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete meeting");
      }

      setMeetings((previous) =>
        previous.filter((meeting) => meeting._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      alert("Meeting deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="meetings-page">
      <header className="meetings-header">
        <div>
          <h1>🎥 Meetings</h1>
          <p>Manage your team meetings and discussions</p>
        </div>
        <a href="#/dashboard">← Back to Dashboard</a>
      </header>

      <section className="meeting-welcome">
        <h2>Connect with Your Team</h2>
        <p>Create meetings and collaborate with your team members.</p>
      </section>

      <section className="meeting-create">
        <h2>{editingId ? "Edit Meeting" : "Create a Meeting"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter meeting title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Team Meeting">Team Meeting</option>
            <option value="Planning">Planning</option>
            <option value="Discussion">Discussion</option>
            <option value="Review">Review</option>
            <option value="Presentation">Presentation</option>
          </select>

          <button type="submit" disabled={saving}>
            {saving
              ? "Please wait..."
              : editingId
              ? "Update Meeting"
              : "+ Create Meeting"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="meeting-list">
        <h2>Upcoming Meetings</h2>

        {loading ? (
          <p>Loading meetings...</p>
        ) : meetings.length === 0 ? (
          <p className="no-meetings">No meetings available yet.</p>
        ) : (
          meetings.map((meeting) => (
            <div className="meeting-card" key={meeting._id}>
              <div className="meeting-icon">🎥</div>

              <div className="meeting-details">
                <h3>{meeting.title}</h3>
                <p>📅 {meeting.date}</p>
                <p>🕒 {meeting.time}</p>
                <small>{meeting.type}</small>
              </div>

              <span className="meeting-status">
                {meeting.status}
              </span>

              <div className="meeting-actions">
                <button
                  type="button"
                  onClick={() => editMeeting(meeting)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteMeeting(meeting._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Meetings;
