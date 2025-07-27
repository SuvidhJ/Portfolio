import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  ClipboardIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlayIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CloudArrowDownIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useDebounce } from "../../hooks/useDebounce";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../utils/cn";

const detectLanguage = (code) => {
  const patterns = {
    javascript: /(?:function|const|let|var|=>|class|import|export|async|await)/,
    typescript: /(?:interface|type|enum|namespace|declare|implements|readonly)/,
    jsx: /(?:<[A-Z][a-zA-Z]*|<\/|className=|onClick=)/,
    python: /(?:def|class|import|from|if __name__|print|lambda)/,
    css: /(?:\.[\w-]+\s*{|#[\w-]+\s*{|@media|:root)/,
    html: /(?:<html|<body|<div|<span|<p|<h[1-6])/i,
    json: /^\s*{[\s\S]*}\s*$|^\s*```math[\s\S]*```\s*$/,
    sql: /(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP)/i,
    markdown:
      /(?:^#{1,6}\s|^\*{1,2}|^\-\s|^```math.*```KATEX_INLINE_OPEN.*KATEX_INLINE_CLOSE|```)/m,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) return lang;
  }
  return "plaintext";
};

const customTheme = {
  ...vscDarkPlus,
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    fontFamily:
      '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: "0.875rem",
    lineHeight: "1.7",
    fontVariantLigatures: "contextual",
  },
};

const LiveEditor = ({
  initialCode = "",
  language: propLanguage,
  onCodeChange,
  enableLivePreview = false,
  enableFormatting = true,
  enableHistory = true,
  maxHistorySize = 50,
  className,
  editorHeight = "h-96",
  showLineNumbers = true,
  theme = customTheme,
  customActions = [],
  readOnly = false,
  autoSave = true,
  autoSaveDelay = 1000,
  storageKey = "liveEditorCode",
}) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState([initialCode]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [savedCode, setSavedCode] = useLocalStorage(storageKey, initialCode);
  const [language, setLanguage] = useState(
    propLanguage || detectLanguage(initialCode)
  );
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const debouncedCode = useDebounce(code, autoSaveDelay);

  useEffect(() => {
    if (!propLanguage) {
      const detectedLang = detectLanguage(code);
      setLanguage(detectedLang);
    }
  }, [code, propLanguage]);

  useEffect(() => {
    if (autoSave && debouncedCode !== savedCode) {
      setSavedCode(debouncedCode);
    }
  }, [debouncedCode, autoSave, savedCode, setSavedCode]);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  const addToHistory = useCallback(
    (newCode) => {
      if (!enableHistory) return;

      setHistory((prev) => {
        const newHistory = [...prev.slice(0, historyIndex + 1), newCode];
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, maxHistorySize - 1));
    },
    [enableHistory, historyIndex, maxHistorySize]
  );

  const updateCode = useCallback(
    (newCode) => {
      if (readOnly) return;

      startTransition(() => {
        setCode(newCode);
        addToHistory(newCode);
      });
    },
    [readOnly, addToHistory]
  );

  useKeyboardShortcut(["cmd+s", "ctrl+s"], (e) => {
    e.preventDefault();
    setSavedCode(code);
  });

  useKeyboardShortcut(["cmd+z", "ctrl+z"], (e) => {
    if (enableHistory && historyIndex > 0) {
      e.preventDefault();
      setHistoryIndex((prev) => prev - 1);
      setCode(history[historyIndex - 1]);
    }
  });

  useKeyboardShortcut(["cmd+shift+z", "ctrl+shift+z"], (e) => {
    if (enableHistory && historyIndex < history.length - 1) {
      e.preventDefault();
      setHistoryIndex((prev) => prev + 1);
      setCode(history[historyIndex + 1]);
    }
  });

  useKeyboardShortcut(["cmd+/", "ctrl+/"], (e) => {
    e.preventDefault();
    setIsEditing((prev) => !prev);
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code]);

  const formatCode = useCallback(() => {
    if (!enableFormatting) return;

    const lines = code.split("\n");
    let indentLevel = 0;
    const formatted = lines
      .map((line) => {
        const trimmed = line.trim();

        if (trimmed.match(/^[}```KATEX_INLINE_CLOSE]/)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indented = "  ".repeat(indentLevel) + trimmed;

        if (trimmed.match(/[{```math KATEX_INLINE_OPEN]$/)) {
          indentLevel++;
        }

        return indented;
      })
      .join("\n");

    updateCode(formatted);
  }, [code, enableFormatting, updateCode]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const takeScreenshot = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.background = "#1e1e1e";
      tempContainer.style.padding = "20px";
      tempContainer.style.borderRadius = "8px";
      document.body.appendChild(tempContainer);

      const codeContent = editorRef.current.querySelector("pre");
      if (codeContent) {
        const clone = codeContent.cloneNode(true);
        tempContainer.appendChild(clone);

        const dataUrl = await domToImage(tempContainer);

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "code-screenshot.png";
        a.click();
        URL.revokeObjectURL(url);
      }

      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error("Failed to take screenshot:", err);
      handleCopy();
      alert("Screenshot failed. Code copied to clipboard instead.");
    }
  }, [handleCopy]);

  const domToImage = async (element) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const rect = element.getBoundingClientRect();

    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#e0e0e0";
    ctx.font = "14px monospace";

    const lines = code.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, 10, 20 + i * 20);
    });

    return canvas.toDataURL("image/png");
  };

  // Toolbar actions
  const toolbarActions = useMemo(
    () => [
      {
        icon: isEditing ? EyeIcon : CodeBracketIcon,
        label: isEditing ? "View" : "Edit",
        onClick: () => setIsEditing(!isEditing),
        shortcut: "⌘/",
        primary: true,
      },
      {
        icon: copied ? CheckIcon : ClipboardIcon,
        label: copied ? "Copied!" : "Copy",
        onClick: handleCopy,
        shortcut: "⌘C",
      },
      
      ...(enableFormatting
        ? [
            {
              icon: DocumentDuplicateIcon,
              label: "Format",
              onClick: formatCode,
            },
          ]
        : []),
      {
        icon: CloudArrowDownIcon,
        label: "Download",
        onClick: downloadCode,
      },
      {
        icon: PhotoIcon,
        label: "Screenshot",
        onClick: takeScreenshot,
      },
      ...(enableHistory
        ? [
            {
              icon: ArrowPathIcon,
              label: "Reset",
              onClick: () => {
                updateCode(initialCode);
                setHistory([initialCode]);
                setHistoryIndex(0);
              },
            },
          ]
        : []),
      ...customActions,
    ],
    [
      isEditing,
      copied,
      enableFormatting,
      enableHistory,
      handleCopy,
      formatCode,
      downloadCode,
      takeScreenshot,
      updateCode,
      initialCode,
      customActions,
    ]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newCode = code.substring(0, start) + "  " + code.substring(end);
        updateCode(newCode);

        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }, 0);
      }
    },
    [code, updateCode]
  );

  const lineNumbers = useMemo(() => {
    if (!showLineNumbers) return null;
    const lines = code.split("\n").length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }, [code, showLineNumbers]);

  return (
    <motion.div
      ref={editorRef}
      className={cn(
        "relative group rounded-xl overflow-hidden",
        "bg-gray-900 border border-gray-800",
        "shadow-2xl shadow-black/50",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
          {language}
        </span>

        <div className="relative">
          <motion.button
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
            className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isToolbarExpanded ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </motion.button>

          <AnimatePresence>
            {isToolbarExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 z-20 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 min-w-[200px]"
              >
                {toolbarActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      // Close toolbar after action (except for primary actions)
                      if (!action.primary) {
                        setIsToolbarExpanded(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-md transition-all duration-200",
                      "hover:bg-gray-700 active:scale-95",
                      action.primary &&
                        "bg-blue-600 hover:bg-blue-700 text-white",
                      !action.primary && "text-gray-300 hover:text-white"
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-3">
                      <action.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </div>
                    {action.shortcut && (
                      <span className="text-xs text-gray-500 ml-2">
                        {action.shortcut}
                      </span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("relative", editorHeight)}
          >
            {showLineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-950 text-gray-600 text-xs font-mono pt-4 select-none">
                {lineNumbers?.map((num) => (
                  <div key={num} className="px-3 leading-[1.7]">
                    {num}
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full h-full p-4 bg-transparent text-gray-300",
                "font-mono text-sm leading-[1.7] resize-none outline-none",
                showLineNumbers && "pl-16",
                readOnly && "cursor-not-allowed opacity-75"
              )}
              style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
              spellCheck={false}
              readOnly={readOnly}
              placeholder="// Start coding..."
            />
          </motion.div>
        ) : (
          <motion.div
            key="viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("overflow-auto", editorHeight)}
          >
            <SyntaxHighlighter
              language={language}
              style={theme}
              customStyle={{
                margin: 0,
                padding: "1rem",
                paddingLeft: showLineNumbers ? "3.5rem" : "1rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.7",
              }}
              showLineNumbers={showLineNumbers}
              lineNumberStyle={{
                minWidth: "2.5rem",
                paddingRight: "1rem",
                color: "#4a5568",
                userSelect: "none",
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {code || "// No code yet"}
            </SyntaxHighlighter>
          </motion.div>
        )}
      </AnimatePresence>

      {enableLivePreview && (
        <LivePreviewPanel code={code} language={language} />
      )}

      <StatusBar
        code={code}
        language={language}
        isPending={isPending}
        savedCode={savedCode}
        historyIndex={historyIndex}
        historyLength={history.length}
      />
    </motion.div>
  );
};

const LivePreviewPanel = ({ code, language }) => {
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    if (language === "javascript" || language === "jsx") {
      try {
        const safeEval = (code) => {
          if (code.includes("while") || code.includes("for")) {
            const hasBreak = code.includes("break") || code.includes("return");
            if (!hasBreak) {
              throw new Error("Potentially unsafe loop detected");
            }
          }

          try {
            const result = new Function(
              '"use strict"; return (' + code + ")"
            )();
            return result;
          } catch (e) {
            new Function('"use strict"; ' + code)();
            return "Code executed successfully";
          }
        };

        const result = safeEval(code);
        setOutput(
          typeof result === "object"
            ? JSON.stringify(result, null, 2)
            : String(result)
        );
        setError(null);
      } catch (err) {
        setError(err.message);
        setOutput(null);
      }
    }
  }, [code, language]);

  if (language !== "javascript" && language !== "jsx") return null;

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      className="border-t border-gray-800 bg-gray-950"
    >
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-2">
          LIVE OUTPUT
        </h3>
        {error ? (
          <div className="text-red-400 text-sm font-mono">{error}</div>
        ) : (
          <pre className="text-green-400 text-sm font-mono overflow-x-auto">
            {output}
          </pre>
        )}
      </div>
    </motion.div>
  );
};

// Status Bar Component
const StatusBar = ({
  code,
  language,
  isPending,
  savedCode,
  historyIndex,
  historyLength,
}) => {
  const lines = code.split("\n").length;
  const characters = code.length;
  const words = code.split(/\s+/).filter(Boolean).length;
  const isSaved = code === savedCode;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-t border-gray-800 text-xs text-gray-500">
      <div className="flex items-center space-x-4">
        <span className="flex items-center">
          {isPending ? (
            <motion.div
              className="w-2 h-2 bg-yellow-500 rounded-full mr-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          ) : (
            <div
              className={cn(
                "w-2 h-2 rounded-full mr-2",
                isSaved ? "bg-green-500" : "bg-orange-500"
              )}
            />
          )}
          {isSaved ? "Saved" : "Unsaved"}
        </span>
        <span>{language}</span>
        <span>UTF-8</span>
      </div>
      <div className="flex items-center space-x-4">
        {historyLength > 1 && (
          <span>
            History: {historyIndex + 1}/{historyLength}
          </span>
        )}
        <span>{lines} lines</span>
        <span>{words} words</span>
        <span>{characters} chars</span>
      </div>
    </div>
  );
};

const PortfolioShowcase = () => {
  const [selectedCode, setSelectedCode] = useState("");

  const codeExamples = {
    react: `// Advanced React Hook Example
const useAsyncState = (asyncFunction) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const data = await asyncFunction();
        
        if (mounted) {
          setState({ loading: false, error: null, data });
        }
      } catch (error) {
        if (mounted) {
          setState({ loading: false, error, data: null });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [asyncFunction]);

  return state;
};`,
    typescript: `// TypeScript Generic Constraints
interface Repository<T extends { id: string }> {
  find(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class UserRepository implements Repository<User> {
  async find(id: string): Promise<User | null> {
    // Implementation
    return null;
  }
  
  async findAll(): Promise<User[]> {
    // Implementation
    return [];
  }
  
  // ... other methods
}`,
    performance: `// Performance Optimization Pattern
const VirtualList = ({ items, itemHeight, containerHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};`,
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Code Showcase
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(codeExamples).map(([key, code]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedCode(code)}
              className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-600 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="text-lg font-semibold text-white capitalize mb-2">
                {key} Example
              </h3>
              <p className="text-sm text-gray-400">Click to load in editor</p>
            </motion.button>
          ))}
        </div>

        <LiveEditor
          initialCode={selectedCode || codeExamples.react}
          enableLivePreview={true}
          enableFormatting={true}
          enableHistory={true}
          showLineNumbers={true}
          autoSave={true}
          editorHeight="h-[500px]"
          onCodeChange={(newCode) => console.log("Code changed:", newCode)}
          customActions={[
            {
              icon: PlayIcon,
              label: "Run",
              onClick: () => console.log("Running code..."),
              primary: true,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default LiveEditor;
