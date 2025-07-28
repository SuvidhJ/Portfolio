import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useAnimationControls,
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Filter,
  Grid3X3,
  List,
  BarChart3,
  Eye,
  Code,
  Palette,
  Database,
  Globe,
  Cpu,
  Shield,
  Rocket,
} from "lucide-react";

import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

// Enhanced Glitch Text with multiple layers
const GlitchText = ({ children, className = "", intensity = "medium" }) => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const glitchIntensity = {
    low: { x: 1, y: 0.5 },
    medium: { x: 2, y: 1 },
    high: { x: 4, y: 2 },
  }[intensity];

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-cyan-400 opacity-70"
            style={{ 
              transform: `translate(${glitchIntensity.x}px, -${glitchIntensity.y}px)`,
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
            }}
          >
            {children}
          </span>
          <span 
            className="absolute top-0 left-0 text-red-400 opacity-70"
            style={{ 
              transform: `translate(-${glitchIntensity.x}px, ${glitchIntensity.y}px)`,
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)'
            }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
};

// Responsive breakpoint hook
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < 640,
    isTablet: windowSize.width >= 640 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    isLargeDesktop: windowSize.width >= 1536,
    windowSize,
  };
};

// Enhanced Image Gallery with Lightbox
// const ProjectImageGallery = ({ images, projectName }) => {
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
//   const [touchStart, setTouchStart] = useState(null);
//   const [touchEnd, setTouchEnd] = useState(null);
//   const { isMobile } = useResponsive();

//   const minSwipeDistance = 50;

//   const onTouchStart = (e) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//   };

//   const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) return;
    
//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && selectedImage < images.length - 1) {
//       setSelectedImage(selectedImage + 1);
//     }
//     if (isRightSwipe && selectedImage > 0) {
//       setSelectedImage(selectedImage - 1);
//     }
//   };

//   const handleKeyDown = useCallback((e) => {
//     if (!isLightboxOpen) return;
    
//     if (e.key === 'ArrowLeft' && selectedImage > 0) {
//       setSelectedImage(selectedImage - 1);
//     } else if (e.key === 'ArrowRight' && selectedImage < images.length - 1) {
//       setSelectedImage(selectedImage + 1);
//     } else if (e.key === 'Escape') {
//       setIsLightboxOpen(false);
//     }
//   }, [isLightboxOpen, selectedImage, images.length]);

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [handleKeyDown]);

//   if (!images || images.length === 0) return null;

//   return (
//     <>
//       <div 
//         className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-900/50 cursor-pointer group"
//         onClick={() => setIsLightboxOpen(true)}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//       >
//         {/* <AnimatePresence mode="wait">
//           <motion.img
//             key={selectedImage}
//             src={images[selectedImage]}
//             alt={`${projectName} preview ${selectedImage + 1}`}
//             className="w-full h-full object-cover"
//             initial={{ opacity: 0, scale: 1.1 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//             transition={{ duration: 0.3 }}
//             loading="lazy"
//           />
//         </AnimatePresence> */}

//         {/* Hover Overlay */}
//         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             whileHover={{ opacity: 1, scale: 1 }}
//             className="hidden group-hover:flex items-center gap-2 text-white"
//           >
//             <Maximize2 className="w-5 h-5" />
//             <span className="text-sm font-medium">View Gallery</span>
//           </motion.div>
//         </div>

//         {/* Navigation Arrows - Desktop Only */}
//         {!isMobile && images.length > 1 && (
//           <>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedImage(Math.max(0, selectedImage - 1));
//               }}
//               className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
//               disabled={selectedImage === 0}
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedImage(Math.min(images.length - 1, selectedImage + 1));
//               }}
//               className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
//               disabled={selectedImage === images.length - 1}
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </>
//         )}

//         {/* Image Indicators */}
//         {images.length > 1 && (
//           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
//             {images.map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSelectedImage(idx);
//                 }}
//                 className={`transition-all ${
//                   selectedImage === idx
//                     ? "w-6 h-2 bg-green-400"
//                     : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
//                 } rounded-full`}
//                 aria-label={`Go to image ${idx + 1}`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent pointer-events-none" />
//       </div>

//       {/* Lightbox */}
//       <AnimatePresence>
//         {isLightboxOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
//             onClick={() => setIsLightboxOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               className="relative max-w-6xl w-full"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={() => setIsLightboxOpen(false)}
//                 className="absolute -top-12 right-0 p-2 text-white hover:text-green-400 transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>

//               <img
//                 src={images[selectedImage]}
//                 alt={`${projectName} preview ${selectedImage + 1}`}
//                 className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
//               />

