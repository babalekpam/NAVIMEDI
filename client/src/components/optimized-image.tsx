import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  style = {}
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`} style={style}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority && { fetchpriority: "high" })}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        // Add responsive image hints for better performance
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
          Image unavailable
        </div>
      )}
    </div>
  );
}