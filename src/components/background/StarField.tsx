import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars once
    if (starsRef.current.length === 0) {
      const starCount = 700; // 300-500 stars
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5, // Small stars (0-1.5px)
          opacity: Math.random() * 0.7 + 0.3, // 0.3-1.0 opacity for subtlety
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    const stars = starsRef.current;
    let frameCount = 0;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(14, 26, 34, 0)'; // Transparent, don't clear background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameCount++;

      // Draw stars
      stars.forEach((star) => {
        // Update twinkle phase
        star.twinklePhase += star.twinkleSpeed;

        // Calculate twinkle effect (sine wave for smooth pulsing)
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7; // Range 0.4-1.0
        const finalOpacity = star.opacity * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`; // White stars
        ctx.fill();
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}
