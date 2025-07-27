// components/Skills/SkillCard.jsx
import React, { Fragment } from "react";
import { motion } from "framer-motion";
import { Popover, Transition } from "@headlessui/react";

export default function SkillCard({ skill }) {
  return (
    <Popover className="relative inline-block w-full">
      <Popover.Button
        as={motion.button}
        className="group relative w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-4 flex flex-col items-center transition-transform hover:-translate-y-1 focus-visible:ring-2 ring-primary"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`More info about ${skill.name}`}
      >
        <img
          src={skill.logo}
          alt={`${skill.name} logo`}
          className="w-12 h-12 mb-2 drop-shadow-lg"
          loading="lazy"
        />
        <span className="font-semibold text-lg text-white">{skill.name}</span>
        <div className="w-full mt-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#3b82f6]"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 1.2, delay: 0.2 }}
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
          <span className="block text-xs text-gray-400 mt-1 text-right">
            {skill.level}%
          </span>
        </div>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-gray-900 text-white rounded-lg shadow-xl text-sm">
          {skill.description}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
