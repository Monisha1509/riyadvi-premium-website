import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile, useReducedMotion } from './SceneSystem.jsx';

gsap.registerPlugin(ScrollTrigger);
const stages = [
  { title: 'Business Challenge', copy: 'Start with the friction, constraints and opportunity that matter to the business.', visual: 'challenge', label: '01 / DEFINE' },
  { title: 'Strategy', copy: 'Turn the challenge into clear priorities, decisions and a shared direction.', visual: 'strategy', label: '02 / ALIGN' },
  { title: 'Design', copy: 'Shape the user journey and interface before complexity becomes expensive.', visual: 'design', label: '03 / SHAPE' },
  { title: 'Technology', copy: 'Connect the right tools, data and services into a maintainable system.', visual: 'technology', label: '04 / CONNECT' },
  { title: 'Launch', copy: 'Validate the experience, resolve issues and release with a clear plan.', visual: 'launch', label: '05 / DELIVER' },
  { title: 'Growth', copy: 'Learn from real usage and keep improving the product over time.', visual: 'growth', label: '06 / EVOLVE' },
];
function StageVisual({ stage }) {
  return <div className={`transformation-visual visual-${stage.visual}`} aria-hidden="true">
    {stage.visual === 'challenge' && <div className="visual-scatter">{Array.from({length:15},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}
    {stage.visual === 'strategy' && <div className="visual-ordered">{Array.from({length:9},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}
    {stage.visual === 'design' && <div className="visual-interfaces"><div/><div/><div/></div>}
    {stage.visual === 'technology' && <div className="visual-network"><i/><i/><i/><i/><i/><b/><b/><b/><b/></div>}
    {stage.visual === 'launch' && <div className="visual-launch"><i/><i/><i/><b>GO</b></div>}
    {stage.visual === 'growth' && <div className="visual-bars">{[32,48,62,79,100].map((n,i)=><i key={i} style={{height:`${n}%`}}/>)}<b/></div>}
  </div>;
}
export default function DigitalTransformation() {
  const section = useRef(null); const mobile = useIsMobile(760); const reduced = useReducedMotion(); const [active,setActive] = useState(0);
  useEffect(() => {
    if (mobile || reduced || !section.current) return undefined;

    // Keep this story in normal document flow. Pinning a section for several
    // viewport heights while Lenis also owns scrolling caused a long black gap
    // on some scroll positions. A non-pinned ScrollTrigger still synchronizes
    // the visual stage with scroll, in both directions, without moving content
    // out from underneath the sticky header or leaving a pin spacer behind.
    const trigger = ScrollTrigger.create({
      id: 'riyadvi-transformation-story',
      trigger: section.current,
      start: 'top 68%',
      end: 'bottom 32%',
      invalidateOnRefresh: true,
      onUpdate: self => {
        const next = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
        setActive(current => current === next ? current : next);
      },
      onLeaveBack: () => setActive(0),
      onLeave: () => setActive(stages.length - 1),
    });
    // Refresh after React has committed the section and its content dimensions.
    const refreshId = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshId);
      trigger.kill();
    };
  }, [mobile, reduced]);

  const go = (index) => {
    const next = Math.max(0, Math.min(stages.length - 1, index));
    setActive(next);
  };
  const onKeyDown = (event) => { if (event.key === 'ArrowRight') { event.preventDefault(); go(active+1); } if (event.key === 'ArrowLeft') { event.preventDefault(); go(active-1); } };
  return <section ref={section} className={`transformation-story section-shell section-space ${mobile?'is-mobile':''}`} aria-label="Digital transformation process" onKeyDown={onKeyDown} tabIndex={0}>
    <div className="transformation-heading"><span className="eyebrow"><i/> DIGITAL TRANSFORMATION / OUR METHOD</span><h2>From business challenge<br/>to <em>lasting growth.</em></h2><p>One connected process. Six deliberate stages. Each step makes the next one clearer.</p></div>
    <div className="transformation-layout"><div className="transformation-stage-nav" role="tablist" aria-label="Transformation stages">{stages.map((s,i)=><button key={s.visual} type="button" role="tab" aria-controls="transformation-stage-panel" aria-selected={active===i} className={active===i?'active':''} onClick={()=>go(i)}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</button>)}</div>
      <div id="transformation-stage-panel" className="transformation-stage-content" role="tabpanel" aria-live="polite"><StageVisual stage={stages[active]}/><div className="transformation-stage-copy"><span className="eyebrow"><i/>{stages[active].label}</span><h3>{stages[active].title}</h3><p>{stages[active].copy}</p><div className="transformation-controls"><button type="button" aria-label="Previous stage" onClick={()=>go(active-1)} disabled={active===0}><ArrowLeft size={17}/></button><span>{String(active+1).padStart(2,'0')} <i/> {String(stages.length).padStart(2,'0')}</span><button type="button" aria-label="Next stage" onClick={()=>go(active+1)} disabled={active===stages.length-1}><ArrowRight size={17}/></button></div></div></div>
    </div>
    <p className="transformation-hint">{mobile || reduced ? 'Select a stage to explore the process.' : 'Scroll to progress · Use ← / → when this section is focused'}</p>
  </section>;
}
