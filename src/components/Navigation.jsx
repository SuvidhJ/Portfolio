import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useTransition,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useSpring,
  LayoutGroup,
} from "framer-motion";
import { createPortal } from "react-dom";
import { FiHome, FiUser, FiTool, FiFolder, FiMail } from "react-icons/fi";

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let rafId = null;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (
        direction !== scrollDirection &&
        Math.abs(scrollY - lastScrollY) > 10
      ) {
        startTransition(() => {
          setScrollDirection(direction);
        });
      }

      setLastScrollY(scrollY > 0 ? scrollY : 0);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollDirection, lastScrollY]);

  return { scrollDirection, isPending };
};

const useIntersectionObserver = (sections) => {
  const [activeSection, setActiveSection] = useState("home");
  const observersRef = useRef(new Map());

  useEffect(() => {
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const visibleSections = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visibleSections.length > 0) {
            setActiveSection(visibleSections[0].target.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });

    const timeoutId = setTimeout(() => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          observer.observe(element);
          observersRef.current.set(section, element);
        } else {
          console.warn(`Section with id "${section}" not found`);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      observersRef.current.clear();
    };
  }, [sections]);

  return activeSection;
};

const MagneticButton = React.memo(
  ({
    children,
    className,
    onClick,
    strength = 0.1,
    damping = 20,
    stiffness = 350,
    ...props
  }) => {
    const ref = useRef(null);
    const rafRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = useMemo(
      () => ({
        stiffness,
        damping,
        mass: 0.1,
        restDelta: 0.001,
      }),
      [stiffness, damping]
    );

    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = useCallback(
      (e) => {
        if (!ref.current) return;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        rafRef.current = requestAnimationFrame(() => {
          const rect = ref.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distanceX = (e.clientX - centerX) * strength;
          const distanceY = (e.clientY - centerY) * strength;

          x.set(distanceX);
          y.set(distanceY);
        });
      },
      [x, y, strength]
    );

    const handleMouseLeave = useCallback(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      x.set(0);
      y.set(0);
    }, [x, y]);

    useEffect(() => {
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <motion.button
        ref={ref}
        style={{
          x: springX,
          y: springY,
          willChange: "transform",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={className}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-green-400 origin-left z-50 will-change-transform"
      style={{ scaleX }}
    />
  );
};

const useKeyboardNavigation = (navItems, activeSection, scrollToSection) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const shortcuts = {
          h: "home",
          a: "about",
          s: "skills",
          p: "projects",
          c: "contact",
        };

        const key = e.key.toLowerCase();
        if (shortcuts[key]) {
          e.preventDefault();
          scrollToSection(shortcuts[key]);
          return;
        }
      }

      if (
        [
          "ArrowRight",
          "ArrowLeft",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        const currentIndex = navItems.findIndex(
          (item) => item.id === activeSection
        );

        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown": {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % navItems.length;
            scrollToSection(navItems[nextIndex].id);
            break;
          }

          case "ArrowLeft":
          case "ArrowUp": {
            e.preventDefault();
            const prevIndex =
              currentIndex - 1 < 0 ? navItems.length - 1 : currentIndex - 1;
            scrollToSection(navItems[prevIndex].id);
            break;
          }

          case "Home":
            e.preventDefault();
            scrollToSection(navItems[0].id);
            break;

          case "End":
            e.preventDefault();
            scrollToSection(navItems[navItems.length - 1].id);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navItems, activeSection, scrollToSection]);
};

