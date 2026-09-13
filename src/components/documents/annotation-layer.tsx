import React from 'react';
import type { Annotation } from '../../types';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  width: number;
  height: number;
  onRemoveAnnotation?: (id: string) => void;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageNumber,
  width,
  height,
  onRemoveAnnotation,
}) => {
  const pageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ width, height }}
    >
      {pageAnnotations.map((ann) => {
        const { x, y, width: w, height: h } = ann.coords;
        const left = `${x}%`;
        const top = `${y}%`;
        const itemWidth = `${w}%`;
        const itemHeight = `${h}%`;

        if (ann.type === 'highlight') {
          return (
            <div
              key={ann.id}
              className="absolute bg-yellow-400/30 mix-blend-multiply border-b border-yellow-500/50 pointer-events-auto cursor-pointer group"
              style={{ left, top, width: itemWidth, height: itemHeight }}
              title={ann.text || 'Highlighted section'}
              onClick={() => onRemoveAnnotation?.(ann.id)}
            >
              {ann.label && (
                <span className="absolute -top-4 left-0 text-[9px] bg-zinc-900 text-zinc-300 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {ann.label}
                </span>
              )}
            </div>
          );
        }

        if (ann.type === 'rectangle') {
          return (
            <div
              key={ann.id}
              className="absolute border-2 border-red-500 bg-red-500/10 rounded pointer-events-auto cursor-pointer group"
              style={{ left, top, width: itemWidth, height: itemHeight }}
              onClick={() => onRemoveAnnotation?.(ann.id)}
            >
              {ann.label && (
                <span className="absolute -top-4 left-0 text-[10px] font-semibold bg-red-600 text-white px-1.5 py-0.2 rounded shadow">
                  {ann.label}
                </span>
              )}
            </div>
          );
        }

        if (ann.type === 'marker') {
          return (
            <div
              key={ann.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shadow-lg border border-black pointer-events-auto cursor-pointer"
              style={{ left, top }}
              title={ann.label || `Step ${ann.stepNumber || 1}`}
              onClick={() => onRemoveAnnotation?.(ann.id)}
            >
              {ann.stepNumber || 1}
            </div>
          );
        }

        if (ann.type === 'note') {
          return (
            <div
              key={ann.id}
              className="absolute bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] p-2 rounded shadow-xl max-w-xs pointer-events-auto cursor-pointer"
              style={{ left, top }}
              onClick={() => onRemoveAnnotation?.(ann.id)}
            >
              <div className="font-semibold text-zinc-100 text-[10px] mb-0.5">Note</div>
              <div>{ann.text}</div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
