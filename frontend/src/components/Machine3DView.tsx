"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function MachineModel({ health = 100, isAnomaly = false }) {
  const group = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Mesh>(null);
  
  // Color based on health
  const color = useMemo(() => {
    if (isAnomaly) return "#ff2e2e"; // Pure Industrial Red
    if (health > 80) return "#6366f1"; // Brand Indigo
    if (health > 50) return "#f59e0b"; // Warning Amber
    return "#ef4444";
  }, [health, isAnomaly]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += isAnomaly ? 0.08 : 0.005;
      group.current.rotation.z += 0.002;
    }
    if (rotor.current) {
      rotor.current.rotation.y += isAnomaly ? 0.5 : 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Structural Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.2, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* High-Performance Rotor */}
      <group position={[1.4, 0, 0]}>
         <Float speed={isAnomaly ? 10 : 2} rotationIntensity={isAnomaly ? 4 : 1} floatIntensity={1}>
            <mesh ref={rotor} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isAnomaly ? 5 : 0.6} metalness={1} roughness={0} />
            </mesh>
            {/* Energy Glow around rotor */}
            {isAnomaly && (
                <mesh scale={[1.2, 1.2, 1.2]}>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshBasicMaterial color="#ff0000" transparent opacity={0.2} />
                </mesh>
            )}
         </Float>
      </group>

      {/* Internal "Bio-Mechanical" Core */}
      <mesh position={[-0.2, 0, 0]}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={isAnomaly ? 15 : 1.5}
          distort={isAnomaly ? 0.8 : 0.15}
          radius={1}
          emissive={color}
          emissiveIntensity={isAnomaly ? 2 : 0.1}
          opacity={0.4}
          transparent
          metalness={1}
        />
      </mesh>

      {/* Industrial Connectors */}
      {[[-1.0, 0.5, 0.5], [-1.0, -0.5, 0.5], [-1.0, 0.5, -0.5], [-1.0, -0.5, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos as any}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}


export default function Machine3DView({ health = 95, isAnomaly = false }) {
  return (
    <div style={{ width: "100%", height: "300px", background: "radial-gradient(circle at center, #0f172a 0%, #040813 100%)", borderRadius: "var(--radius-lg)", position: "relative", cursor: "grab" }}>
      <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 1 }}>
         <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Digital Twin Status</div>
         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isAnomaly ? "var(--risk-high)" : "var(--risk-low)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{isAnomaly ? "Critical Failure Imminent" : "Stable Dynamics"}</span>
         </div>
      </div>
      
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <MachineModel health={health} isAnomaly={isAnomaly} />
        
        <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4.5} 
        />
        
        <OrbitControls enableZoom={false} autoRotate={!isAnomaly} autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
