'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'framer-motion';
import clsx from 'clsx';

interface ParallaxColumnProps {
  className?: string;
  speedMultiplier: number;
  children: React.ReactNode;
}

export default function Column({
  className,
  speedMultiplier,
  children
}: ParallaxColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: columnRef,
    offset: ['start end', 'end start']
  });

  const scrollVelocity = useVelocity(scrollYProgress);

  // const rawY = useTransform(
  //   scrollYProgress,
  //   [0, 1],
  //   [0, -300 * speedMultiplier],
  //   { clamp: true }
  // );

  const rawY = useTransform(
    scrollVelocity,
    [-1, 0, 1],
    [-30 * speedMultiplier, 0, 30 * speedMultiplier],
    { clamp: true }
  );

  const smoothedY = useSpring(rawY, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.01
  });

  return (
    <motion.div
      ref={columnRef}
      className={clsx(className, 'will-change-transform')}
      style={{ y: smoothedY }}
    >
      {children}
    </motion.div>
  );
}
