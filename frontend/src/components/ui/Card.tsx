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
      className={`card ${className}`}
      style={{
        background: 'rgba(10, 10, 10, 0.62)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
        ...style,
      }}
    >
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-5 relative z-10">{title}</h3>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
