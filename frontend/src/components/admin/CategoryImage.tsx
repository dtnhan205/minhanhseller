import { Folder } from 'lucide-react';

interface CategoryImageProps {
  image?: string;
  name: string;
}

export default function CategoryImage({ image, name }: CategoryImageProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl object-cover border-2 border-gray-800 group-hover:border-cyan-500/50 transition-colors flex-shrink-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
      <Folder className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
    </div>
  );
}

