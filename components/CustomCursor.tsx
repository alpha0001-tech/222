import React, { useEffect, useRef } from 'react';

interface CustomCursorProps {
  theme?: 'dark' | 'light';
}

const CustomCursor: React.FC<CustomCursorProps> = ({ theme = 'dark' }) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run if device supports hover
    if (!window.matchMedia('(hover: hover)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Set initial size/color based on theme
    const size = 20;
    const hoverSize = 64;
    
    if (window.gsap) {
      window.gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      
      let mouseX = 0;
      let mouseY = 0;
      
      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };

      const updatePosition = () => {
        window.gsap.to(cursor, {
          x: mouseX,
          y: mouseY,
          duration: 0.15,
          ease: 'power2.out',
          overwrite: true
        });
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.gsap.ticker.add(updatePosition);

      // Handle Hover States
      const hoverSelectors = 'a, button, .group, [role="button"], .hoverable, .magnetic-wrap, img';
      const handleMouseEnter = () => {
        if(theme === 'dark') {
            window.gsap.to(cursor, { width: hoverSize, height: hoverSize, backgroundColor: 'white', mixBlendMode: 'difference' });
        } else {
            window.gsap.to(cursor, { width: hoverSize, height: hoverSize, backgroundColor: 'white', mixBlendMode: 'difference' });
        }
      };
      
      const handleMouseLeave = () => {
         const baseColor = theme === 'dark' ? 'white' : '#111111';
         window.gsap.to(cursor, { width: size, height: size, backgroundColor: baseColor, mixBlendMode: 'difference' });
      };

      const elements = document.querySelectorAll(hoverSelectors);
      elements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.gsap.ticker.remove(updatePosition);
        elements.forEach(el => {
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
          });
      };
    }
  }, [theme, location.href]); // Re-run on route change to re-bind events

  return (
    <div 
      ref={cursorRef} 
      className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-colors duration-300
        ${theme === 'dark' ? 'bg-white w-6 h-6' : 'bg-[#111111] w-5 h-5'}`}
    />
  );
};

export default CustomCursor;