const MobileMenuPortal = ({ children, isOpen }) => {
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      let root = document.getElementById("mobile-menu-root");
      if (!root) {
        root = document.createElement("div");
        root.id = "mobile-menu-root";
        document.body.appendChild(root);
      }
      setPortalRoot(root);

      return () => {
        if (root && root.childNodes.length === 0) {
          document.body.removeChild(root);
        }
      };
    }
  }, []);

  if (!portalRoot || !isOpen) return null;

  return createPortal(children, portalRoot);
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isLoaded, setIsLoaded] = useState(false);
  const navRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const { scrollDirection } = useScrollDirection();
  // eslint-disable-next-line no-unused-vars
  const [isPending, startTransition] = useTransition();

  // Memoized navigation items with shortcuts
  const navItems = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        icon: <FiHome className="w-5 h-5" />,
        ariaLabel: "Navigate to home section",
        shortcut: "Alt+H",
      },
      {
        id: "about",
        label: "About",
        icon: <FiUser className="w-5 h-5" />,
        ariaLabel: "Navigate to about section",
        shortcut: "Alt+A",
      },
      {
        id: "skills",
        label: "Skills",
        icon: <FiTool className="w-5 h-5" />,
        ariaLabel: "Navigate to skills section",
        shortcut: "Alt+S",
      },
      {
        id: "projects",
        label: "Projects",
        icon: <FiFolder className="w-5 h-5" />,
        ariaLabel: "Navigate to projects section",
        shortcut: "Alt+P",
      },
      {
        id: "contact",
        label: "Contact",
        icon: <FiMail className="w-5 h-5" />,
        ariaLabel: "Navigate to contact section",
        shortcut: "Alt+C",
      },
    ],
    []
  );

  const sections = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const activeSection = useIntersectionObserver(sections);

  useEffect(() => {
    let rafId = null;
    let lastKnownScrollY = 0;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (Math.abs(scrollY - lastKnownScrollY) > 5) {
          startTransition(() => {
            setIsScrolled(scrollY > 50);
          });
          lastKnownScrollY = scrollY;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const scrollTargetRef = useRef(null);

  const handleMenuClick = (sectionId) => {
    scrollTargetRef.current = sectionId;
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = parseInt(document.body.style.top || "0", 10);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, -scrollY);

      if (scrollTargetRef.current) {
        setTimeout(() => {
          const el = document.getElementById(scrollTargetRef.current);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          scrollTargetRef.current = null;
        }, 200);
      }
    }
  }, [isMobileMenuOpen]);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      if ("scrollBehavior" in document.documentElement.style) {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        window.scrollTo(0, offsetPosition);
      }
    }
    setIsMobileMenuOpen(false);
  }, []);

  useKeyboardNavigation(navItems, activeSection, scrollToSection);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <>
      <ScrollProgress />

      <motion.nav
        ref={navRef}
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`
          fixed top-0 left-0 right-0 z-40 
          transition-all duration-300
          ${
            isScrolled
              ? "bg-gray-900/[0.95] backdrop-blur-md shadow-lg border-b border-gray-800/[0.5]"
              : "bg-transparent"
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              className="relative"
            >
              <MagneticButton
                onClick={() => scrollToSection("home")}
                className="text-green-400 font-mono font-bold text-xl cursor-pointer relative group"
                aria-label="Navigate to home"
                strength={0.15}
              >
                <span className="relative z-10">&lt;SuvidhJ/&gt;</span>
                <motion.span
                  className="absolute inset-0 bg-green-400/[0.2] rounded blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </MagneticButton>
            </motion.div>

            <LayoutGroup id="desktop-nav">
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    custom={index}
                    className="relative"
                  >
                    <MagneticButton
                      onClick={() => scrollToSection(item.id)}
                      className={`
                      font-mono text-sm transition-all duration-300 relative py-2 
                      ${
                        activeSection === item.id
                          ? "text-green-400"
                          : "text-gray-400 hover:text-white"
                      }
                    `}
                      aria-label={item.ariaLabel}
                      aria-current={
                        activeSection === item.id ? "page" : undefined
                      }
                      title={item.shortcut}
                      strength={0.08}
                    >
                      <span className="inline-flex items-center space-x-1">
                        <span className="relative z-10">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>

                      {/* Fixed Active indicator */}
                      <AnimatePresence>
                        {activeSection === item.id && (
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-green-400"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-green-400/[0.1] rounded"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </MagneticButton>
                  </motion.div>
                ))}

                {/* Resume button remains the same */}
                <motion.div variants={itemVariants} custom={navItems.length}>
                  <MagneticButton
                    className="relative group overflow-hidden px-4 py-2 bg-green-600 text-white rounded font-mono text-sm transition-all duration-300 hover:bg-green-700"
                    onClick={() =>
                      window.open(
                        "/resume.pdf",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    aria-label="Download resume PDF"
                    strength={0.05}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Resume.pdf
                    </span>

                    <motion.div
                      className="absolute inset-0 bg-green-700"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ type: "tween", duration: 0.3 }}
                    />
                  </MagneticButton>
                </motion.div>
              </div>
            </LayoutGroup>

            {/* Mobile Menu Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-10 h-10 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                    animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Portal */}
      <MobileMenuPortal isOpen={isMobileMenuOpen}>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/[0.5] backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-900 z-50 md:hidden shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                <div className="h-full flex flex-col">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-green-400 font-mono font-bold text-lg"
                    >
                      Navigation
                    </motion.h2>

                    <motion.button
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg transition-colors"
                      aria-label="Close navigation menu"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Mobile Menu Items */}
                  <nav
                    className="flex-1 overflow-y-auto py-6"
                    role="navigation"
                  >
                    <ul className="space-y-2 px-4">
                      {navItems.map((item, index) => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <button
                            onClick={() => handleMenuClick(item.id)}
                            className={`
                              w-full flex items-center justify-between px-4 py-3 rounded-lg font-mono transition-all duration-300 group
                              ${
                                activeSection === item.id
                                  ? "bg-green-400/[0.2] text-green-400"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                              }
                            `}
                            aria-current={
                              activeSection === item.id ? "page" : undefined
                            }
                          >
                            <span className="flex items-center gap-3">
                              <motion.span
                                className="text-sm opacity-60"
                                whileHover={{ scale: 1.2 }}
                              >
                                {item.icon}
                              </motion.span>
                              <span className="text-base">{item.label}</span>
                            </span>

                            <motion.svg
                              className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              initial={{ x: -10 }}
                              whileHover={{ x: 0 }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </motion.svg>
                          </button>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Mobile Resume Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 px-4"
                    >
                      <div className="border-t border-gray-800 pt-6">
                        <button
                          onClick={() =>
                            window.open(
                              "/resume.pdf",
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-mono transition-all duration-300 group"
                          aria-label="Download resume PDF"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download Resume</span>
                          <motion.span
                            className="opacity-0 group-hover:opacity-100"
                            initial={{ x: -5 }}
                            whileHover={{ x: 0 }}
                          >
                            →
                          </motion.span>
                        </button>
                      </div>
                    </motion.div>

                    {/* Social Links in Mobile Menu */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 px-4"
                    >
                      <p className="text-xs text-gray-500 font-mono mb-4">
                        Connect with me
                      </p>
                      <div className="flex gap-4">
                        {[
                          {
                            name: "GitHub",
                            icon: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12",
                            href: "https://github.com/SuvidhJ",
                          },
                          {
                            name: "LinkedIn",
                            icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                            href: "www.linkedin.com/in/suvidh-jain-72a88728a",
                          },
                          {
                            name: "Instagram",
                            icon: "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334",
                            href: "https://www.instagram.com/suvidhjain5/",
                          },
                        ].map((social) => (
                          <motion.a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Visit my ${social.name} profile`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d={social.icon} />
                            </svg>
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>

                    {/* Keyboard shortcuts info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8 px-4 pb-6"
                    >
                      <div className="bg-gray-800/[0.5] rounded-lg p-4">
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          Keyboard shortcuts
                        </p>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Navigate sections</span>
                            <span className="font-mono">← →</span>
                          </div>
                          <div className="flex justify-between">
                            <span>First/Last section</span>
                            <span className="font-mono">Home/End</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Close menu</span>
                            <span className="font-mono">Esc</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MobileMenuPortal>
    </>
  );
};

export default React.memo(Navigation);
