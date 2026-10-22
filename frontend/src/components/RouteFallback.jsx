import React from 'react';
export default function RouteFallback() {
  return <section className="route-loading route-loading-screen section-shell" role="status" aria-live="polite">
    <span className="route-loading-mark" aria-hidden="true">R</span>
    <span className="pulse-dot" />
    <div><strong>Preparing your digital experience…</strong><small>Loading page content. Interactive 3D starts only when needed.</small></div>
  </section>;
}
