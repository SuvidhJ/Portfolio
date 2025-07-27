// components/Skills/SkillTabs.jsx
import React, { useState } from "react";
import { skills } from "../../data/skills";
import SkillCard from "./SkillCard";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  "All",
  ...Array.from(new Set(skills.map((s) => s.category))),
];

export default function SkillTabs() {
  const [selected, setSelected] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = skills.filter(
    (s) =>
      (selected === "All" || s.category === selected) &&
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
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
        <input
          type="search"
          placeholder="Search skills..."
          className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ring-[#10b981]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search skills"
        />
      </div>
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filtered.length ? (
            filtered.map((skill) => (
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
              className="col-span-full text-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No skills found.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
