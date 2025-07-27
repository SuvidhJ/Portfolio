import React from "react";
import { motion, useTransform } from "framer-motion";

const ProgressIndicator = ({ progress, isComplete, mouseX, mouseY }) => {
  const progressScale = useTransform([mouseX, mouseY], ([x, y]) => {
    const distance = Math.sqrt(
      Math.pow(x - window.innerWidth / 2, 2) +
        Math.pow(y - window.innerHeight / 2, 2)
    );
    return 1 + Math.min(distance / 1000, 0.05);
  });

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main progress bar */}
      <motion.div
        className="relative h-2 bg-gray-800 rounded-full overflow-hidden"
        style={{ scale: progressScale }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Loading progress: ${Math.round(progress)}%`}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16, 185, 129, 0.1) 10px, rgba(16, 185, 129, 0.1) 20px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Primary progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        >
          <div className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 relative overflow-hidden">
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </motion.div>
          </div>
        </motion.div>

        {/* Progress glow effect */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
          style={{
            left: `${progress}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-cyan-400 rounded-full blur-md" />
        </motion.div>
      </motion.div>

      {/* Progress percentage with advanced styling */}
      <div className="flex justify-between items-center mt-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-500"
        >
          <span className="text-green-400">●</span> Loading assets
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            {Math.round(progress)}%
          </span>
          {isComplete && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-400"
            >
              ✓
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Mini progress indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="w-8 h-1 rounded-full overflow-hidden bg-gray-800"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
              initial={{ width: "0%" }}
              animate={{ width: progress >= (i + 1) * 10 ? "100%" : "0%" }}
              transition={{ duration: 0.1, delay: i * 0.1 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
