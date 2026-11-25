
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export function createVoiceManager(socket) {
  let localStream = null;
  const peers = new Map();
  const pendingCandidates = new Map();
  const audioElements = new Map();
  const nearbyUsers = new Set();

  function createPeer(userId) {
    if (peers.has(userId)) {
      return peers.get(userId);
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);
    
    localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", {
          targetUserId: userId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      let audio = audioElements.get(userId);

      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audio.playsInline = true;
        audioElements.set(userId, audio);
      }

      audio.srcObject = event.streams[0];
      audio.play().catch(() => {
        console.log("Click the page to enable audio playback.");
      });
    };

    peer.onconnectionstatechange = () => {
      console.log(
        "WEBRTC CONNECTION:",
        userId,
        peer.connectionState
     );

    if (
      peer.connectionState === "failed" ||
      peer.connectionState === "closed"
    ) {
      closePeer(userId);
    }
  };

    peers.set(userId, peer);
    return peer;
  }

  async function sendOffer(userId) {
    if (!localStream || peers.has(userId)) return;

    const peer = createPeer(userId);
    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    socket.emit("webrtc-offer", {
      targetUserId: userId,
      offer: peer.localDescription,
    });
  }

  async function handleOffer({ senderUserId, offer }) {
    if (!localStream || !nearbyUsers.has(senderUserId)) return;

    const peer = createPeer(senderUserId);

    await peer.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const candidates =
      pendingCandidates.get(senderUserId) || [];

    for (const candidate of candidates) {
      await peer.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }

    pendingCandidates.delete(senderUserId);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("webrtc-answer", {
      targetUserId: senderUserId,
      answer: peer.localDescription,
    });
  }

  async function handleAnswer({ senderUserId, answer }) {
    const peer = peers.get(senderUserId);
    if (!peer) return;

    await peer.setRemoteDescription(
      new RTCSessionDescription(answer)
    );

    const candidates =
      pendingCandidates.get(senderUserId) || [];

    for (const candidate of candidates) {
      await peer.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }

    pendingCandidates.delete(senderUserId);
  }

  async function handleCandidate({ senderUserId, candidate }) {
    const peer = peers.get(senderUserId);

    if (!peer || !peer.remoteDescription) {
      const list = pendingCandidates.get(senderUserId) || [];
      list.push(candidate);
      pendingCandidates.set(senderUserId, list);
      return;
    }

    await peer.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }

  function closePeer(userId) {
    const peer = peers.get(userId);

    if (peer) {
      peer.close();
      peers.delete(userId);
    }

    const audio = audioElements.get(userId);

    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audioElements.delete(userId);
    }

    pendingCandidates.delete(userId);
  }

  function updateNearbyUsers(users) {
    const allowed = new Set(
      users
        .filter((user) => !user.blocked)
        .map((user) => user.userId)
    );

    nearbyUsers.clear();
    allowed.forEach((id) => nearbyUsers.add(id));

    for (const userId of peers.keys()) {
      if (!allowed.has(userId)) {
        closePeer(userId);
      }
    }

    // Only one side starts the call to avoid duplicate offers.
    for (const userId of allowed) {
      if (socket.id < userId) {
        sendOffer(userId).catch(console.error);
      }
    }
  }

  async function start() {
    if (localStream) return;

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    for (const userId of nearbyUsers) {
      if (socket.id < userId) {
        sendOffer(userId).catch(console.error);
      }
    }
  }

  function mute() {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
  }

  function unmute() {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  function stop() {
  for (const userId of [...peers.keys()]) {
    closePeer(userId);
  }

  localStream?.getTracks().forEach((track) => track.stop());
  localStream = null;

  socket.off("webrtc-offer", handleOffer);
  socket.off("webrtc-answer", handleAnswer);
  socket.off("webrtc-ice-candidate", handleCandidate);

  nearbyUsers.clear();
  pendingCandidates.clear();
}

  socket.on("webrtc-offer", handleOffer);
  socket.on("webrtc-answer", handleAnswer);
  socket.on("webrtc-ice-candidate", handleCandidate);

  return {
    start,
    stop,
    mute,
    unmute,
    updateNearbyUsers,
  };
}
