// components/LoadingScreen/TaskDisplay.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const TaskDisplay = ({
  currentTask,
  nextTask,
  progress,
  currentTaskIndex,
  totalTasks,
  taskTransitioning,
}) => {
  return (
    <div className="relative h-24 mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTask}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.6,
              ease: [0.43, 0.13, 0.23, 0.96],
              opacity: { duration: 0.4 },
              y: { duration: 0.5 },
              scale: { duration: 0.4 },
            },
          }}
          exit={{
            opacity: 0,
            y: -30,
            scale: 0.9,
            transition: {
              duration: 0.4,
              ease: [0.43, 0.13, 0.23, 0.96],
            },
          }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          {/* Remove blur from animations - it's causing the readability issue */}
          <motion.h1
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {currentTask}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-3 mt-3"
          >
            <span className="text-sm text-gray-500">
              Step {currentTaskIndex + 1} of {totalTasks}
            </span>

            {/* Progress dots for each task */}
            <div className="flex gap-1">
              {[...Array(totalTasks)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    i <= currentTaskIndex ? "bg-green-400" : "bg-gray-700"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: i === currentTaskIndex ? 1.5 : 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Preview of next task - only show when not transitioning */}
      {progress < 95 && !taskTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-10 left-0 right-0 text-center text-xs text-gray-600"
        >
          Next: {nextTask}
        </motion.div>
      )}
    </div>
  );
};

export default TaskDisplay;
