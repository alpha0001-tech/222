import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';
import { Play, Box } from 'lucide-react';

const Home: React.FC = () => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoExpandRef = useRef<HTMLDivElement>(null);
  const liquidTriggerRef = useRef<HTMLDivElement>(null);
  
  // Sticky Section Refs
  const whoRefs = {
    sec: useRef<HTMLDivElement>(null),
    bg: useRef<HTMLDivElement>(null),
    content: useRef<HTMLDivElement>(null)
  };
  const whatRefs = {
    sec: useRef<HTMLDivElement>(null),
    bg: useRef<HTMLDivElement>(null),
    content: useRef<HTMLDivElement>(null)
  };

  const [countersRun, setCountersRun] = useState<Record<string, boolean>>({});

  // 1. Scroll Loop (RAF)
  useEffect(() => {
    let ticking = false;
    
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winH;

      // Progress Bar
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${scrollY / docHeight})`;
      }

      // Sticky Section Logic (Opacity based on scroll position inside section)
      [whoRefs, whatRefs].forEach(({ sec, bg, content }) => {
        if (sec.current && bg.current && content.current) {
          const rect = sec.current.getBoundingClientRect();
          if (rect.top < winH && rect.bottom > 0) {
            const sectionHeight = rect.height;
            const offset = -rect.top; // How far scrolled into section
            const scrollableDistance = sectionHeight - winH;
            
            let progress = 0;
            if (scrollableDistance > 0) {
              progress = Math.max(0, Math.min(1, offset / scrollableDistance));
            }
            
            // Opacity Curve: Fade in 0-10%, Stay 10-90%, Fade out 90-100%
            let opacity = 0;
            if (progress < 0.1) opacity = progress / 0.1;
            else if (progress < 0.9) opacity = 1;
            else opacity = 1 - ((progress - 0.9) / 0.1);
            
            bg.current.style.opacity = opacity.toString();
            content.current.style.opacity = opacity.toString();
          }
        }
      });

      // Video Expand Logic
      if (videoExpandRef.current) {
        const rect = videoExpandRef.current.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const center = winH / 2;
          const elCenter = rect.top + rect.height / 2;
          const dist = Math.abs(center - elCenter);
          const maxDist = winH / 2;
          const factor = 1 - Math.min(1, dist / maxDist);
          // Expand from 70% to 100% based on center proximity
          videoExpandRef.current.style.width = `${70 + (30 * factor)}%`;
          videoExpandRef.current.style.borderRadius = `${20 * (1 - factor)}px`;
        }
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 2. Intersection Observer for Reveals
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Check for counters
          if (entry.target.classList.contains('counter-wrap')) {
            const id = entry.target.getAttribute('data-id');
            if (id && !countersRun[id]) {
                const counterEl = entry.target.querySelector('.counter-val') as HTMLElement;
                if(counterEl) startCounter(counterEl, parseInt(counterEl.dataset.target || '0'));
                setCountersRun(prev => ({...prev, [id]: true}));
            }
          }
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-item, .counter-wrap').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [countersRun]);

  const startCounter = (el: HTMLElement, targetVal: number) => {
    const duration = 1500;
    const startTime = performance.now();
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // EaseOutQuart
      
      el.innerText = Math.floor(targetVal * ease).toString();
      
      if (progress < 1) requestAnimationFrame(update);
      else el.innerText = targetVal.toString();
    };
    requestAnimationFrame(update);
  };

  // 3. Liquid Effect & Tilt
  useEffect(() => {
    // Liquid
    const trigger = liquidTriggerRef.current;
    const turb = document.getElementById('turb');
    if (trigger && turb) {
      let val = 0.00;
      let target = 0.00;
      let isAnimating = false;

      const loopLiquid = () => {
        isAnimating = true;
        val += (target - val) * 0.1;
        turb.setAttribute('baseFrequency', `${val} ${val}`);
        
        if (Math.abs(val - target) > 0.001) {
          requestAnimationFrame(loopLiquid);
        } else {
          isAnimating = false;
          turb.setAttribute('baseFrequency', `${target} ${target}`);
        }
      };

      trigger.addEventListener('mouseenter', () => { target = 0.02; if (!isAnimating) loopLiquid(); });
      trigger.addEventListener('mouseleave', () => { target = 0.00; if (!isAnimating) loopLiquid(); });
    }

    // Tilt Cards
    const cards = document.querySelectorAll('.tilt-card-wrapper');
    const handleTiltMove = (e: any) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tiltX = (y - rect.height / 2) / 20;
        const tiltY = -(x - rect.width / 2) / 20;
        const inner = card.querySelector('.tilt-card') as HTMLElement;
        if(inner) inner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
    const handleTiltLeave = (e: any) => {
        const card = e.currentTarget;
        const inner = card.querySelector('.tilt-card') as HTMLElement;
        if(inner) inner.style.transform = `rotateX(0) rotateY(0)`;
    }

    cards.forEach(c => {
        c.addEventListener('mousemove', handleTiltMove);
        c.addEventListener('mouseleave', handleTiltLeave);
    })

    return () => {
        cards.forEach(c => {
            c.removeEventListener('mousemove', handleTiltMove);
            c.removeEventListener('mouseleave', handleTiltLeave);
        })
    }
  }, []);

  return (
    <div className="text-white antialiased min-h-screen flex flex-col selection:bg-lime-300 selection:text-black text-lg font-medium relative bg-[#050505] overflow-x-hidden">
      <CustomCursor theme="dark" />

      {/* SVG Filters */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence id="turb" type="turbulence" baseFrequency="0.0" numOctaves="2" result="noise" seed="1" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="pencil-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>

      {/* Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-lime-900/20 rounded-full blur-[120px] bg-glow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] bg-glow" style={{ animationDelay: '-5s' }}></div>
      </div>
      <div className="noise-overlay"></div>
      <div id="progress-bar" ref={progressBarRef} className="fixed top-0 left-0 h-[3px] bg-white z-[100] w-full transition-transform duration-100 ease-linear shadow-[0_0_10px_white] origin-left scale-x-0"></div>

      {/* Navbar */}
      <nav className="fixed z-50 flex md:px-10 backdrop-blur-[2px] bg-gradient-to-b from-black/40 to-transparent w-full pt-5 pr-6 pb-5 pl-6 top-0 left-0 items-center justify-between opacity-0 animate-[slideInBlur_0.8s_ease-out_0.2s_forwards]">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 group hoverable">
            <span className="group-hover:text-white transition-colors text-2xl text-white tracking-tight font-playfair font-semibold drop-shadow-md">
              Connor Pu
            </span>
          </a>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['AI App', 'AI Film', 'Marker Insights'].map((item) => (
            <a key={item} href="#" className="text-sm font-semibold text-white hover:text-white/80 transition-colors drop-shadow-sm hoverable">{item}</a>
          ))}
          <Link to="/declaration" className="text-sm font-semibold text-white hover:text-white/80 transition-colors drop-shadow-sm hoverable">Declaration</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative flex flex-col justify-center items-center min-h-[90vh] w-full pt-10 overflow-hidden">
        <div className="z-40 text-center relative pointer-events-none select-none px-4">
          <h1 className="text-[14vw] md:text-[8rem] lg:text-[10rem] leading-[0.8] animate-[slideInBlur_1s_ease-out_0.5s_forwards] text-white tracking-tighter font-playfair opacity-0 mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] font-bold">
            Connor Pu
          </h1>
          <div className="animate-[slideInBlur_1s_ease-out_0.8s_forwards] opacity-0 flex justify-center items-center mt-4">
            <p className="font-playfair italic text-2xl md:text-4xl text-white tracking-wide font-semibold drop-shadow-md">
              ( Founder of X-tra.AI )
            </p>
          </div>
        </div>

        {/* Floating Images */}
        <div className="w-full h-full z-20 pointer-events-auto absolute top-0 right-0 bottom-0 left-0">
          {[
            { top: '5%', left: '10%', rot: '-12deg', del: '0.2s', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' },
            { top: '8%', right: '18%', rot: '12deg', del: '0.6s', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
            { bottom: '5%', left: '5%', rot: '-6deg', del: '0.8s', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
            { bottom: '8%', right: '5%', rot: '3deg', del: '1.0s', img: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=600&auto=format&fit=crop' }
          ].map((item, i) => (
             <div key={i} className={`absolute w-32 md:w-56 aspect-square animate-float transition-all duration-1000 ease-in-out hover:scale-[1.4] hover:z-50 hover:rotate-0 group hoverable`}
                  style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom, transform: `rotate(${item.rot})`, animationDelay: `-${i}s` }}>
               <div className="w-full h-full overflow-hidden rounded-md border border-white/30 bg-neutral-900 opacity-0 animate-[scaleInBlur_1.2s_ease-out_forwards] shadow-2xl"
                    style={{ animationDelay: item.del }}>
                 <img src={item.img} className="w-full h-full object-cover" alt="float" />
               </div>
             </div>
          ))}
        </div>
      </main>

      <div className="relative" id="content-wrapper">
        {/* WHO AM I */}
        <section ref={whoRefs.sec} className="w-full h-[220vh] relative" id="who-am-i">
          <div className="sticky flex overflow-hidden -translate-y-16 w-full h-screen top-0 scale-100 items-center justify-center">
            <div ref={whoRefs.bg} className="absolute left-0 w-full top-1/2 -translate-y-1/2 h-[70vh] bg-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] opacity-0 transition-opacity duration-100 ease-linear pointer-events-none z-0"></div>
            <div ref={whoRefs.content} className="flex flex-col origin-center z-10 opacity-0 w-full max-w-7xl mr-auto ml-auto relative items-center will-change-transform">
              <div className="relative mb-12 text-center">
                <div className="inline-block relative">
                  <h2 className="text-[25vw] leading-[0.8] select-none md:text-[20rem] font-extrabold text-white tracking-tight font-geist drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">WHO</h2>
                  <span className="md:right-3 md:text-5xl text-xl font-bold text-white tracking-normal font-geist absolute right-1 bottom-2 translate-x-16 translate-y-16 drop-shadow-lg">AM I ?</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BIO */}
        <section className="min-h-screen flex md:px-12 overflow-hidden bg-transparent w-full border-white/20 border-t pt-24 pr-6 pb-24 pl-6 relative items-center justify-center">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="flex flex-col gap-10 relative z-10">
              <div className="reveal-item fade-up">
                <h2 className="text-5xl md:text-7xl font-playfair text-white mb-6 tracking-tight leading-none font-bold drop-shadow-lg">I'm Connor Pu</h2>
                <div className="w-24 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
              </div>
              <div className="space-y-8">
                {[
                    "I use AI to create Apps and Films.",
                    "I write market articles about AI.",
                    <>I am the founder of <span className="font-bold border-b-2 border-white pb-0.5 text-white shadow-white inline-block">X-tra.AI</span>.</>,
                    "Majoring in Finance with a CS minor."
                ].map((text, i) => (
                    <div key={i} className="reveal-item fade-up group flex items-start gap-5 hoverable" style={{ transitionDelay: `${0.1 * (i+1)}s` }}>
                        <span className="text-white font-mono text-base pt-2 font-semibold">0{i+1}</span>
                        <p className="text-2xl md:text-3xl text-white font-semibold font-display drop-shadow-md">{text}</p>
                    </div>
                ))}
              </div>
              <div className="reveal-item fade-up mt-6 p-8 border-l-4 border-white bg-white/[0.05] rounded-r-2xl backdrop-blur-sm" style={{ transitionDelay: '0.5s' }}>
                <p className="text-lg md:text-xl text-white italic font-playfair leading-relaxed font-semibold drop-shadow-sm">
                  "My ideal is to combine my knowledge and experience in business finance and AI to create value."
                </p>
              </div>
            </div>
            {/* Image with Pencil */}
            <div className="relative w-full h-[60vh] min-h-[500px] reveal-item fade-scale" style={{ transitionDelay: '0.3s' }}>
              <div className="group hoverable relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-900 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <svg className="absolute inset-0 z-30 w-full h-full pointer-events-none" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                  <path d="M 150 340 C 140 280, 180 240, 230 250 C 270 260, 280 320, 260 380 C 240 420, 170 410, 150 340" stroke="white" strokeWidth="4" fill="none" filter="url(#pencil-texture)" strokeLinecap="round"></path>
                  <text x="260" y="320" fill="white" fontFamily="'Caveat', cursive" fontSize="20" fontWeight="900" transform="rotate(5 260 320)" style={{ textShadow: '0 0 10px black' }}>I AM HERE</text>
                </svg>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" className="relative z-10 w-full h-full object-cover" alt="Connor" />
              </div>
            </div>
          </div>
        </section>

        {/* WHAT I'VE DONE */}
        <section ref={whatRefs.sec} className="w-full h-[220vh] relative">
          <div className="sticky flex overflow-hidden -translate-y-16 w-full h-screen top-0 items-center justify-center">
            <div ref={whatRefs.bg} className="absolute left-0 w-full top-1/2 -translate-y-1/2 h-[70vh] bg-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] opacity-0 transition-opacity duration-100 ease-linear pointer-events-none z-0"></div>
            <div ref={whatRefs.content} className="flex flex-col origin-center z-10 w-full max-w-7xl mx-auto relative items-center opacity-0 will-change-transform">
              <div className="relative mb-12 text-center">
                <div className="inline-block relative">
                  <h2 className="text-[25vw] leading-[0.8] select-none md:text-[20rem] font-extrabold text-white tracking-tight font-geist drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">WHAT</h2>
                  <span className="md:right-3 md:text-5xl text-xl font-bold text-white tracking-normal font-geist absolute right-1 bottom-2 translate-x-16 translate-y-16 drop-shadow-lg">I'VE DONE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORK GRID */}
        <section className="md:px-12 bg-transparent border-white/20 border-t mb-0 pt-32 pr-6 pb-48 pl-6 relative">
            <div className="absolute top-10 left-6 md:left-12 z-20">
                <p className="text-white font-display tracking-tighter text-xl md:text-4xl font-black uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse leading-none">Create and Work with AI. Since 2023</p>
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Item 1 */}
                <div className="group hoverable counter-wrap" data-id="1">
                    <div className="mb-10">
                        <div className="text-sm text-white uppercase tracking-widest mb-1 font-semibold opacity-80">Projects</div>
                        <div className="text-6xl md:text-7xl font-display font-bold text-white"><span className="counter-val" data-target="142">0</span></div>
                    </div>
                    <div className="reveal-item fade-scale aspect-[3/4] rounded-lg overflow-hidden mb-6 relative border border-white/20">
                        <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Fluidity</h3>
                </div>
                {/* Item 2 */}
                <div className="md:mt-24 group hoverable counter-wrap" data-id="2">
                    <div className="mb-10">
                        <div className="text-sm text-white uppercase tracking-widest mb-1 font-semibold opacity-80">FPS</div>
                        <div className="text-6xl md:text-7xl font-display font-bold text-white"><span className="counter-val" data-target="60">0</span>+</div>
                    </div>
                    <div className="reveal-item fade-scale aspect-[3/4] rounded-lg overflow-hidden mb-6 relative border border-white/20">
                         <img src="https://images.unsplash.com/photo-1506729623306-b5a934d88b53?q=80&w=1200" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Depth</h3>
                </div>
                {/* Item 3 */}
                <div className="group hoverable tilt-card-wrapper counter-wrap" data-id="3">
                    <div className="mb-10">
                        <div className="text-sm text-white uppercase tracking-widest mb-1 font-semibold opacity-80">Awards</div>
                        <div className="text-6xl md:text-7xl font-display font-bold text-white"><span className="counter-val" data-target="28">0</span></div>
                    </div>
                    <div className="tilt-card aspect-[3/4] rounded-lg mb-6 bg-neutral-900 border border-white/20 relative overflow-hidden flex items-center justify-center transition-transform duration-100" style={{ transformStyle: 'preserve-3d' }}>
                        <img src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="relative z-20 text-white text-center mix-blend-difference" style={{ transform: 'translateZ(40px)' }}>
                             <Box className="w-12 h-12 mx-auto mb-4" />
                             <span className="text-base tracking-widest uppercase font-extrabold">Interactive 3D</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Perspective</h3>
                </div>
            </div>
        </section>

        {/* ACCORDION */}
        <section className="md:px-12 border-white/20 border-t pt-32 pr-6 pb-32 pl-6 relative bg-transparent">
             <div className="mb-12 flex justify-between items-end">
                <h3 className="text-4xl font-display font-bold tracking-tight text-white drop-shadow-lg">Archives</h3>
                <p className="text-white text-sm font-medium">Hover to expand</p>
             </div>
             <div className="accordion-container flex-col md:flex-row">
                {[
                    { title: "Structure", img: "https://images.unsplash.com/photo-1485627658391-1365e4e0dbfe?q=80&w=1200" },
                    { title: "Robotics", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200" },
                    { title: "Network", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200" },
                    { title: "Orbit", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200" }
                ].map((item, i) => (
                    <div key={i} className="accordion-item group hoverable border border-white/10">
                        <img src={item.img} className="accordion-img w-full h-full object-cover absolute inset-0" alt={item.title} />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors"></div>
                        <div className="accordion-text">
                            <h4 className="text-2xl font-bold text-white drop-shadow-lg">{item.title}</h4>
                        </div>
                    </div>
                ))}
             </div>
        </section>

        {/* VIDEO EXPAND */}
        <section className="overflow-hidden flex flex-col bg-transparent border-white/20 border-t pt-32 pb-32 relative items-center">
            <div className="text-center mb-16 px-4 reveal-item fade-up active">
                <p className="md:text-4xl text-xl font-medium italic text-neutral-50 font-playfair drop-shadow-md">High School Graduation Speech</p>
            </div>
            <div id="video-expand" ref={videoExpandRef} className="video-expand-wrapper w-[70%] h-[70vh] rounded-[20px] overflow-hidden relative group hoverable border-2 border-white/20 will-change-[width,border-radius]">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500">
                        <Play className="text-white fill-white ml-1" />
                     </div>
                </div>
                <img src="https://images.unsplash.com/photo-1496564203457-11bb12075d90?q=80&w=1600" className="w-full h-full object-cover" />
            </div>
        </section>

        {/* LIQUID */}
        <section className="liquid-section pt-16 pb-16" id="liquid">
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center justify-center w-full px-6 max-w-7xl mx-auto">
                <div className="text-center md:text-right max-w-sm order-2 md:order-1">
                    <h2 className="font-playfair text-5xl md:text-6xl text-white mb-6 tracking-tight font-bold drop-shadow-lg">Liquid<br/>Reality</h2>
                    <p className="text-white text-sm leading-relaxed font-semibold">Hover the image. A water ripple effect appears dynamically on the surface.</p>
                </div>
                <div className="liquid-container order-1 md:order-2 hoverable" ref={liquidTriggerRef}>
                    <img src="https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1200" className="liquid-img" alt="Liquid" />
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <section className="h-[80vh] bg-[#050505] relative border-t border-white/20 flex items-center justify-center overflow-hidden">
            <div className="relative z-10 text-center pointer-events-none mix-blend-difference">
                <h2 className="text-6xl md:text-8xl font-display tracking-tighter mb-6 font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">Connect</h2>
                <button className="pointer-events-auto bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-110 transition-transform duration-300 hoverable shadow-[0_0_20px_white]">Start Project</button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Home;