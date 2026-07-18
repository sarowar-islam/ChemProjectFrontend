import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const lineVariants = {
  hidden: { opacity: 0, y: 28, rotateX: -18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 180,
    damping: 22,
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div ref={containerRef} className="hero-title-scene mb-4 sm:mb-6" style={{ perspective: 1200 }}>
      <motion.div
        className="hero-title-tilt"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <motion.h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
          style={{ transformStyle: 'preserve-3d' }}
          aria-label="Biochemical and Environmental Research Lab"
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className="hero-title-line hero-title-line-primary block"
            custom={0.12}
            variants={lineVariants}
            style={{ transform: 'translateZ(36px)' }}
          >
            Biochemical and Environmental
          </motion.span>
          <motion.span
            className="hero-title-line hero-title-line-accent block mt-1 sm:mt-2"
            custom={0.22}
            variants={lineVariants}
            style={{ transform: 'translateZ(18px)' }}
          >
            Research Lab
          </motion.span>
        </motion.h1>

        <motion.div
          className="hero-title-glow"
          aria-hidden="true"
          style={{ transform: 'translateZ(-20px)' }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  );
}
