import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Code2,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Clock,
  Users,
  Zap,
  Trophy,
  Sparkles,
  Terminal,
  Layers,
  Activity,
} from "lucide-react";

import ProjectMetrics from "./ProjectMetrics";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const GlitchText = ({ children, className = "" }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0 -ml-0.5 text-blue-400 opacity-70 animate-glitch-1">
        {children}
      </span>
    </span>
  );
};

const ProjectCard = ({ project, index, isActive, onActivate }) => {
  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.8, 1, 1, 0.8]
  );

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, scale }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Git Branch Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-green-500/0 via-green-500/50 to-green-500/0"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        />
      </div>

      {/* Commit Node */}
      <motion.div
        className="absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: isVisible ? 1 : 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          delay: index * 0.1 + 0.2,
        }}
      >
        <div className="relative">
          <div
            className={`w-5 h-5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-green-400 shadow-lg shadow-green-400/50"
                : "bg-gray-600"
            }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-400"
                  initial={{ scale: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </AnimatePresence>
          </div>
          <GitCommit className="absolute inset-0 w-5 h-5 text-gray-900" />
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        className="ml-20 mb-12"
        initial={{ x: -50, opacity: 0 }}
        animate={{
          x: isVisible ? 0 : -50,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: index * 0.1 + 0.3,
        }}
      >
        <div
          className={`
            relative bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-500
            ${
              isActive
                ? "border-green-500/50 shadow-2xl shadow-green-500/10"
                : "border-gray-700/50 hover:border-gray-600"
            }
          `}
          onClick={() => onActivate(project.id)}
        >
          {/* Project Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                    {project.name}
                    {project.featured && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </h3>
                  <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs font-mono">
                    {project.hash}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Project Stats */}
              <div className="flex flex-col gap-2 ml-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="w-4 h-4" />
                  <span>{project.stars || "0"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <GitFork className="w-4 h-4" />
                  <span>{project.forks || "0"}</span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: isVisible ? 1 : 0 }}
                  transition={{ delay: index * 0.1 + 0.4 + tagIndex * 0.05 }}
                  className="px-3 py-1 bg-gray-700/30 border border-gray-600/30 text-gray-300 rounded-full text-xs font-medium hover:bg-gray-700/50 transition-colors"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Key Features */}
            {project.features && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {project.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      y: isVisible ? 0 : 10,
                    }}
                    transition={{ delay: index * 0.1 + 0.5 + idx * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-400"
                  >
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Project Preview */}
          {project.images && project.images.length > 0 && (
            <div className="relative h-48 overflow-hidden bg-gray-900/50">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={project.images[selectedImage]}
                  alt={`${project.name} preview`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Image Navigation */}
              {project.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {project.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImage === idx
                          ? "bg-green-400 w-6"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Actions */}
          <div className="p-6 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">View Code</span>
              </motion.a>

              <motion.a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-sm font-medium">Live Demo</span>
              </motion.a>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{project.duration || "N/A"}</span>
              </div>
              {project.team && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{project.team}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover Effects */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 via-transparent to-green-500/20 rounded-xl blur-xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Projects Section Component
const ProjectsSection = ({ projects }) => {
  const [activeProject, setActiveProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Extract unique tags for filtering
  const allTags = [...new Set(projects.flatMap((p) => p.tags))];

  // Filter projects
  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.tags.includes(filter));

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      {/* Background Effects
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </motion.div> */}

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="w-8 h-8 text-green-400" />

            <GlitchText className="text-green-400 text-5xl font-semibold">
              Projects
            </GlitchText>

            <GitMerge className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A curated collection of my most impactful projects, showcasing
            innovation, technical excellence, and real-world problem-solving
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-12 flex-wrap"
        >
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-green-500 text-gray-900"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            All Projects
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tag
                  ? "bg-green-500 text-gray-900"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Projects Timeline */}
        <div className="relative">
          {/* Terminal Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-gray-900/50 backdrop-blur-sm rounded-t-lg border border-gray-700/50 p-4"
          >
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-green-400" />
              <code className="text-sm text-gray-400 font-mono">
                <span className="text-green-400">git log</span> --graph
                --pretty=format:'%h - %s' --abbrev-commit
              </code>
            </div>
          </motion.div>

          {/* Projects List */}

          <motion.div
            key={filter}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isActive={activeProject === project.id}
                onActivate={setActiveProject}
              />
            ))}
          </motion.div>

          {/* End of Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center ml-20 mt-8"
          >
            <div className="absolute left-[-52px] w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
              <Layers className="w-3 h-3 text-gray-400" />
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 text-sm text-gray-500 font-mono">
              Initial commit - Journey begins here
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <Activity className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <p className="text-gray-400 text-sm mb-1">Want to see more?</p>
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2"
              >
                Visit my GitHub profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Export the complete solution
export default ProjectsSection;
