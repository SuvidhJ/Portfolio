import { useEffect } from 'react';

export const useKeyboardShortcut = (keys, callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMatch = keys.some((key) => {
        const parts = key.toLowerCase().split("+");
        const hasCtrl = parts.includes("ctrl");
        const hasCmd = parts.includes("cmd");
        const hasShift = parts.includes("shift");
        const hasAlt = parts.includes("alt");
        const mainKey = parts[parts.length - 1];

        return (
          (hasCtrl ? event.ctrlKey : true) &&
          (hasCmd ? event.metaKey : true) &&
          (hasShift ? event.shiftKey : true) &&
          (hasAlt ? event.altKey : true) &&
          event.key.toLowerCase() === mainKey
        );
      });

      if (isMatch) {
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback]);
};