import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, Smartphone, ChartNoAxesCombined, Glasses, Box, PanelsTopLeft, Layers3 } from 'lucide-react';

const icons = { Code2, Smartphone, ChartNoAxesCombined, Glasses, Box, PanelsTopLeft };

export default function ServiceFlipCard({ service, index = 0, detailed = false }) {
  const [flipped, setFlipped] = useState(false);
  const frontButtonRef = useRef(null);
  const backId = useId();
  const Icon = icons[service.icon] || Layers3;
  const featureDefaults = ['Discovery and planning', 'Responsive implementation', 'Quality and accessibility'];
  const canHoverFlip = () => typeof window !== 'undefined' && (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? window.innerWidth > 760);
  const handleMouseEnter = () => { if (canHoverFlip()) setFlipped(true); };
  const handleMouseLeave = () => { if (canHoverFlip()) setFlipped(false); };
  const features = [0, 1, 2].map(i => service.features?.[i] || featureDefaults[i]);

  useEffect(() => {
    if (!flipped) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { frontButtonRef.current?.focus({ preventScroll: true }); setFlipped(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped]);

  return (
    <article
      className={`service-card service-flip-card${flipped ? ' is-flipped' : ''}`}
      data-flipped={String(flipped)}
      aria-label={`${service.name} service card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="service-flip-inner">
        <div className="service-flip-face service-flip-front" aria-hidden={flipped}>
          <div className="service-card-top">
            <span className="service-icon"><Icon aria-hidden="true" /></span>
            <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className={`service-mini-visual ${service.visual || ''}`} aria-hidden="true">
            <div className="mini-frame"><i/><i/><i/><b/></div>
          </div>
          <h3>{service.name}</h3>
          <p>{service.desc}</p>
          <button
            className="service-flip-trigger"
            ref={frontButtonRef}
            type="button"
            aria-expanded={flipped}
            aria-controls={backId}
            tabIndex={flipped ? -1 : 0}
            onClick={() => setFlipped(value => !value)}
          >
            Flip to explore <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="service-flip-face service-flip-back" id={backId} aria-hidden={!flipped}>
          <span className="eyebrow"><i/> WHAT WE DO / {String(index + 1).padStart(2, '0')}</span>
          <div className="service-back-symbol" aria-hidden="true"><Icon/></div>
          <h3>{service.name}</h3>
          <p>{service.solution || service.desc}</p>
          <ul aria-label={`${service.name} key features`}>
            {features.map(item => <li key={item}>{item}</li>)}
          </ul>
          <div className="service-flip-actions">
            <Link to={`/contact?service=${encodeURIComponent(service.slug)}`} tabIndex={flipped ? 0 : -1} className="button button-gold">Get a Quote <ArrowUpRight size={15} aria-hidden="true"/></Link>
            <Link to={`/services/${service.slug}`} tabIndex={flipped ? 0 : -1} className="service-explore-link">Explore service <ArrowUpRight size={14} aria-hidden="true"/></Link>
          </div>
          <button
            className="service-flip-trigger service-flip-back-trigger"
            type="button"
            aria-expanded={flipped}
            aria-controls={backId}
            tabIndex={flipped ? 0 : -1}
            onClick={() => { frontButtonRef.current?.focus({ preventScroll: true }); setFlipped(false); }}
          >
            Back to front
          </button>
        </div>
      </div>
    </article>
  );
}
