
import React, { useEffect, useState, useRef } from "react";
import "./VirtualOffice.css";
import { Link } from "react-router-dom";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import { createVoiceManager } from "../services/webrtc";

const MOVE_STEP = 20;
const EARSHOT_RADIUS = 100;

const DEFAULT_OBSTACLES = [
  {
    type: "wall",
    x: 420,
    y: 250,
    width: 10,
    height: 100,
    blocksSound: true,
  },
  {
    type: "wall",
    x: 200,
    y: 420,
    width: 250,
    height: 20,
    blocksSound: true,
  },
];

function VirtualOffice() {
  const [members, setMembers] = useState([]);
  const [nearbyMembers, setNearbyMembers] = useState([]);
  const [myId, setMyId] = useState("");
  const [myPosition, setMyPosition] = useState({ x: 450, y: 300 });
  const [dragging, setDragging] = useState(false);
  const [obstacles, setObstacles] = useState(DEFAULT_OBSTACLES);
  const [micOn, setMicOn] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const voiceRef = useRef(null);

  const socketRef = useRef(null);
  const roomRef = useRef(null);
  const positionRef = useRef({ x: 450, y: 300 });
  const keysRef = useRef(new Set());
  const targetRef = useRef(null);

  const colors = ["#8b5cf6", "#ec4899", "#0ea5e9", "#f59e0b"];

  const hairStyles = [
    "hair-short",
    "hair-curly",
    "hair-long",
    "hair-spiky",
  ];

  const outfitStyles = [
    "outfit-formal",
    "outfit-casual",
    "outfit-hoodie",
    "outfit-smart",
  ];

  // Move avatar and send position to the server.
  const moveAvatarTo = (newX, newY) => {
    if (!roomRef.current || !socketRef.current || !myId) return;

    const room = roomRef.current;

    const x = Math.max(70, Math.min(newX, room.clientWidth - 70));
    const y = Math.max(70, Math.min(newY, room.clientHeight - 70));

    const newPosition = { x, y };

    positionRef.current = newPosition;
    setMyPosition(newPosition);

    setMembers((previous) =>
      previous.map((member) =>
        member.userId === myId ? { ...member, x, y } : member
      )
    );

    socketRef.current.emit("moveAvatar", newPosition);
  };

  const handleMicToggle = async () => {
  try {
    if (!voiceRef.current) return;

    if (!micOn) {
      await voiceRef.current.start();
      voiceRef.current.unmute();
      setMicOn(true);
      setVoiceError("");
    } else {
      voiceRef.current.mute();
      setMicOn(false);
    }
  } catch (error) {
    console.error("Microphone error:", error);
    setVoiceError(
      error.name === "NotAllowedError"
        ? "Microphone permission denied. Please allow microphone access."
        : error.message || "Could not access microphone."
    );
  }
};

  // Socket connection and event listeners.
  useEffect(() => {
    const token = localStorage.getItem("token");

    socket.auth = { token };
    connectSocket();

    socketRef.current = socket;
    voiceRef.current = createVoiceManager(socket);
    
    socket.on("roomLayout", (room) => {
      if (room && Array.isArray(room.obstacles)) {
        if (room.obstacles.length > 0) {
          setObstacles(room.obstacles);
        } else {
          setObstacles(DEFAULT_OBSTACLES);

          socket.emit("saveRoomLayout", {
            obstacles: DEFAULT_OBSTACLES,
          });
        }
      }
    });

    socket.on("connect", () => {
      setMyId(socket.id);
      socket.emit("getRoomLayout");

      setTimeout(() => {
        socket.emit("getAvatars");
        socket.emit("getNearbyAvatars");
      }, 1000);
    });

    socket.on("currentAvatars", (avatars) => {
      console.log(
        "Received avatars:",
        JSON.stringify(avatars, null, 2)
      );

      setMembers(avatars);

      const ownAvatar = avatars.find(
        (member) => member.userId === socket.id
      );

      if (ownAvatar) {
        const position = {
          x: ownAvatar.x ?? 450,
          y: ownAvatar.y ?? 300,
        };

        positionRef.current = position;
        setMyPosition(position);
      }
    });

    socket.on("nearbyAvatars", (avatars) => {
      console.log(
        "FRONTEND BLOCK STATUS:",
        JSON.stringify(avatars, null, 2)
      );

      voiceRef.current?.updateNearbyUsers(avatars);
      setNearbyMembers(avatars);
    });

    socket.on("avatarMoved", (avatar) => {
      setMembers((previous) => {
        const exists = previous.some(
          (member) => member.userId === avatar.userId
        );

        if (exists) {
          return previous.map((member) =>
            member.userId === avatar.userId
              ? { ...member, ...avatar }
              : member
          );
        }

        return [...previous, avatar];
      });

      if (avatar.userId === socket.id) {
        const position = {
          x: avatar.x,
          y: avatar.y,
        };

        positionRef.current = position;
        setMyPosition(position);
      }
    });

    socket.on("avatarLeft", ({ userId }) => {
      setMembers((previous) =>
        previous.filter((member) => member.userId !== userId)
      );

      setNearbyMembers((previous) =>
        previous.filter((member) => member.userId !== userId)
      );
    });

    return () => {
      voiceRef.current?.stop();


      socket.off("roomLayout");
      socket.off("connect");
      socket.off("currentAvatars");
      socket.off("nearbyAvatars");
      socket.off("avatarMoved");
      socket.off("avatarLeft");

      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  // Continuous WASD and Arrow Keys movement.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(key)
      ) {
        event.preventDefault();
        keysRef.current.add(key);
        targetRef.current = null;
      }
    };

    const handleKeyUp = (event) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    const handleBlur = () => {
      keysRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    const movementInterval = setInterval(() => {
      if (!myId || !roomRef.current) return;

      const keys = keysRef.current;

      let x = positionRef.current.x;
      let y = positionRef.current.y;

      if (keys.has("w") || keys.has("arrowup")) y -= 5;
      if (keys.has("s") || keys.has("arrowdown")) y += 5;
      if (keys.has("a") || keys.has("arrowleft")) x -= 5;
      if (keys.has("d") || keys.has("arrowright")) x += 5;

      if (
        x !== positionRef.current.x ||
        y !== positionRef.current.y
      ) {
        moveAvatarTo(x, y);
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);

      clearInterval(movementInterval);
    };
  }, [myId]);

  // Click an empty place to walk smoothly.
  const handleRoomClick = (event) => {
    if (dragging) return;
    if (event.target.closest(".office-member")) return;

    const rect = roomRef.current.getBoundingClientRect();

    const x =
      event.clientX - rect.left - roomRef.current.clientLeft;

    const y =
      event.clientY - rect.top - roomRef.current.clientTop;

    targetRef.current = { x, y };
  };

  // Drag own avatar.
  const handleMouseDown = (event, member) => {
    if (member.userId !== myId) return;

    event.preventDefault();

    const position = {
      x: member.x ?? 450,
      y: member.y ?? 300,
    };

    positionRef.current = position;
    setMyPosition(position);
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (event) => {
    if (!dragging || !roomRef.current || !socketRef.current) return;

    const rect = roomRef.current.getBoundingClientRect();

    const x =
      event.clientX - rect.left - roomRef.current.clientLeft;

    const y =
      event.clientY - rect.top - roomRef.current.clientTop;

    moveAvatarTo(x, y);
  };

  return (
    <div className="office-page">
      <header className="office-header">
        <div className="office-brand">
          <div className="office-brand-icon">P</div>

          <div>
            <h1>Virtual Workspace</h1>
            <p>Welcome to your team's digital office</p>
          </div>
        </div>

        <Link to="/dashboard" className="office-back">
          ← Dashboard
        </Link>
      </header>

      <section className="office-welcome">
        <div>
          <span className="office-tag">
            PROXISPEAK 2.0 WORKSPACE
          </span>

          <h2>Work better, together. ✨</h2>

          <p>
            Your virtual space for teamwork and collaboration.
          </p>
        </div>

        <div className="office-welcome-icon">🏢</div>
      </section>

      <section className="office-info">
        <div className="office-info-card">
          <span className="office-info-icon">🟢</span>

          <div>
            <strong>Online</strong>
            <small>Office Status</small>
          </div>
        </div>

        <div className="office-info-card">
          <span className="office-info-icon">👥</span>

          <div>
            <strong>{members.length} Members</strong>
            <small>Connected Users</small>
          </div>
        </div>

        <div className="office-info-card">
          <span className="office-info-icon">📍</span>

          <div>
            <strong>Main Office</strong>
            <small>Workspace Location</small>
          </div>
        </div>
      </section>

      <section className="voice-controls">
        <button type="button" onClick={handleMicToggle}>
          {micOn ? "🎤 Microphone On" : "🔇 Turn Microphone On"}
        </button>

        {voiceError && <p role="alert">{voiceError}</p>}
      </section>

      <main
        className="office-room"
        ref={roomRef}
        onClick={handleRoomClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="room-topbar">
          <div>
            <span className="room-live-dot"></span>
            <strong>MAIN WORKSPACE</strong>
          </div>

          <span className="room-time">
            ✦ Collaboration Zone
          </span>
        </div>

        <div className="meeting-area">
          <div className="meeting-icon">🎥</div>
          <h3>Meeting Room</h3>
          <p>Team Collaboration Space</p>
          <span className="meeting-status">
            READY TO CONNECT
          </span>
        </div>

        {obstacles
          .filter((obstacle) => obstacle.type === "wall")
          .map((wall, index) => (
            <div
              key={`wall-${index}`}
              className="office-wall"
              style={{
                left: `${wall.x}px`,
                top: `${wall.y}px`,
                width: `${wall.width}px`,
                height: `${wall.height}px`,
              }}
            />
          ))}

        <div className="office-desks">
  {members.map((member, index) => {
    const nearbyInfo = nearbyMembers.find(
      (nearby) => nearby.userId === member.userId
    );

    return (
      <div
        className="office-member"
        onMouseDown={(event) =>
          handleMouseDown(event, member)
        }
        onClick={(event) => event.stopPropagation()}
        key={member.userId}
        style={{
          left: `${member.x ?? 450}px`,
          top: `${member.y ?? 300}px`,
        }}
      >
        {member.userId !== myId && nearbyInfo && (
          <div
            className={`proximity-ring ${
              nearbyInfo.blocked ? "blocked" : "clear"
            }`}
          />
        )}

        {member.userId === myId && (
          <div className="earshot-range" />
        )}

        <div className="desk-surface">
          <div className="office-avatar">
            <div
              className={`human-hair ${
                hairStyles[index % hairStyles.length]
              }`}
            ></div>

            <div className="human-face">
              <span className="human-eye left-eye"></span>
              <span className="human-eye right-eye"></span>
              <span className="human-smile"></span>
            </div>

            <div
              className={`human-body ${
                outfitStyles[index % outfitStyles.length]
              }`}
              style={{
                backgroundColor: colors[index % colors.length],
              }}
            ></div>

            <span className="avatar-online"></span>
          </div>

          <div className="desk-monitor">▣</div>
          <div className="desk-keyboard"></div>
        </div>

        <div className="member-name-tag">
          <strong>
            {member.userId === myId
              ? `${member.name || "You"} (You)`
              : member.name || `Member ${index + 1}`}
          </strong>

          <small>{member.role || "Team Member"}</small>
          <span>● Online</span>
        </div>
      </div>
    );
  })}
</div>

        {members.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Connecting to workspace...
          </p>
        )}

        <div className="office-decoration plant-one">🪴</div>
        <div className="office-decoration plant-two">🌿</div>
        <div className="office-decoration coffee">☕</div>
        <div className="office-decoration bookshelf">📚</div>
        <div className="office-decoration lamp">💡</div>

        <div className="room-floor-label">
          PROXISPEAK • TEAM SPACE
        </div>
      </main>

      <section className="office-bottom">
        <div>
          <h3>👥 Your Workspace Team</h3>
          <p>Meet the people in your virtual office.</p>

          <h3>📍 Nearby Team Members</h3>

          {nearbyMembers.length === 0 ? (
            <p>No one nearby right now.</p>
          ) : (
            <ul>
              {nearbyMembers.map((nearby) => {
                const member = members.find(
                  (item) => item.userId === nearby.userId
                );

                return member ? (
                  <li key={nearby.userId}>
                    {member.name || "Team Member"}
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>

        <Link to="/team">View Team →</Link>
      </section>

      <footer className="office-footer">
        © 2026 ProxiSpeak 2.0 · Virtual Workspace
      </footer>
    </div>
  );
}

export default VirtualOffice;