//               {/* Lightbox Navigation */}
//               {images.length > 1 && (
//                 <>
//                   <button
//                     onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
//                     disabled={selectedImage === 0}
//                   >
//                     <ChevronLeft className="w-6 h-6" />
//                   </button>
//                   <button
//                     onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
//                     disabled={selectedImage === images.length - 1}
//                   >
//                     <ChevronRight className="w-6 h-6" />
//                   </button>
//                 </>
//               )}

//               {/* Thumbnails */}
//               <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
//                 {images.map((img, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setSelectedImage(idx)}
//                     className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
//                       selectedImage === idx
//                         ? "border-green-400"
//                         : "border-transparent opacity-60 hover:opacity-100"
//                     }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`Thumbnail ${idx + 1}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
//};

// Enhanced Project Card with Responsive Design
const ProjectCard = ({ project, index, isActive, onActivate, viewMode }) => {
  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  
  const controls = useAnimationControls();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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

  const handleMouseMove = (e) => {
    if (isMobile) return;
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  // Icon mapping for better visual representation
  const techIcons = {
    'React': <Code className="w-3 h-3" />,
    'Node.js': <Cpu className="w-3 h-3" />,
    'TypeScript': <Code2 className="w-3 h-3" />,
    'MongoDB': <Database className="w-3 h-3" />,
    'PostgreSQL': <Database className="w-3 h-3" />,
    'GraphQL': <Globe className="w-3 h-3" />,
    'Docker': <Layers className="w-3 h-3" />,
    'AWS': <Shield className="w-3 h-3" />,
    'UI/UX': <Palette className="w-3 h-3" />,
  };

  // Grid view for mobile/tablet
  if (viewMode === 'grid' && (isMobile || isTablet)) {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <div className={`
          relative bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-500
          ${isActive ? 'border-green-500/50 shadow-2xl shadow-green-500/10' : 'border-gray-700/50 hover:border-gray-600'}
          overflow-hidden
        `}>
          {/* Compact Header for Grid View */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                {project.name}
                {project.featured && <Trophy className="w-4 h-4 text-yellow-500" />}
              </h3>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {project.description}
            </p>
            
            {/* Compact Tech Stack */}
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700/30 text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <ProjectImageGallery images={project.images} projectName={project.name} />

          {/* Actions */}
          <div className="p-4 flex justify-between items-center">
            <div className="flex gap-3">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4 text-gray-300" />
              </a>
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 text-gray-300" />
              </a>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              {isExpanded ? 'Less' : 'More'} details
            </button>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-700/50"
              >
                <div className="p-4 space-y-3">
                  {project.features && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Key Features</h4>
                      <ul className="space-y-1">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                            <Sparkles className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Timeline view (default)
  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, scale }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Git Branch Line - Hidden on mobile */}
      <div className={`absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 ${isMobile ? 'hidden' : ''}`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-green-500/0 via-green-500/50 to-green-500/0"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        />
      </div>

      {/* Commit Node - Responsive positioning */}
      <motion.div
        className={`absolute ${isMobile ? 'left-4' : 'left-8'} top-1/2 -translate-x-1/2 -translate-y-1/2 z-20`}
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
            className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded-full transition-all duration-300 ${
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
          <GitCommit className={`absolute inset-0 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-900`} />
        </div>
      </motion.div>

      {/* Main Card - Responsive margins and padding */}
      <motion.div
        className={`${isMobile ? 'ml-10' : 'ml-20'} mb-8 sm:mb-12`}
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
            ${isActive ? 'border-green-500/50 shadow-2xl shadow-green-500/10' : 'border-gray-700/50 hover:border-gray-600'}
            overflow-hidden
          `}
          onClick={() => onActivate(project.id)}
        >
          {/* Mouse follow effect - Desktop only */}
          {!isMobile && isHovered && (
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(34, 197, 94, 0.1), transparent 40%)`,
              }}
            />
          )}

          {/* Project Header - Responsive */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} pb-0`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-400 flex items-center gap-2`}>
                    {project.name}
                    {project.featured && (
                      <Trophy className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-500`} />
                    )}
                  </h3>
                  <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs font-mono">
                    {project.hash}
                  </span>
                </div>

                <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                  {project.description}
                </p>
              </div>

              {/* Project Stats - Hidden on mobile, shown in footer instead */}
              <div className="hidden sm:flex flex-col gap-2">
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

            {/* Tech Stack - Responsive */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: isVisible ? 1 : 0 }}
                  transition={{ delay: index * 0.1 + 0.4 + tagIndex * 0.05 }}
                  className={`
                    ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'}
                    bg-gray-700/30 border border-gray-600/30 text-gray-300 rounded-full font-medium 
                    hover:bg-gray-700/50 transition-colors flex items-center gap-1
                  `}
                >
                  {techIcons[tag] || null}
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Key Features - Responsive grid */}
            {project.features && (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-3 mb-4`}>
                {project.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      y: isVisible ? 0 : 10,
                    }}
                    transition={{ delay: index * 0.1 + 0.5 + idx * 0.1 }}
                    className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}
                  >
                    <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-green-500 flex-shrink-0`} />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Project Preview */}
          {/* <ProjectImageGallery images={project.images} projectName={project.name} /> */}

          {/* Actions - Responsive */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} pt-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  <Github className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>View Code</span>
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
                  <ExternalLink className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Live Demo</span>
                </motion.a>
              </div>

              {/* Additional Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {/* Mobile: Show stats here */}
                {isMobile && (
                  <>
                                        <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{project.stars || "0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>{project.forks || "0"}</span>
                    </div>
                  </>
                )}
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
          </div>

          {/* Hover Effects */}
          <AnimatePresence>
            {isHovered && !isMobile && (
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

// Advanced Filter Component
const ProjectFilters = ({ filters, activeFilter, onFilterChange, projectCounts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8 sm:mb-12"
    >
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mb-4 text-gray-400 hover:text-green-400 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      )}

      <AnimatePresence>
        {(isExpanded || !isMobile) && (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : false}
            animate={isMobile ? { height: 'auto', opacity: 1 } : false}
            exit={isMobile ? { height: 0, opacity: 0 } : false}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <button
              onClick={() => onFilterChange("all")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeFilter === "all"
                  ? "bg-green-500 text-gray-900 shadow-lg shadow-green-500/25"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                }
              `}
            >
              All Projects
              {projectCounts && (
                <span className="ml-2 text-xs opacity-70">({projectCounts.all})</span>
              )}
            </button>
            
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeFilter === filter
                    ? "bg-green-500 text-gray-900 shadow-lg shadow-green-500/25"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                  }
                `}
              >
                {filter}
                {projectCounts && projectCounts[filter] && (
                  <span className="ml-2 text-xs opacity-70">({projectCounts[filter]})</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// View Mode Selector
const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  const { isMobile } = useResponsive();

  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => onViewModeChange('timeline')}
        className={`
          p-2 rounded-lg transition-all
          ${viewMode === 'timeline'
            ? 'bg-green-500 text-gray-900'
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }
        `}
        aria-label="Timeline view"
      >
        <GitBranch className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`
          p-2 rounded-lg transition-all
          ${viewMode === 'grid'
            ? 'bg-green-500 text-gray-900'
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }
        `}
        aria-label="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      {!isMobile && (
        <button
          onClick={() => onViewModeChange('list')}
          className={`
            p-2 rounded-lg transition-all
            ${viewMode === 'list'
              ? 'bg-green-500 text-gray-900'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }
          `}
          aria-label="List view"
        >
          <List className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Project Statistics Component
const ProjectStatistics = ({ projects }) => {
  const stats = useMemo(() => {
    const totalStars = projects.reduce((acc, p) => acc + (p.stars || 0), 0);
    const totalForks = projects.reduce((acc, p) => acc + (p.forks || 0), 0);
    const languages = [...new Set(projects.flatMap(p => p.tags))];
    const featuredCount = projects.filter(p => p.featured).length;

    return { totalStars, totalForks, languages, featuredCount };
  }, [projects]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
    >
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Star className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalStars}</p>
            <p className="text-xs text-gray-400">Total Stars</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <GitFork className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalForks}</p>
            <p className="text-xs text-gray-400">Total Forks</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Code2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.languages.length}</p>
            <p className="text-xs text-gray-400">Technologies</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.featuredCount}</p>
            <p className="text-xs text-gray-400">Featured</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Projects Section Component
const ProjectsSection = ({ projects }) => {
  const [activeProject, setActiveProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRef = useRef(null);
  const { isMobile, isTablet } = useResponsive();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Extract unique tags and calculate counts
  const { allTags, projectCounts } = useMemo(() => {
    const tags = [...new Set(projects.flatMap((p) => p.tags))];
    const counts = {
      all: projects.length,
    };
    
    tags.forEach(tag => {
      counts[tag] = projects.filter(p => p.tags.includes(tag)).length;
    });

    return { allTags: tags, projectCounts: counts };
  }, [projects]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply tag filter
    if (filter !== "all") {
      filtered = filtered.filter((p) => p.tags.includes(filter));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [projects, filter, searchQuery]);

  // Auto-switch to grid view on mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && viewMode === 'list') {
      setViewMode('grid');
    }
  }, [isMobile, isTablet, viewMode]);

  return (
    <section ref={sectionRef} className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background Effects - Optimized for performance */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10" />
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-green-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl" />
          </>
        )}
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <GitBranch className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-400`} />
            <GlitchText className={`text-green-400 ${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-semibold`}>
              Projects
            </GlitchText>
            <GitMerge className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-400`} />
          </div>
          <p className={`text-gray-400 max-w-2xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
            A curated collection of my most impactful projects, showcasing
            innovation, technical excellence, and real-world problem-solving
          </p>
        </motion.div>

        {/* Project Statistics */}
        <ProjectStatistics projects={projects} />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto mb-6"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors"
            />
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </motion.div>

                {/* View Mode Selector and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
          <ProjectFilters
            filters={allTags}
            activeFilter={filter}
            onFilterChange={setFilter}
            projectCounts={projectCounts}
          />
        </div>

        {/* Projects Display */}
        <div className="relative">
          {/* Terminal Header - Only show in timeline view */}
          {viewMode === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8 bg-gray-900/50 backdrop-blur-sm rounded-t-lg border border-gray-700/50 p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                <Terminal className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-400 flex-shrink-0`} />
                <code className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 font-mono whitespace-nowrap`}>
                  <span className="text-green-400">git log</span> --graph
                  --pretty=format:'%h - %s' --abbrev-commit
                </code>
              </div>
            </motion.div>
          )}

          {/* No Results Message */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center gap-3 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <Code2 className="w-6 h-6 text-gray-500" />
                <div className="text-left">
                  <p className="text-gray-400 mb-1">No projects found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Projects List/Grid */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className={`grid ${
                  isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'
                } gap-4 sm:gap-6`}
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    isActive={activeProject === project.id}
                    onActivate={setActiveProject}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    isActive={activeProject === project.id}
                    onActivate={setActiveProject}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === 'list' && !isMobile && !isTablet && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      bg-gray-800/50 backdrop-blur-sm rounded-lg border transition-all duration-300
                      ${activeProject === project.id
                        ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                        : 'border-gray-700/50 hover:border-gray-600'
                      }
                    `}
                    onClick={() => setActiveProject(project.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-green-400">
                              {project.name}
                            </h3>
                            {project.featured && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs font-mono">
                              {project.hash}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-700/30 text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Github className="w-4 h-4" />
                              <span>Code</span>
                            </a>
                            <a
                              href={project.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Demo</span>
                            </a>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Star className="w-4 h-4" />
                              <span>{project.stars || "0"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <GitFork className="w-4 h-4" />
                              <span>{project.forks || "0"}</span>
                            </div>
                          </div>
                        </div>
                        {/* {project.images && project.images[0] && (
                          <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={project.images[0]}
                              alt={project.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )} */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* End of Timeline - Only show in timeline view */}
          {viewMode === 'timeline' && filteredProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={`relative flex items-center ${isMobile ? 'ml-10' : 'ml-20'} mt-8`}
            >
              <div className={`absolute ${isMobile ? 'left-[-26px]' : 'left-[-52px]'} ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} bg-gray-700 rounded-full flex items-center justify-center`}>
                <Layers className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-gray-400`} />
              </div>
              <div className={`bg-gray-800/30 rounded-lg ${isMobile ? 'p-3' : 'p-4'} border border-gray-700/30 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-mono`}>
                Initial commit - Journey begins here
              </div>
            </motion.div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className={`inline-flex flex-col sm:flex-row items-center gap-4 ${isMobile ? 'p-4' : 'p-6'} bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50`}>
            <Activity className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-green-400`} />
            <div className={`${isMobile ? 'text-center' : 'text-left'}`}>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Want to see more?</p>
              <a
                href="https://github.com/SuvidhJ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2 justify-center sm:justify-start"
              >
                Visit my GitHub profile
                <ExternalLink className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Floating Action Button - Mobile Only */}
        {isMobile && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 p-4 bg-green-500 text-gray-900 rounded-full shadow-lg shadow-green-500/25 z-40"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Rocket className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Performance Optimization Styles */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Optimize for touch devices */
        @media (hover: none) {
          .hover\\:bg-gray-700\\/50:hover {
            background-color: transparent;
          }
        }

        /* Custom scrollbar for project filters */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 2px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }

        /* Glitch animation */
        @keyframes glitch-1 {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

// Export the complete solution
export default ProjectsSection;