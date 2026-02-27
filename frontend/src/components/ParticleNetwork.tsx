import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface ParticleNetworkProps {
  particleColor?: string;
  lineColor?: string;
  particleCount?: number;
  linkDistance?: number;
  opacity?: number;
  lineWidth?: number;
  lineOpacityMultiplier?: number;
  particleSizeMultiplier?: number;
  // Responsive settings
  mobileBreakpointPx?: number;
  mobileParticleCountMultiplier?: number;
  mobileLinkDistanceMultiplier?: number;
}

export default function ParticleNetwork({
  particleColor = 'rgba(255, 255, 255, 0.5)',
  lineColor = 'rgba(255, 255, 255, 0.1)',
  particleCount = 60,
  linkDistance = 150,
  opacity = 0.4,
  lineWidth = 1.2,
  lineOpacityMultiplier = 2.0,
  particleSizeMultiplier = 1.5,
  mobileBreakpointPx = 768,
  mobileParticleCountMultiplier = 0.5,
  mobileLinkDistanceMultiplier = 0.7,
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const getResponsiveSettings = () => {
      const isMobile = window.innerWidth < mobileBreakpointPx;
      return {
        count: isMobile ? Math.floor(particleCount * mobileParticleCountMultiplier) : particleCount,
        distance: isMobile ? linkDistance * mobileLinkDistanceMultiplier : linkDistance,
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const initParticles = () => {
      const { count } = getResponsiveSettings();
      particles = [];
      const adaptiveCount = Math.min(count, (width * height) / 15000);
      
      for (let i = 0; i < adaptiveCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: (Math.random() * 1.5 + 0.5) * particleSizeMultiplier,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const { distance } = getResponsiveSettings();
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distance) {
            const alpha = Math.min((1 - dist / distance) * 0.5 * lineOpacityMultiplier, 1);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/g, `${alpha})`);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    particleColor, 
    lineColor, 
    particleCount, 
    linkDistance, 
    lineWidth, 
    lineOpacityMultiplier, 
    particleSizeMultiplier,
    mobileBreakpointPx,
    mobileParticleCountMultiplier,
    mobileLinkDistanceMultiplier
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity, mixBlendMode: 'screen' }}
    />
  );
}
