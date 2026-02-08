import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'water-droplet font-semibold py-3 px-6 sm:py-3.5 sm:px-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center backdrop-blur-xl relative z-10';
  
  const variantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-cyan-400 border-2 border-cyan-400/50 hover:border-cyan-400/80',
  };
  
  const glassStyles = {
    primary: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(6px) saturate(200%)',
      WebkitBackdropFilter: 'blur(6px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      /* iOS 26 3D multi-layer shadows */
      boxShadow: `
        0 20px 60px -12px rgba(0, 0, 0, 0.5),
        0 12px 40px -8px rgba(0, 0, 0, 0.4),
        0 4px 16px -4px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
        inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
        inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(6px) saturate(200%)',
      WebkitBackdropFilter: 'blur(6px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: `
        0 20px 60px -12px rgba(0, 0, 0, 0.5),
        0 12px 40px -8px rgba(0, 0, 0, 0.4),
        0 4px 16px -4px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
        inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
        inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
    },
    outline: {
      background: 'rgba(6, 182, 212, 0.05)',
      backdropFilter: 'blur(6px) saturate(200%)',
      WebkitBackdropFilter: 'blur(6px) saturate(200%)',
      boxShadow: `
        0 20px 60px -12px rgba(6, 182, 212, 0.3),
        0 12px 40px -8px rgba(6, 182, 212, 0.2),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2)
      `,
    },
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${!disabled && !isLoading ? '' : ''}`}
      disabled={disabled || isLoading}
      style={glassStyles[variant]}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

