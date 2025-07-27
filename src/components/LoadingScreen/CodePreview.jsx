import React, { useMemo } from "react";
import { motion } from "framer-motion";

const CodePreview = ({ progress, currentTask, isComplete }) => {
  const codeLines = useMemo(
    () => [
      { text: "// Initializing portfolio experience", delay: 0 },
      { text: "const developer = {", delay: 0.1 },
      { text: '  name: "Your Name",', delay: 0.2 },
      { text: '  status: "available",', delay: 0.3 },
      { text: '  skills: ["React", "TypeScript", "Node.js"],', delay: 0.4 },
      { text: '  passion: "∞",', delay: 0.5 },
      {
        text: `  progress: ${Math.round(progress)},`,
        delay: 0.6,
        dynamic: true,
      },
      { text: `  currentTask: "${currentTask}",`, delay: 0.7, dynamic: true },
      { text: "  isAwesome: true", delay: 0.8 },
      { text: "};", delay: 0.9 },
      { text: "", delay: 1 },
      {
        text: isComplete ? "// Ready to impress! 🚀" : "// Loading magic...",
        delay: 1.1,
        dynamic: true,
      },
    ],
    [progress, currentTask, isComplete]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="mt-12 relative"
    >
      {/* Terminal window */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
        {/* Terminal header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-500 font-mono">portfolio.js</span>
        </div>

        {/* Code content */}
        <div className="p-6 font-mono text-sm">
          <pre className="text-gray-300">
            {codeLines.map((line, index) => (
              <CodeLine
                key={index}
                text={line.text}
                delay={line.delay}
                isDynamic={line.dynamic}
                isComplete={isComplete}
              />
            ))}
          </pre>
        </div>

        {/* Cursor blink */}
        <motion.span
          className="absolute bottom-6 text-green-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ left: "calc(1.5rem + 12ch)" }}
        >
          |
        </motion.span>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-lg blur-xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

const CodeLine = ({ text, delay, isDynamic, isComplete }) => {
  const displayText = isDynamic ? text : text;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + 0.5, duration: 0.3 }}
      className="leading-relaxed"
    >
      {displayText.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 + i * 0.02 }}
          className={
            char === '"'
              ? "text-green-400"
              : char === ":" || char === ";" || char === ","
              ? "text-gray-500"
              : /\d/.test(char)
              ? "text-cyan-400"
              : text.includes("//")
              ? "text-gray-600"
              : "text-gray-300"
          }
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default CodePreview;
