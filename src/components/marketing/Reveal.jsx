import React from 'react';
import { useInView } from '../../hooks/useInView';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Reveal({ children, className = '', threshold = 0.12, as: Tag = 'div' }) {
  const [ref, inView] = useInView({ threshold });
  const done = inView || prefersReduced;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: done ? 1 : 0,
        transform: done ? 'none' : 'translateY(18px)',
        transition: 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)',
      }}
    >
      {children}
    </Tag>
  );
}
