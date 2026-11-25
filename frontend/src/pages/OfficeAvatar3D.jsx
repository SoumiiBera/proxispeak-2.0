
import React, { useRef, useEffect } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

export default function OfficeAvatar3D({
  name = "Team Member",
  role = "Developer",
  position = [0, 0, 0],
  color = "#9877e8",
  controllable = false,
  target = null,
  obstacles = [],
}) {
  const avatarRef = useRef();
  const keys = useRef({});
  const activeTarget = useRef(null);

  // Walking animation references
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

const walkTime = useRef(0);

// Set avatar's starting position only once
useEffect(() => {
  if (avatarRef.current) {
    avatarRef.current.position.set(
      position[0],
      position[1],
      position[2]
    );
  }
}, []);

useEffect(() => {
  activeTarget.current = target;
}, [target]);

  // Keyboard controls
  useEffect(() => {
    if (!controllable) return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
      ) {
        event.preventDefault();
        keys.current[key] = true;
      }
    };

    const handleKeyUp = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      keys.current = {};
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [controllable]);

  // Avatar movement + walking animation + face rotation
useFrame((_, delta) => {
  if (!avatarRef.current) return;

  const speed = 3;
  const movement = { x: 0, z: 0 };
  let isMoving = false;

  if (controllable) {
    if (keys.current.w || keys.current.arrowup) movement.z -= 1;
    if (keys.current.s || keys.current.arrowdown) movement.z += 1;
    if (keys.current.a || keys.current.arrowleft) movement.x -= 1;
    if (keys.current.d || keys.current.arrowright) movement.x += 1;
  }

const checkCollision = (nextX, nextZ) => {
  const avatarRadius = 0.4;

  return obstacles.some((obstacle) => {
    const closestX = Math.max(
      obstacle.x - obstacle.width / 2,
      Math.min(nextX, obstacle.x + obstacle.width / 2)
    );

    const closestZ = Math.max(
      obstacle.z - obstacle.depth / 2,
      Math.min(nextZ, obstacle.z + obstacle.depth / 2)
    );

    const dx = nextX - closestX;
    const dz = nextZ - closestZ;

    return dx * dx + dz * dz < avatarRadius * avatarRadius;
  });
};

  const length = Math.hypot(movement.x, movement.z);

  // Keyboard movement
  if (length > 0) {
    activeTarget.current = null;

    movement.x /= length;
    movement.z /= length;

    const nextX =
  avatarRef.current.position.x + movement.x * speed * delta;

const nextZ =
  avatarRef.current.position.z + movement.z * speed * delta;

if (!checkCollision(nextX, nextZ)) {
  avatarRef.current.position.x = nextX;
  avatarRef.current.position.z = nextZ;
  isMoving = true;
}
  }
  
// Mouse click movement
else if (controllable && activeTarget.current) {
  const dx = activeTarget.current[0] - avatarRef.current.position.x;
  const dz = activeTarget.current[1] - avatarRef.current.position.z;
  const distance = Math.hypot(dx, dz);

  if (distance > 0.12) {
    movement.x = dx / distance;
    movement.z = dz / distance;

    const step = Math.min(speed * delta, distance);

    const nextX =
      avatarRef.current.position.x + movement.x * step;

    const nextZ =
      avatarRef.current.position.z + movement.z * step;

    // Try moving in both directions
    if (!checkCollision(nextX, nextZ)) {
      avatarRef.current.position.x = nextX;
      avatarRef.current.position.z = nextZ;
      isMoving = true;
    } else if (!checkCollision(nextX, avatarRef.current.position.z)) {
      // Move horizontally
      avatarRef.current.position.x = nextX;
      isMoving = true;
    } else if (!checkCollision(avatarRef.current.position.x, nextZ)) {
      // Move vertically
      avatarRef.current.position.z = nextZ;
      isMoving = true;
    }
  } else {
    activeTarget.current = null;
  }
}

  // Office boundaries
  if (controllable) {
    avatarRef.current.position.x = Math.max(
      -9,
      Math.min(9, avatarRef.current.position.x)
    );

    avatarRef.current.position.z = Math.max(
      -6,
      Math.min(6, avatarRef.current.position.z)
    );
  }

  // Face movement direction
  if (isMoving) {
    const targetRotation = Math.atan2(movement.x, movement.z);

    const currentRotation = avatarRef.current.rotation.y;

    const difference = Math.atan2(
      Math.sin(targetRotation - currentRotation),
      Math.cos(targetRotation - currentRotation)
    );

    avatarRef.current.rotation.y += difference * Math.min(1, delta * 10);
  }

  // Walking animation
  if (isMoving) {
    walkTime.current += delta * 10;

    const swing = Math.sin(walkTime.current) * 0.45;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = swing;
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -swing;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -swing * 0.7;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = swing * 0.7;
    }
  } else {
    walkTime.current = 0;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = MathUtils.damp(
        leftLegRef.current.rotation.x, 0, 10, delta
      );
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = MathUtils.damp(
        rightLegRef.current.rotation.x, 0, 10, delta
      );
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = MathUtils.damp(
        leftArmRef.current.rotation.x, 0, 10, delta
      );
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = MathUtils.damp(
        rightArmRef.current.rotation.x, 0, 10, delta
      );
    }
  }
});
  return (
    <group ref={avatarRef}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial color="#777777" transparent opacity={0.2} />
      </mesh>

      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.16, 0.35, 0]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh ref={rightLegRef} position={[0.16, 0.35, 0]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.3, 0.55, 6, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.4, 0.95, 0]}>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color="#f1c7a5" />
      </mesh>

      <mesh ref={rightArmRef} position={[0.4, 0.95, 0]}>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color="#f1c7a5" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#f1c7a5" />
      </mesh>

      {/* Face */}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#f1c7a5" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.88, -0.03]}>
        <sphereGeometry args={[0.285, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#30251f" />
      </mesh>

      {/* Eyes */}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 1.75, 0.245]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#252020" />
        </mesh>
      ))}

      {/* Name Label */}
      <group position={[0, 2.65, 0]}>
        <Text
          position={[0, 0.18, 0]}
          fontSize={0.22}
          color="#30216f"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="white"
       >
          {name}
        </Text>

        <Text
          position={[0, -0.08, 0]}
          fontSize={0.13}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          {role}
        </Text>
     </group>
    </group>
  );
}
