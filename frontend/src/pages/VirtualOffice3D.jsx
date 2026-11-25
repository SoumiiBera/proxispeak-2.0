
import React, { useState } from "react";
import OfficeAvatar3D from "./OfficeAvatar3D";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./VirtualOffice3D.css";

function Floor({ onFloorClick }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={onFloorClick}
    >
      <planeGeometry args={[20, 14]} />
      <meshStandardMaterial color="#e9e3fa" />
    </mesh>
  );
}

function Wall({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#b9a9ed" />
    </mesh>
  );
}

function Desk({ position }) {
  return (
    <group position={position}>
      {/* Desk top */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.15, 1]} />
        <meshStandardMaterial color="#9879d6" />
      </mesh>

      {/* Desk legs */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <meshStandardMaterial color="#6048a8" />
        </mesh>
      ))}

      {/* Monitor */}
      <mesh position={[0, 1.35, -0.25]}>
        <boxGeometry args={[0.9, 0.65, 0.08]} />
        <meshStandardMaterial color="#252442" />
      </mesh>

      <mesh position={[0, 1.03, -0.25]}>
        <boxGeometry args={[0.12, 0.25, 0.12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function Chair({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial color="#6c55bd" />
      </mesh>

      <mesh position={[0, 0.95, -0.28]}>
        <boxGeometry args={[0.7, 0.8, 0.12]} />
        <meshStandardMaterial color="#6c55bd" />
      </mesh>

      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.18, 0.5, 16]} />
        <meshStandardMaterial color="#a66b45" />
      </mesh>

      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#26965d" />
      </mesh>
    </group>
  );
}

function MeetingRoom() {
  return (
    <group position={[0, 0, -4]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[4, 0.15, 2]} />
        <meshStandardMaterial color="#9a83d8" />
      </mesh>

      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color="#6048a8" />
        </mesh>
      ))}

      <Wall position={[-2, 1, 0]} size={[0.12, 2, 2]} />
      <Wall position={[2, 1, 0]} size={[0.12, 2, 2]} />
      <Wall position={[0, 1, -1]} size={[4, 2, 0.12]} />
    </group>
  );
}

function OfficeScene() {
  const [target, setTarget] = useState(null);
  const obstacles = [
  // Desks
  { x: -5, z: 1, width: 2, depth: 1 },
  { x: 0, z: 2, width: 2, depth: 1 },
  { x: 5, z: 1, width: 2, depth: 1 },

  // Meeting room table
  { x: 0, z: -4, width: 4, depth: 2 },
];

  const handleFloorClick = (event) => {
    event.stopPropagation();
    setTarget([event.point.x, event.point.z]);
  };
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Floor onFloorClick={handleFloorClick} />

      {/* Outer walls */}
      <Wall position={[0, 1, -7]} size={[20, 2, 0.2]} />
      <Wall position={[-10, 1, 0]} size={[0.2, 2, 14]} />
      <Wall position={[10, 1, 0]} size={[0.2, 2, 14]} />

      <MeetingRoom />

      <Desk position={[-5, 0, 1]} />
      <Chair position={[-5, 0, 2.2]} />

      <Desk position={[0, 0, 2]} />
      <Chair position={[0, 0, 3.2]} />

      <Desk position={[5, 0, 1]} />
      <Chair position={[5, 0, 2.2]} />

      {/* 3D Team Avatars */}
      <OfficeAvatar3D
        name="Soumi"
        role="Team Leader"
        position={[-5, 0, 3]}
        color="#9877e8"
        controllable={true}
        target={target}
        obstacles={obstacles}
      />

    <OfficeAvatar3D
      name="Developer 1"
      role="Frontend Developer"
      position={[0, 0, 4]}
      color="#3b82f6"
   />

    <OfficeAvatar3D
      name="Developer 2"
      role="Backend Developer"
      position={[5, 0, 3]}
      color="#ec4899"
    />

      <Plant position={[-8, 0, -5]} />
      <Plant position={[8, 0, -5]} />
      <Plant position={[8, 0, 5]} />

      <gridHelper args={[20, 20, "#b9a9ed", "#d5ccef"]} position={[0, 0.01, 0]} />
    </>
  );
}

export default function VirtualOffice3D() {
  return (
    <div className="office-3d-page">
      <h2>ProxiSpeak 3D Virtual Office</h2>

      <div className="office-3d-container">
        <Canvas camera={{ position: [13, 12, 16], fov: 45 }}>
          <OfficeScene />

          <OrbitControls
            makeDefault
            minDistance={8}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.1}
            enablePan={false}
            enableRotate={true}
            enableZoom={true}
          />
        </Canvas>
      </div>

      <p className="office-3d-help">
        Drag to rotate • Scroll to zoom
      </p>
    </div>
  );
}
