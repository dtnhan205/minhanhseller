import { useEffect, useState, useRef } from 'react';

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  length: number;
  angle: number; // Góc nghiêng: 0 = thẳng, > 0 = chéo
  type: 'straight' | 'drizzle' | 'diagonal'; // Loại mưa
}

export default function RainEffect() {
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const dropIdRef = useRef(0);

  useEffect(() => {
    // Tạo các hạt mưa ban đầu
    const initialDrops: RainDrop[] = [];
    for (let i = 0; i < 50; i++) {
      const rainType = Math.random() < 0.33 ? 'straight' : Math.random() < 0.66 ? 'drizzle' : 'diagonal';
      initialDrops.push({
        id: dropIdRef.current++,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: rainType === 'drizzle' ? 2 + Math.random() * 2 : 1 + Math.random() * 1.5, // Phùn chậm hơn
        opacity: rainType === 'drizzle' ? 0.08 + Math.random() * 0.1 : 0.1 + Math.random() * 0.15, // Nhạt hơn
        length: rainType === 'drizzle' ? 10 + Math.random() * 15 : 20 + Math.random() * 40,
        angle: rainType === 'diagonal' ? 10 + Math.random() * 20 : 0, // Mưa chéo nghiêng 10-30 độ
        type: rainType,
      });
    }
    setDrops(initialDrops);

    // Tạo hạt mưa mới định kỳ
    const interval = setInterval(() => {
      setDrops((prev) => {
        // Giữ tối đa 80 hạt mưa
        const updated = prev.filter((drop) => drop.id > dropIdRef.current - 80);
        
        // Thêm hạt mưa mới với loại ngẫu nhiên
        for (let i = 0; i < 3; i++) {
          const rainType = Math.random() < 0.33 ? 'straight' : Math.random() < 0.66 ? 'drizzle' : 'diagonal';
          updated.push({
            id: dropIdRef.current++,
            left: Math.random() * 100,
            delay: 0,
            duration: rainType === 'drizzle' ? 2 + Math.random() * 2 : 1 + Math.random() * 1.5,
            opacity: rainType === 'drizzle' ? 0.08 + Math.random() * 0.1 : 0.1 + Math.random() * 0.15,
            length: rainType === 'drizzle' ? 10 + Math.random() * 15 : 20 + Math.random() * 40,
            angle: rainType === 'diagonal' ? 10 + Math.random() * 20 : 0,
            type: rainType,
          });
        }
        return updated;
      });
    }, 200); // Tạo mới mỗi 200ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {drops.map((drop) => {
        const isDrizzle = drop.type === 'drizzle';
        const isDiagonal = drop.type === 'diagonal';
        
        return (
          <div
            key={drop.id}
            className="absolute top-0"
            style={{
              left: `${drop.left}%`,
              width: isDrizzle ? '0.5px' : '1px',
              height: `${drop.length}px`,
              background: isDrizzle
                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.08))'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.12))',
              opacity: drop.opacity,
              transformOrigin: 'top center',
              animation: `rainFall${isDiagonal ? 'Diagonal' : ''} ${drop.duration}s linear ${drop.delay}s infinite`,
              boxShadow: isDrizzle ? '0 0 1px rgba(255, 255, 255, 0.2)' : '0 0 1.5px rgba(255, 255, 255, 0.3)',
            }}
          />
        );
      })}
      <style>{`
        @keyframes rainFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
        }
        
        @keyframes rainFallDiagonal {
          0% {
            transform: translateY(-100vh) translateX(0) rotate(15deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(60px) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

