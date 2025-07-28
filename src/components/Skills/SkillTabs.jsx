// components/Skills/SkillTabs.jsx
import React, { useState, useRef } from "react";
import { skills } from "../../data/skills";
import SkillCard from "./SkillCard";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  "All",
  ...Array.from(new Set(skills.map((s) => s.category))),
];

// Responsive display counts
const INITIAL_DISPLAY_COUNT = {
  mobile: 4,
  tablet: 6,
  desktop: 8,
};

const LOAD_MORE_COUNT = {
  mobile: 4,
  tablet: 6,
  desktop: 8,
};

export default function SkillTabs() {
  const [selected, setSelected] = useState("All");
  const [query, setQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(
    INITIAL_DISPLAY_COUNT.desktop
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const skillsGridRef = useRef(null);

  // Get responsive counts based on window width
  const getResponsiveCounts = () => {
    if (typeof window === "undefined") return { initial: 8, loadMore: 8 };

    const width = window.innerWidth;
    if (width < 640) {
      // mobile
      return {
        initial: INITIAL_DISPLAY_COUNT.mobile,
        loadMore: LOAD_MORE_COUNT.mobile,
      };
    } else if (width < 1024) {
      // tablet
      return {
        initial: INITIAL_DISPLAY_COUNT.tablet,
        loadMore: LOAD_MORE_COUNT.tablet,
      };
    } else {
      // desktop
      return {
        initial: INITIAL_DISPLAY_COUNT.desktop,
        loadMore: LOAD_MORE_COUNT.desktop,
      };
    }
  };

  // Update display count on window resize
  React.useEffect(() => {
    const handleResize = () => {
      const { initial } = getResponsiveCounts();
      if (!isExpanded) {
        setDisplayCount(initial);
      }
    };

    // Set initial count
    const { initial } = getResponsiveCounts();
    setDisplayCount(initial);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const filtered = skills.filter(
    (s) =>
      (selected === "All" || s.category === selected) &&
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayedSkills = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;
  const { initial } = getResponsiveCounts();
  const canCollapse = displayCount > initial;

  const handleLoadMore = () => {
    const { loadMore } = getResponsiveCounts();
    setDisplayCount((prev) => prev + loadMore);
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    const { initial } = getResponsiveCounts();
    setDisplayCount(initial);
    setIsExpanded(false);

    if (skillsGridRef.current) {
      const width = window.innerWidth;
      const yOffset = width < 640 ? -60 : -100; // Smaller offset on mobile
      const element = skillsGridRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  // Reset display count when category or search changes
  React.useEffect(() => {
    const { initial } = getResponsiveCounts();
    setDisplayCount(initial);
    setIsExpanded(false);
  }, [selected, query]);

  return (
    <section className="w-full max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        {/* Category buttons - horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  selected === cat
                    ? "bg-[#10b981] text-white shadow"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelected(cat)}
                aria-pressed={selected === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search input - full width on mobile */}
        <div className="w-full sm:max-w-xs sm:ml-auto">
          <input
            type="search"
            placeholder="Search skills..."
            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-800 text-white text-sm sm:text-base focus:outline-none focus:ring-2 ring-[#10b981] placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search skills"
          />
        </div>
      </div>

      {/* Skills grid - responsive columns */}
      <motion.div
        ref={skillsGridRef}
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
      >
        <AnimatePresence>
          {displayedSkills.length ? (
            displayedSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <SkillCard skill={skill} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-full text-center text-gray-400 py-8 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No skills found.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons - stack on mobile */}
      {(hasMore || canCollapse) && (
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#10b981] text-white rounded-lg font-medium text-sm sm:text-base hover:bg-[#0ea571] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>Load More ({filtered.length - displayCount})</span>
            </button>
          )}

          {canCollapse && (
            <button
              onClick={handleCollapse}
              className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span>Show Less</span>
            </button>
          )}
        </motion.div>
      )}
    </section>
  );
}
