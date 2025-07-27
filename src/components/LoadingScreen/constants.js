// components/LoadingScreen/constants.js
export const DEFAULT_TASKS = [
  "Initializing quantum processors...",
  "Compiling excellence modules...",
  "Loading portfolio assets...",
  "Optimizing user experience...",
  "Calibrating awesomeness levels...",
  "Preparing to impress...",
];

export const DEFAULT_DURATION_MS = 5000;
export const TICK_INTERVAL_MS = 16; // 60fps
export const PARTICLE_COUNT = 50;
export const TASK_DISPLAY_DURATION_MS = 700; // Minimum time each task is displayed

export const EASING_FUNCTIONS = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
};
