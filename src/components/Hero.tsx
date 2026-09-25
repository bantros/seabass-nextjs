'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Logo } from '@/components/Logo';

enum LineSettings {
  Count = 34,
  Spacing = 3.4,
  Factor = 1.08
}

function calculatePositions(containerHeight: number): number[] {
  let totalHeight = 0;
  for (let i = 0; i < LineSettings.Count - 1; i++) {
    totalHeight += LineSettings.Spacing * Math.pow(LineSettings.Factor, i);
  }
  const fitFactor = (containerHeight * 0.9) / totalHeight;

  return Array.from({ length: LineSettings.Count }, (_, index) => {
    let pos = 0;
    for (let i = 0; i < index; i++) {
      pos +=
        LineSettings.Spacing * Math.pow(LineSettings.Factor, i) * fitFactor;
    }
    return pos;
  });
}

interface LineProps {
  yStart: number;
  scrollYProgress: MotionValue<number>;
}

function Line({ yStart, scrollYProgress }: LineProps) {
  const y = useTransform(scrollYProgress, [0, 1], [yStart, 0]);

  return (
    <motion.svg
      className='absolute left-0 w-full'
      xmlns='http://www.w3.org/2000/svg'
      width='100%'
      height='1'
      viewBox='0 0 100 1'
      preserveAspectRatio='none'
      style={{ y }}
    >
      <rect width='100' height='1' fill='currentColor' />
    </motion.svg>
  );
}

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [linesHeight, setLinesHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end']
  });

  useEffect(() => {
    if (!stickyRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setLinesHeight(entry.contentRect.height);
    });
    observer.observe(stickyRef.current);
    return () => observer.disconnect();
  }, []);

  const positions = linesHeight > 0 ? calculatePositions(linesHeight) : [];

  return (
    <div ref={wrapperRef}>
      <div ref={stickyRef} className='sticky top-0 w-full h-dvh'>
        <div className='absolute top-0 left-0 z-10 size-full text-theme-primary'>
          <Logo className='size-full' />
        </div>
        <div className='relative z-0 min-h-dvh text-theme-tertiary'>
          {positions.map((yStart, i) => (
            <Line key={i} yStart={yStart} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
      <div className='h-dvh' />
    </div>
  );
}
