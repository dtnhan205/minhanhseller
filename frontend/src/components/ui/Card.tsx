import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  id?: string;
  style?: CSSProperties;
}

export default function Card({ children, className = '', title, id, style }: CardProps) {
  return (
    <div 
      id={id} 
      className={`card droplet-container ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(8px) saturate(200%)',
        WebkitBackdropFilter: 'blur(8px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        ...style,
      }}
    >
      {title && (
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 relative z-10">{title}</h3>
      )}
      <div className="relative z-10">
      {children}
      </div>
    </div>
  );
}

