// components/LoadingScreen/useLoadingProgress.js
import { useState, useEffect, useRef, useCallback } from "react";
import {
  DEFAULT_TASKS,
  DEFAULT_DURATION_MS,
  TICK_INTERVAL_MS,
  EASING_FUNCTIONS,
  TASK_DISPLAY_DURATION_MS,
} from "./constants";

export const useLoadingProgress = ({
  tasks = DEFAULT_TASKS,
  duration = DEFAULT_DURATION_MS,
  easingFunction = "easeInOutCubic",
  onComplete,
} = {}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskTransitioning, setTaskTransitioning] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previousTaskIndexRef = useRef(0);
  const lastTaskChangeRef = useRef(0);

  const easing = EASING_FUNCTIONS[easingFunction] || EASING_FUNCTIONS.easeInOutCubic;

  // Calculate minimum time per task to ensure readability
  const minTimePerTask = Math.max(
    TASK_DISPLAY_DURATION_MS,
    duration / tasks.length
  );

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      lastTaskChangeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(rawProgress) * 100;

    setProgress(easedProgress);

    // Calculate which task should be showing based on progress
    // But ensure each task is shown for minimum duration
    const timeSinceLastTaskChange = timestamp - lastTaskChangeRef.current;
    const theoreticalTaskIndex = Math.min(
      Math.floor((easedProgress / 100) * tasks.length),
      tasks.length - 1
    );

    // Only change task if minimum display time has passed
    if (
      theoreticalTaskIndex !== previousTaskIndexRef.current &&
      timeSinceLastTaskChange >= minTimePerTask
    ) {
      setTaskTransitioning(true);
      
      // Small delay to allow exit animation
      setTimeout(() => {
        setCurrentTaskIndex(theoreticalTaskIndex);
        previousTaskIndexRef.current = theoreticalTaskIndex;
        lastTaskChangeRef.current = timestamp;
        setTaskTransitioning(false);
      }, 200);
    }

    if (rawProgress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Ensure we show the last task
      if (currentTaskIndex !== tasks.length - 1) {
        setTaskTransitioning(true);
        setTimeout(() => {
          setCurrentTaskIndex(tasks.length - 1);
          setTaskTransitioning(false);
          setTimeout(() => {
            setIsComplete(true);
            onComplete?.();
          }, 500);
        }, 200);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    }
  }, [duration, easing, tasks.length, onComplete, currentTaskIndex, minTimePerTask]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const currentTask = tasks[currentTaskIndex];
  const nextTask = tasks[Math.min(currentTaskIndex + 1, tasks.length - 1)];

  return {
    progress: Math.min(progress, 100),
    currentTask,
    nextTask,
    currentTaskIndex,
    isComplete,
    totalTasks: tasks.length,
    taskTransitioning,
  };
};