// src/ui/motion.ts
import { Transition, Variants } from 'framer-motion';

export const springConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springSlowConfig: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 40,
};

export const easeInOut: Transition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.25,
};

// Common variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeInOut },
  exit: { opacity: 0, transition: { ...easeInOut, duration: 0.15 } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: springConfig },
  exit: { opacity: 0, y: 10, transition: easeInOut },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springConfig },
  exit: { opacity: 0, scale: 0.95, transition: easeInOut },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};
