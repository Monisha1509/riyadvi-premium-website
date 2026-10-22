import React, { Component, useEffect, useState } from 'react';
import { Environment, Lightformer } from '@react-three/drei';

export const GOLD = '#D4AF37';
export const LIGHT_GOLD = '#F5E6A8';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const update = () => setReduced(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 700) {
  const [mobile, setMobile] = useState(() => { if (typeof window === 'undefined') return false; const noHover = window.matchMedia?.('(hover: none)').matches; const lowMemory = Number(navigator.deviceMemory || 8) <= 4; return window.innerWidth < breakpoint || noHover || lowMemory; });
  useEffect(() => {
    const update = () => { const noHover = window.matchMedia?.('(hover: none)').matches; const lowMemory = Number(navigator.deviceMemory || 8) <= 4; setMobile(window.innerWidth < breakpoint || noHover || lowMemory); };
    window.addEventListener('resize', update, { passive: true });
    const hover = window.matchMedia?.('(hover: none)'); hover?.addEventListener?.('change', update);
    return () => { window.removeEventListener('resize', update); hover?.removeEventListener?.('change', update); };
  }, [breakpoint]);
  return mobile;
}

export function useSceneVisibility(ref, rootMargin = '160px') {
  const [state, setState] = useState({ visible: false, hasBeenVisible: false });
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setState({ visible: true, hasBeenVisible: true });
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setState(previous => ({
        visible: entry.isIntersecting,
        // Keep the WebGL context mounted after first entry. Recreating it on every scroll
        // caused black/fallback flashes and repeated shader compilation.
        hasBeenVisible: previous.hasBeenVisible || entry.isIntersecting,
      }));
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return state;
}

// Compatibility alias for older scene components. It intentionally becomes true once
// the scene enters the viewport, avoiding repeated WebGL teardown/recreation.
export function useVisible(ref, rootMargin = '160px') {
  return useSceneVisibility(ref, rootMargin).hasBeenVisible;
}

export class SceneErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() { return this.state.failed ? (this.props.fallback || <div className="scene-static-fallback" role="img" aria-label="Static digital illustration"><span className="scene-fallback-orb"/><span className="scene-fallback-line"/></div>) : this.props.children; }
}

export function SceneFallback({ label = 'Interactive 3D experience' }) {
  return <div className="scene-static-fallback" role="img" aria-label={label}><span className="scene-fallback-orb"/><span className="scene-fallback-line"/><span className="scene-fallback-node node-one"/><span className="scene-fallback-node node-two"/></div>;
}


export function getSceneDpr(mobile, desktopMax = 1.35) { return mobile ? 1 : [1, desktopMax]; }

export function GoldStudioLighting({ intensity = 1 }) {
  return <>
    <ambientLight intensity={0.78 * intensity} color="#fff8df" />
    <directionalLight position={[4, 5, 5]} intensity={2 * intensity} color={LIGHT_GOLD} />
    <directionalLight position={[-4, -2, 3]} intensity={0.9 * intensity} color="#fff3c6" />
    <Environment background={false} resolution={96}>
      <Lightformer form="rect" intensity={1.6 * intensity} color="#fff1bd" position={[-4, 2, 3]} scale={[4, 3, 1]} />
      <Lightformer form="rect" intensity={1.05 * intensity} color={GOLD} position={[4, -1, 2]} scale={[3, 4, 1]} />
      <Lightformer form="rect" intensity={1.35 * intensity} color="#ffffff" position={[0, 5, -4]} scale={[5, 2, 1]} />
    </Environment>
  </>;
}
