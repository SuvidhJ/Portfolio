import React, { useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { PARTICLE_COUNT } from "./constants";

const ParticleField = ({ mouseX, mouseY, progress }) => {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          particle={particle}
          mouseX={mouseX}
          mouseY={mouseY}
          progress={progress}
        />
      ))}
    </div>
  );
};

const Particle = ({ particle, mouseX, mouseY, progress }) => {
  const x = useTransform(
    mouseX,
    [0, window.innerWidth],
    [particle.x - 10, particle.x + 10]
  );
  const y = useTransform(
    mouseY,
    [0, window.innerHeight],
    [particle.y - 10, particle.y + 10]
  );

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        x,
        y,
      }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        delay: particle.delay,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, ${
            progress > 50 ? "#06b6d4" : "#10b981"
          } 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
};

export default ParticleField;
