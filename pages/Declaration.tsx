import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';

const Declaration: React.FC = () => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // 1. Setup Lenis Smooth Scroll
    if (window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
      });
      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // 2. Intro Animations (GSAP)
    if (window.gsap) {
        const tl = window.gsap.timeline({ delay: 0.2 });
        
        tl.to('.animate-title-reveal', {
            y: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power4.out"
        })
        .to('.animate-line-reveal', {
            scaleX: 1,
            duration: 1.5,
            ease: "expo.out"
        }, "-=0.8")
        .to('.animate-fade-in', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "-=1.0")
        .fromTo('.reveal-slide-up', 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
            "-=0.8"
        );
    }

    // 3. Magnetic Effect
    const handleMagneticMove = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const content = target.querySelector('.magnetic-content') as HTMLElement;
        if (!content) return;

        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;

        window.gsap.to(content, {
            x: x,
            y: y,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMagneticLeave = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const content = target.querySelector('.magnetic-content') as HTMLElement;
        if (!content) return;

        window.gsap.to(content, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    };

    const magneticWraps = document.querySelectorAll('.magnetic-wrap');
    magneticWraps.forEach(wrap => {
        wrap.addEventListener('mousemove', handleMagneticMove as any);
        wrap.addEventListener('mouseleave', handleMagneticLeave as any);
    });

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      magneticWraps.forEach(wrap => {
        wrap.removeEventListener('mousemove', handleMagneticMove as any);
        wrap.removeEventListener('mouseleave', handleMagneticLeave as any);
      });
    };
  }, []);

  return (
    <div className="bg-[#F9F9FB] text-[#111111] min-h-screen relative font-sans selection:bg-orange-500 selection:text-white">
      <CustomCursor theme="light" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 md:px-16 flex justify-end items-center mix-blend-multiply pointer-events-none">
        <div className="flex gap-8 md:gap-12 text-xs font-semibold tracking-widest text-neutral-400 pointer-events-auto">
          <Link to="/" className="magnetic-wrap group">
            <span className="magnetic-content inline-block hover:text-black transition-colors duration-300">WHO AM I</span>
          </Link>
          <a href="#" className="magnetic-wrap group">
            <span className="magnetic-content inline-block hover:text-black transition-colors duration-300">AI APPS & FILMS</span>
          </a>
          <a href="#" className="magnetic-wrap group">
            <span className="magnetic-content inline-block hover:text-black transition-colors duration-300">INVESTMENT ANALYSIS</span>
          </a>
          <span className="magnetic-wrap group">
            <span className="magnetic-content inline-block text-[#FF4D00] font-bold">MY AI MANIFESTO</span>
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative w-full max-w-[1600px] mx-auto pt-32 md:pt-48 px-8 md:px-16 pb-20 flex-grow">
        {/* Header Meta */}
        <div className="mb-6 overflow-hidden">
          <p className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase reveal-slide-up opacity-0">
            Connor Pu &nbsp;•&nbsp; 2025
          </p>
        </div>

        {/* Title */}
        <h1 className="font-display text-[15vw] md:text-[11rem] leading-[0.85] tracking-tight text-black mb-12">
          <div className="overflow-hidden">
            <span className="block transform translate-y-full animate-title-reveal">MY AI</span>
          </div>
          <div className="overflow-hidden">
            <span className="block transform translate-y-full animate-title-reveal">DECLARATION</span>
          </div>
        </h1>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-200 mb-16 scale-x-0 animate-line-reveal origin-left"></div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 opacity-0 animate-fade-in translate-y-8">
          {/* Left Spacer */}
          <div className="hidden md:block md:col-span-4 sticky top-32 self-start">
            <div className="text-xs font-semibold text-neutral-400 tracking-widest uppercase mb-4">Content</div>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>01. The Beginning</li>
              <li>02. The Builder</li>
              <li>03. The Insight</li>
              <li>04. The Vision</li>
            </ul>
          </div>

          {/* Content Column */}
          <div className="md:col-span-8 max-w-3xl">
            <div className="space-y-8 text-lg md:text-xl leading-relaxed text-neutral-800 font-light">
              <p className="drop-cap-p">
                Just like the moment on the first day of school when I gathered the courage to be the first to step onto the podium and speak with the <span className="font-medium text-black">Dean of Business School</span>: "I don’t just want to use AI to improve myself, I want to be the one creating those AI applications, combining my AI and business thinking to create value." —I know I am challenging myself, getting closer to my goals step by step.
              </p>

              <p>
                As the founder of <span className="font-medium text-black">X-tra.AI</span>, I used AI for short-films, handling AI script-writing, video, and audio generation, creating videos with over 200,000 views and won awards. Using AI tools like <span class="font-medium text-black">Bolt</span> and <span class="font-medium text-black">Cursor</span>, I also went from knowing nothing about development to building an app, a website, and a game with AI.
              </p>

              <p>
                Moreover, as a leader of <span className="font-medium text-black">Qingzhu Welfare Charity</span>, I used AI drawing tools to help autistic children fulfill their dreams, integrated this with business insight to generate profit through charity sales and donate the proceeds.
              </p>

              <p>
                I also attended the AI Agent discussion panel of <span className="font-medium text-black">Harvard Business School</span>, flew to San Francisco for the Valley 101 Tech Summit and SF Tech Week meeting, where I networked and learned from industry leaders. Through these experiences, I developed a unique way of thinking: I dare to challenge conventional ideas, dare to admit mistakes then correct them. In my spare time. Because I study market and economic news and trends, constantly using new ideas to refute my old thoughts.
              </p>
              
              <div className="py-8"><hr className="border-neutral-200" /></div>

              <p>
                As an international student, I want to be a global citizen—because I am certain that if I realize my ideal of combining business with AI technology, the benefits will extend and grow like the branches of a great tree to the whole world: whether it is AI improving self-driving cars; AI promoting medical systems across Developing Countries; AI driving pharmaceutical efficiency to benefit elderly patients; guiding young people in education; or even applying AI in film production to enhance people’s happiness.
              </p>

              <p className="text-2xl font-normal text-black mt-8">
                The global potential is limitless, and the challenges and growth for me are also limitless.
              </p>
            </div>

            {/* Quote Block */}
            <div className="mt-20 mb-8 relative group hoverable">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black"></div>
              <div className="pl-8 py-2">
                <p className="font-display italic text-3xl md:text-4xl text-black leading-tight">
                  "I am not here to watch the wave. I am here to surf it."
                </p>
                <div className="flex items-center justify-end mt-6">
                  <span className="w-12 h-px bg-neutral-300 mr-4"></span>
                  <p className="text-sm font-bold tracking-widest uppercase text-neutral-900">
                    Connor Pu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white pt-24 pb-24 relative z-10 hoverable">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 flex flex-col items-center justify-center">
          <h2 className="font-display text-5xl md:text-7xl mb-12 text-center tracking-tight">
            Let's Connect
          </h2>
          <div className="flex gap-6 items-center">
            {['Li', 'X', 'Ig'].map((item) => (
              <a href="#" key={item} className="group magnetic-wrap">
                <div className="magnetic-content w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <span className="font-display italic text-xl">{item}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-24 text-neutral-600 text-xs tracking-widest uppercase opacity-50">
            © 2025 Connor Pu. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Declaration;