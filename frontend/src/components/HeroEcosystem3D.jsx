import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneErrorBoundary, SceneFallback, useIsMobile, useReducedMotion, useSceneVisibility, getSceneDpr, GoldStudioLighting, GOLD, LIGHT_GOLD } from './SceneSystem.jsx';

gsap.registerPlugin(ScrollTrigger);
const NAMED_NODES = ['Strategy', 'Design', 'Technology', 'Marketing', 'Optimization', 'Growth'];
function fibonacciSphere(count, radius) {
  const points = []; const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) { const y = 1 - (i / Math.max(1, count - 1)) * 2; const r = Math.sqrt(Math.max(0, 1 - y * y)); const a = goldenAngle * i; points.push(new THREE.Vector3(Math.cos(a) * r * radius, y * radius, Math.sin(a) * r * radius)); }
  return points;
}
function ConnectedSphere({ mobile, reduced }) {
  const root = useRef(); const scrollRoot = useRef(); const core = useRef(); const pulseRefs = useRef([]); const [hovered, setHovered] = useState(-1);
  const count = mobile ? 20 : 50;
  const namedIndexes = useMemo(() => mobile ? [0, 3, 6, 10, 14, 18] : [0, 8, 16, 24, 32, 40], [mobile]);
  const graph = useMemo(() => {
    const nodes = fibonacciSphere(count, 1.58); const vertices = []; const edges = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && a.distanceTo(b) < (mobile ? 1.22 : 0.9)) { vertices.push(a.x,a.y,a.z,b.x,b.y,b.z); edges.push([i,j]); } }));
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const pulseEdges = namedIndexes.map((idx, k) => edges.find(e => e[0] === idx || e[1] === idx) || [idx, (idx + 1) % nodes.length]);
    return { nodes, geometry, pulseEdges };
  }, [count, mobile, namedIndexes]);
  useEffect(() => () => graph.geometry.dispose(), [graph]);
  useEffect(() => {
    if (reduced || !scrollRoot.current) return undefined;
    const trigger = document.querySelector('.hero');
    if (!trigger) return undefined;
    const scaleTween = gsap.to(scrollRoot.current.scale, { x: 1.12, y: 1.12, z: 1.12, ease: 'none', scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: 0.65 } });
    const tiltTween = gsap.to(scrollRoot.current.rotation, { x: 0.1, z: -0.035, ease: 'none', scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: 0.65 } });
    return () => { scaleTween.scrollTrigger?.kill(); tiltTween.scrollTrigger?.kill(); scaleTween.kill(); tiltTween.kill(); };
  }, [reduced]);
  useFrame(({ pointer, clock }, delta) => {
    if (!root.current) return;
    if (!reduced) {
      root.current.rotation.y += delta * 0.055;
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.13, 2, delta);
      root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, pointer.x * 0.025, 2, delta);
      if (core.current) { core.current.rotation.y += delta * 0.08; core.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.035; }
      pulseRefs.current.forEach((pulse, i) => { const edge = graph.pulseEdges[i]; if (!pulse || !edge) return; const [a,b] = edge; const t = (clock.elapsedTime * (0.22 + i * 0.025) + i * 0.19) % 1; pulse.position.copy(graph.nodes[a]).lerp(graph.nodes[b], t); });
    }
  });
  return <group ref={scrollRoot}><group ref={root}>
    <lineSegments geometry={graph.geometry}><lineBasicMaterial color={GOLD} transparent opacity={0.3} depthWrite={false}/></lineSegments>
    {graph.nodes.map((point, index) => {
      const named = namedIndexes.indexOf(index); const active = hovered === index;
      return <group key={index} position={point}>
        <mesh><sphereGeometry args={[index % 7 === 0 ? 0.043 : 0.025, 10, 10]}/><meshStandardMaterial color={active ? LIGHT_GOLD : GOLD} metalness={0.55} roughness={0.32} emissive={active ? LIGHT_GOLD : GOLD} emissiveIntensity={active ? 0.45 : 0.08}/></mesh>
        {named >= 0 && <mesh onPointerOver={(e) => { e.stopPropagation(); setHovered(index); }} onPointerOut={() => setHovered(-1)}>
          <sphereGeometry args={[0.2, 8, 8]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
          {(active) && <Html distanceFactor={6} position={[0.18,0.16,0]} center className="ecosystem-node-tooltip"><span>{NAMED_NODES[named]}</span></Html>}
        </mesh>}
      </group>;
    })}
    {graph.pulseEdges.map((edge, i) => <mesh key={`pulse-${i}`} ref={el => { pulseRefs.current[i] = el; }} position={graph.nodes[edge[0]]}><sphereGeometry args={[0.034, 10, 10]}/><meshBasicMaterial color={LIGHT_GOLD}/></mesh>)}
    <group ref={core}>
      <mesh rotation={[0.18,0.28,0.08]}><icosahedronGeometry args={[0.67,1]}/><meshPhysicalMaterial color={GOLD} metalness={0.62} roughness={0.31} clearcoat={0.35} emissive="#6B5014" emissiveIntensity={0.1} flatShading/></mesh>
      <mesh position={[0.05,0.03,0.56]}><sphereGeometry args={[0.13,16,16]}/><meshBasicMaterial color={LIGHT_GOLD}/></mesh>
    </group>
    <mesh rotation={[1.03,0.18,-0.12]}><torusGeometry args={[1.92,0.008,8,128]}/><meshStandardMaterial color={GOLD} metalness={0.62} roughness={0.32} emissive={GOLD} emissiveIntensity={0.08}/></mesh>
  </group></group>;
}
function SceneContents(props) { return <><GoldStudioLighting/><ConnectedSphere {...props}/></>; }
export default function HeroEcosystem3D() {
  const host = useRef(null); const { visible, hasBeenVisible } = useSceneVisibility(host, '120px'); const mobile = useIsMobile(); const reduced = useReducedMotion();
  return <div ref={host} className="hero-ecosystem-scene" aria-label="Interactive connected digital sphere representing Strategy, Design, Technology, Marketing, Optimization and Growth">
    <SceneErrorBoundary fallback={<SceneFallback label="Connected digital ecosystem illustration"/>}>
      {hasBeenVisible ? <Canvas dpr={getSceneDpr(mobile,1.35)} camera={{position:[0,0,5.7],fov:42}} gl={{antialias:!mobile,alpha:true,powerPreference:'high-performance'}} frameloop={reduced || !visible ? 'demand' : 'always'}><Suspense fallback={null}><SceneContents mobile={mobile} reduced={reduced}/></Suspense></Canvas> : <SceneFallback label="Connected digital ecosystem loading"/>}
    </SceneErrorBoundary>
    <div className="hero-ecosystem-caption"><span className="pulse-dot"/> CONNECTED DIGITAL ECOSYSTEM <small>{reduced ? 'REDUCED MOTION' : 'HOVER A NAMED NODE TO EXPLORE'}</small></div>
  </div>;
}
