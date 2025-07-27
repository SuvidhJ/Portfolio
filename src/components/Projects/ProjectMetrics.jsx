// components/ProjectMetrics.jsx
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Code, Zap } from "lucide-react";

const ProjectMetrics = ({ metrics }) => {
  const metricIcons = {
    performance: Zap,
    users: Users,
    codeQuality: Code,
    growth: TrendingUp,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {Object.entries(metrics).map(([key, value], index) => {
        const Icon = metricIcons[key];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.02,
              duration: 0.1, // Fast animation
              ease: "easeOut",
            }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProjectMetrics;
