import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneErrorBoundary, SceneFallback, useIsMobile, useReducedMotion, useSceneVisibility, getSceneDpr, GoldStudioLighting, GOLD, LIGHT_GOLD } from './SceneSystem.jsx';

function PrecisionObject({ reduced }) {
  const assembly = useRef(null);
  const sculpture = useRef(null);
  const orbit = useRef(null);
  const { nodes, connections } = useMemo(() => {
    const count = 8;
    const points = Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 1.48, Math.sin(angle) * 0.68, Math.sin(angle * 2) * 0.26);
    });
    const positions = [];
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      positions.push(point.x, point.y, point.z, next.x, next.y, next.z);
      if (index % 2 === 0) positions.push(point.x, point.y, point.z, 0, 0, 0);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return { nodes: points, connections: geometry };
  }, []);
  useEffect(() => () => connections.dispose(), [connections]);
  useFrame(({ pointer, clock }, delta) => {
    if (!assembly.current || reduced) return;
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, pointer.x * 0.16 + Math.sin(clock.elapsedTime * 0.18) * 0.045, 2, delta);
    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, -pointer.y * 0.1, 2, delta);
    if (sculpture.current) sculpture.current.rotation.y += delta * 0.11;
    if (orbit.current) orbit.current.rotation.z += delta * 0.045;
  });
  return <group ref={assembly}>
    <lineSegments geometry={connections}><lineBasicMaterial color={GOLD} transparent opacity={0.32} depthWrite={false}/></lineSegments>
    {nodes.map((point, index) => <mesh key={index} position={point}>
      <sphereGeometry args={[0.047, 12, 12]}/>
      <meshStandardMaterial color={LIGHT_GOLD} metalness={0.42} roughness={0.28} emissive={GOLD} emissiveIntensity={0.13}/>
    </mesh>)}
    <group ref={sculpture}>
      <mesh rotation={[0.28, 0.34, -0.12]}>
        <torusKnotGeometry args={[0.68, 0.19, 128, 16, 2, 3]}/>
        <meshPhysicalMaterial color={GOLD} metalness={0.68} roughness={0.27} clearcoat={0.72} clearcoatRoughness={0.22} emissive="#5a4310" emissiveIntensity={0.06}/>
      </mesh>
      <mesh rotation={[0.8, 0.2, 0.15]}>
        <torusGeometry args={[1.08, 0.012, 8, 128]}/>
        <meshBasicMaterial color={LIGHT_GOLD} transparent opacity={0.62}/>
      </mesh>
    </group>
    <mesh ref={orbit} rotation={[Math.PI / 2.45, 0.1, 0.1]}>
      <torusGeometry args={[1.88, 0.009, 8, 144]}/>
      <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.32} emissive={GOLD} emissiveIntensity={0.08}/>
    </mesh>
  </group>;
}

export default function Scene3D({ compact = false }) {
  const host = useRef(null);
  const { visible, hasBeenVisible } = useSceneVisibility(host);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  return <div ref={host} className={compact ? 'scene3d compact' : 'scene3d'} aria-label="Interactive precision 3D sculpture with connected digital nodes">
    <SceneErrorBoundary fallback={<SceneFallback label="Digital architecture illustration"/>}>
      {hasBeenVisible && !mobile ? <Canvas dpr={getSceneDpr(mobile, 1.25)} camera={{ position: [0, 0, compact ? 5.6 : 5.4], fov: compact ? 46 : 40 }} gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }} frameloop={reduced || !visible ? 'demand' : 'always'}>
        <GoldStudioLighting intensity={0.92}/>
        <Suspense fallback={null}><PrecisionObject reduced={reduced}/></Suspense>
      </Canvas> : <SceneFallback label="Lightweight digital architecture illustration"/>}
    </SceneErrorBoundary>
    <div className="scene-label"><span className="pulse-dot"/> PRECISION DIGITAL SYSTEM <span>MOVE TO EXPLORE</span></div>
  </div>;
}
