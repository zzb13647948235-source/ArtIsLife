import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  showLoader?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  showLoader = true,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setLoaded(true); // Stop loading state even on error
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loader */}
      {!loaded && showLoader && !error && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse z-10 flex items-center justify-center">
          <Loader2 size={24} className="text-stone-300 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-stone-100 z-10 flex flex-col items-center justify-center text-stone-400 p-4 text-center">
          <ImageOff size={24} className="mb-2" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}

      {/* Image */}
      {!error && (
        <img 
          src={imageSrc || src} // Use src initially for SEO/SSR, then switch to preloaded imageSrc
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ease-out 
            ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
            ${className}
          `}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
