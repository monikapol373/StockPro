import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

const TONE = { good: "#34d399", warn: "#fb923c", bad: "#f43f5e" };
const SPOTS = [[-3.6, -2.2], [3.6, -2.2], [-3.6, 2.2], [3.6, 2.2]];
const CARTON = ["#c08a4a", "#b27b3c", "#d19a5b", "#a8814f"];
const SLOTS = 36; // 4 racks x 3 shelves x 3 boxes

const Rack = ({ x, z, tone, filled, start }) => (
  <group position={[x, 0, z]}>
    {[[-1.25, -0.42], [1.25, -0.42], [-1.25, 0.42], [1.25, 0.42]].map(([px, pz], i) => (
      <mesh key={i} position={[px, 1, pz]}>
        <boxGeometry args={[0.07, 2, 0.07]} />
        <meshStandardMaterial color="#2b3170" metalness={0.6} roughness={0.4} />
      </mesh>
    ))}
    {[0.12, 0.8, 1.48].map((y, s) => (
      <group key={s}>
        <mesh position={[0, y, 0]}>
          <boxGeometry args={[2.6, 0.06, 0.95]} />
          <meshStandardMaterial color={tone} emissive={tone} emissiveIntensity={0.55} />
        </mesh>
        {[-0.85, 0, 0.85].map((bx, b) => {
          const idx = start + s * 3 + b;
          if (idx >= filled) return null;
          return (
            <mesh key={b} position={[bx, y + 0.27, 0]}>
              <boxGeometry args={[0.7, 0.48, 0.7]} />
              <meshStandardMaterial color={CARTON[idx % 4]} roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    ))}
  </group>
);

const Zone = ({ zone, pos, onZone }) => {
  const tone = TONE[zone.tone] || TONE.good;
  const filled = Math.round((zone.pct / 100) * SLOTS);
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[6.2, 3.8]} />
        <meshBasicMaterial color={tone} transparent opacity={0.16} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} color={tone} intensity={12} distance={7} />
      {[[-1.45, -0.95], [1.45, -0.95], [-1.45, 0.95], [1.45, 0.95]].map(([rx, rz], r) => (
        <Rack key={r} x={rx} z={rz} tone={tone} filled={filled} start={r * 9} />
      ))}
      <Html position={[0, 3.1, 0]} center zIndexRange={[10, 0]}>
        <div className="sx-tag sx-tag-3d" style={{ "--t": tone }} onClick={() => onZone(zone)}>
          <b>{zone.name}</b>
          <span><i />{zone.label} {zone.pct}%</span>
        </div>
      </Html>
    </group>
  );
};

const Forklift = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.5;
    if (!ref.current) return;
    ref.current.position.x = Math.sin(t) * 4.5;
    ref.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.55, 0.4, 0.9]} /><meshStandardMaterial color="#fbbf24" /></mesh>
      <mesh position={[0, 0.95, -0.15]}><boxGeometry args={[0.5, 0.6, 0.45]} /><meshStandardMaterial color="#f59e0b" /></mesh>
      <mesh position={[0, 0.75, 0.55]}><boxGeometry args={[0.45, 1.2, 0.08]} /><meshStandardMaterial color="#374151" /></mesh>
      <mesh position={[0, 0.2, 0.75]}><boxGeometry args={[0.4, 0.05, 0.4]} /><meshStandardMaterial color="#9ca3af" /></mesh>
    </group>
  );
};

const Truck = () => (
  <group position={[-9.2, 0, 0]}>
    <mesh position={[0, 1.05, 0]}><boxGeometry args={[3.2, 1.6, 1.7]} /><meshStandardMaterial color="#e5e7ff" /></mesh>
    <mesh position={[2.05, 0.8, 0]}><boxGeometry args={[1, 1.1, 1.6]} /><meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.4} /></mesh>
    {[-1, 1, 2.1].map((wx) => (
      <mesh key={wx} position={[wx, 0.22, 0.9]}><cylinderGeometry args={[0.22, 0.22, 0.2, 16]} /><meshStandardMaterial color="#111" /></mesh>
    ))}
  </group>
);

const Shell = () => (
  <group>
    <mesh position={[0, -0.15, 0]}><boxGeometry args={[14.4, 0.3, 10.4]} /><meshStandardMaterial color="#161c66" metalness={0.3} roughness={0.6} /></mesh>
    <mesh position={[0, -0.34, 0]}><boxGeometry args={[14.8, 0.1, 10.8]} /><meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.9} /></mesh>
    <mesh position={[0, 1.5, -5.1]}><boxGeometry args={[14.4, 3, 0.1]} /><meshStandardMaterial color="#6d5bff" transparent opacity={0.16} /></mesh>
    <mesh position={[-7.1, 1.5, 0]}><boxGeometry args={[0.1, 3, 10.4]} /><meshStandardMaterial color="#6d5bff" transparent opacity={0.16} /></mesh>
    <mesh position={[0, 3, -5.1]}><boxGeometry args={[14.4, 0.07, 0.07]} /><meshStandardMaterial color="#c4b5fd" emissive="#a78bfa" emissiveIntensity={1.2} /></mesh>
    <mesh position={[-7.1, 3, 0]}><boxGeometry args={[0.07, 0.07, 10.4]} /><meshStandardMaterial color="#c4b5fd" emissive="#a78bfa" emissiveIntensity={1.2} /></mesh>
    <mesh position={[0, 0.025, 0]}><boxGeometry args={[13.4, 0.01, 0.12]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.4} /></mesh>
  </group>
);

export default function Warehouse3D({ zones = [], onZone = () => {} }) {
  return (
    <div className="sx-3d">
      <Canvas camera={{ position: [10, 9, 12], fov: 34 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#0a0a2c", 22, 48]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 5]} intensity={1.4} />
        <Shell />
        <Truck />
        <Forklift />
        {zones.slice(0, 4).map((z, i) => (
          <Zone key={z.name} zone={z} pos={SPOTS[i]} onZone={onZone} />
        ))}
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.6} maxPolarAngle={1.35} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}