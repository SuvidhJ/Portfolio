import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLoadingProgress } from "./useLoadingProgress";
import {
  DEFAULT_TASKS,
  DEFAULT_DURATION_MS,
  PARTICLE_COUNT,
} from "./constants";
import ParticleField from "./ParticleField";
import CodePreview from "./CodePreview";
import ProgressIndicator from "./ProgressIndicator";
import TaskDisplay from "./TaskDisplay";

const LoadingScreen = ({ tasks, duration, onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const {
    progress,
    currentTask,
    nextTask,
    currentTaskIndex,
    isComplete,
    totalTasks,
    taskTransitioning,
  } = useLoadingProgress({
    tasks,
    duration,
    onComplete: () => {
      setTimeout(() => {
        setIsExiting(true);
        onComplete?.();
      }, 500);
    },
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50 overflow-hidden"
          onMouseMove={handleMouseMove}
          role="dialog"
          aria-modal="true"
          aria-label="Loading portfolio"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, #06b6d4 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Particle field background */}
          <ParticleField mouseX={mouseX} mouseY={mouseY} progress={progress} />

          {/* Main content */}
          <div className="relative z-10 max-w-2xl w-full px-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              {/* Logo/Icon with complex animation */}
              <div className="relative inline-block mb-8">
                <motion.div
                  className="text-8xl text-green-400 relative z-10"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  ⚡
                </motion.div>

                {/* Orbiting particles around icon */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                    }}
                    animate={{
                      x: [0, 40 * Math.cos((i * 120 * Math.PI) / 180), 0],
                      y: [0, 40 * Math.sin((i * 120 * Math.PI) / 180), 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Task display with advanced transitions */}
              <TaskDisplay
                currentTask={currentTask}
                nextTask={nextTask}
                progress={progress}
                currentTaskIndex={currentTaskIndex}
                totalTasks={totalTasks}
                taskTransitioning={taskTransitioning}
              />

              {/* Progress indicator with multiple visual elements */}
              <ProgressIndicator
                progress={progress}
                isComplete={isComplete}
                mouseX={mouseX}
                mouseY={mouseY}
              />

              {/* Code preview with typing animation */}
              <CodePreview
                progress={progress}
                currentTask={currentTask}
                isComplete={isComplete}
              />

              {/* Performance metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-6 flex justify-center gap-8 text-xs text-gray-500"
              >
                <div>
                  FPS: <span className="text-green-400">60</span>
                </div>
                <div>
                  Latency: <span className="text-green-400">12ms</span>
                </div>
                <div>
                  Memory: <span className="text-green-400">42MB</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Corner decorations */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map(
            (corner) => (
              <motion.div
                key={corner}
                className={`absolute ${corner.replace("-", "-0 ")} w-32 h-32`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ delay: 0.5 + Math.random() * 0.5 }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d={
                      corner.includes("top")
                        ? corner.includes("left")
                          ? "M0,0 L100,0 L0,100 Z"
                          : "M100,0 L100,100 L0,0 Z"
                        : corner.includes("left")
                        ? "M0,100 L0,0 L100,100 Z"
                        : "M100,100 L0,100 L100,0 Z"
                    }
                    fill="url(#cornerGradient)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="cornerGradient">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LoadingScreen.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.string),
  duration: PropTypes.number,
  onComplete: PropTypes.func,
};

LoadingScreen.defaultProps = {
  tasks: DEFAULT_TASKS,
  duration: DEFAULT_DURATION_MS,
  onComplete: () => {},
};

export default LoadingScreen;
