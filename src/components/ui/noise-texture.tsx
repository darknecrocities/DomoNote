import React, { useState, useEffect } from 'react';

let cachedNoiseDataUrl: string | null = null;

function generateNoiseDataUrl(opacity: number): string {
  if (cachedNoiseDataUrl) return cachedNoiseDataUrl;
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(96, 96);
  const data = imgData.data;
  const alphaByte = Math.floor(opacity * 255);

  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = Math.random() < 0.5 ? alphaByte : 0;
  }

  ctx.putImageData(imgData, 0, 0);
  cachedNoiseDataUrl = canvas.toDataURL('image/png');
  return cachedNoiseDataUrl;
}

export const NoiseTexture: React.FC<{ opacity?: number; className?: string }> = ({
  opacity = 0.03,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>(cachedNoiseDataUrl || '');

  useEffect(() => {
    if (!cachedNoiseDataUrl) {
      const url = generateNoiseDataUrl(opacity);
      setDataUrl(url);
    }
  }, [opacity]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 select-none ${className}`}
      style={{
        backgroundImage: dataUrl ? `url(${dataUrl})` : undefined,
        backgroundRepeat: 'repeat',
      }}
      aria-hidden="true"
    />
  );
};
