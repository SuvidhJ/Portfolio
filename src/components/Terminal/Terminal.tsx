import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useTransition,
  useDeferredValue,
  useId,
  type KeyboardEvent,
  type ChangeEvent,
  type FC,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { z } from "zod";

type CommandName = string & { readonly brand: unique symbol };
type TerminalLineId = string & { readonly brand: unique symbol };

interface TerminalLine {
  id: TerminalLineId;
  type: "command" | "output" | "error" | "system";
  text: string;
  timestamp: number;
  metadata?: {
    duration?: number;
    user?: string;
    status?: "success" | "error" | "pending";
  };
}

interface CommandResult {
  output: string[];
  action?: () => void | Promise<void>;
  type?: "success" | "error" | "info";
  animate?: boolean;
}

interface TerminalState {
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  isProcessing: boolean;
  currentDirectory: string;
  environment: Map<string, string>;
}

const commandSchema = z.object({
  name: z.string().min(1),
  args: z.array(z.string()),
  flags: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

class TerminalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          <h3 className="font-bold mb-2">Terminal Error</h3>
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Terminal Component
const Terminal: FC = () => {
  // State management
  const [state, setState] = useState<TerminalState>({
    lines: [],
    history: [],
    historyIndex: -1,
    isProcessing: false,
    currentDirectory: "~",
    environment: new Map([
      ["USER", "portfolio-visitor"],
      ["SHELL", "/bin/zsh"],
      ["TERM", "xterm-256color"],
    ]),
  });

  const [currentCommand, setCurrentCommand] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredCommand = useDeferredValue(currentCommand);
  const terminalId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const addLine = useCallback((line: Omit<TerminalLine, "id">) => {
    setState((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          ...line,
          id: crypto.randomUUID() as TerminalLineId,
        },
      ],
    }));
  }, []);

  const clearTerminal = useCallback(() => {
    setState((prev) => ({ ...prev, lines: [] }));
  }, []);

  const addToHistory = useCallback((command: string) => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history, command],
      historyIndex: prev.history.length + 1,
    }));
  }, []);

  // Virtual scrolling setup
  // const virtualizer = useVirtualizer({
  //   count: state.lines.length,
  //   getScrollElement: () => scrollRef.current,
  //   estimateSize: () => 24,
  //   overscan: 10,
  // });

  // Command parser
  const parseCommand = (
    input: string
  ): ReturnType<typeof commandSchema.parse> => {
    const tokens = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const [name = "", ...rest] = tokens;

    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < rest.length; i++) {
      const token = rest[i];
      if (token.startsWith("--")) {
        const [key, value] = token.slice(2).split("=");
        flags[key] = value || true;
      } else if (token.startsWith("-")) {
        flags[token.slice(1)] = true;
      } else {
        args.push(token.replace(/^"|"$/g, ""));
      }
    }

    return commandSchema.parse({ name, args, flags });
  };

  // Smooth scroll helper
  const smoothScrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, []);

  // Command definitions
  const commands = useMemo(
    //TODO: CHANGE INFO
    () => ({
      help: (): CommandResult => ({
        output: [
          "╭─────────────────────────────────────────────────────╮",
          "│  Portfolio Terminal v1.0 - Available Commands       │",
          "╰─────────────────────────────────────────────────────╯",
          "",
          "  Navigation:",
          "    about          - Learn about me",
          "    skills         - View my technical expertise",
          "    projects       - Browse my portfolio",
          // "    experience     - View work history",
          "    contact        - Get in touch",
          "",
          "  Actions:",
          "    resume         - Download my resume",
          "    github         - Visit my GitHub profile",
          "    linkedin       - Connect on LinkedIn",
          "    email          - Send me an email",
          "",
          "  Terminal:",
          "    clear          - Clear terminal output",
          "    history        - View command history",
          "",
          "  Fun:",
          "    hire           - Instant hire mode 😉",
          "    matrix         - Enter the Matrix",
          "    fortune        - Get your fortune",
          "",
          "  Use ↑/↓ arrows for command history",
          "  Tab for auto-completion",
          "  Ctrl+L to clear screen",
        ],
        animate: true,
      }),

      about: (): CommandResult => ({
        output: [
          "Initializing profile data...",
          "",
          "┌─ About Me ─────────────────────────────────────────┐",
          "│                                                     │",
          "│  Full Stack Developer | UI/UX Enthusiast           │",
          "│  Passionate about creating exceptional digital      │",
          "│  experiences with modern web technologies.          │",
          "│                                                     │",
          "│  🚀 1+ years of experience                         │",
          "│  💡 Problem solver & creative thinker              │",
          "│  🎯 Detail-oriented & performance-focused          │",
          "│  🤝 Excellent team player & communicator           │",
          "│                                                     │",
          "└─────────────────────────────────────────────────────┘",
        ],
        action: () => smoothScrollToSection("about"),
        type: "success",
      }),

      skills: (): CommandResult => {
        const skills = {
          Programming_Languages: [
            "C/C++",
            "Python",
            "Java",
            "JavaScript",
            "TypeScript",
          ],
          Web_Technologies: [
            "React.js",
            "Next.js",
            "Node.js",
            "Express.js",
            "RESTful APIs",
            "HTML5",
            "CSS3",
            "Tailwind CSS",
            "shadcn/ui",
          ],
          Databases_Data: [
            "MySQL",
            "MongoDB",
            "Pandas",
            "NumPy",
            "Scikit-learn",
          ],
          AI_ML_Frameworks: ["TensorFlow", "PyTorch"],
          Developer_Tools: [
            "Git",
            "Docker",
            "Kubernetes",
            "Azure",
            "Turborepo",
            "VS Code",
          ],
          Core_CS: ["Data Structures & Algorithms", "OOPS", "DBMS"],
          Soft_Skills: [
            "Problem Solving",
            "Team Collaboration",
            "Time Management",
            "Adaptability",
            "Communication",
          ],
        };

        const output = ["Loading skill matrix...", ""];

        Object.entries(skills).forEach(([category, items]) => {
          output.push(`${category}:`);
          items.forEach((skill) => {
            const level = Math.floor(Math.random() * 20) + 80;
            const bar =
              "█".repeat(Math.floor(level / 5)) +
              "░".repeat(20 - Math.floor(level / 5));
            output.push(`  ${skill.padEnd(15)} [${bar}] ${level}%`);
          });
          output.push("");
        });

        return { output, animate: true };
      },

      projects: (): CommandResult => ({
        output: [
          "Loading project portfolio...",
          "",
          "📁 Featured Projects:",
          "",
          "  1. MFC Club Website",
          "     Tech: React.js, Tailwind CSS, Node.js, MongoDB",
          "     → Architected and implemented a responsive club web application",
          "     → Enhanced performance, security, and user engagement",
          "",
          "  2. Hostel Administration System",
          "     Tech: Next.js, Go, PostgreSQL, Turborepo",
          "     →  a full-stack app automating maintenance & complaints",
          "     → built Go backend with REST APIs & JWT auth with responsive Next.js frontend.",
          "",
          "  3.  Club Recruitment Portal",
          "     Tech:  Next.js, Node.js, Tailwind CSS, MongoDB",
          "     → Built a portal streamlining applications for 1,100+ students",
          "     →  Implemented user auth, role-based dashboards, and task submission with file uploads",
          "",
        ],
        action: () => smoothScrollToSection("projects"),
        type: "success",
      }),

      hire: (): CommandResult => ({
        output: [
          "[sudo] password for recruiter: ********",
          "",
          "🔓 ACCESS GRANTED - ADMIN MODE ACTIVATED",
          "",
          "┌─────────────────────────────────────────┐",
          "│     INSTANT HIRE PROTOCOL INITIATED     │",
          "└─────────────────────────────────────────┘",
          "",
          "⚡ Running compatibility check...",
          "  ✓ Skills: EXCEPTIONAL",
          "  ✓ Experience: IMPRESSIVE",
          "  ✓ Portfolio: OUTSTANDING",
          "  ✓ Culture Fit: PERFECT MATCH",
          "  ✓ Availability: IMMEDIATE",
          "",
          "🎉 HIRE RECOMMENDATION: STRONGLY POSITIVE",
          "",
          "Redirecting to contact form in 3 seconds...",
        ],
        action: async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          smoothScrollToSection("contact");
        },
        type: "success",
        animate: true,
      }),

      matrix: (): CommandResult => {
        const matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
        const output = Array(10)
          .fill(null)
          .map(() =>
            Array(50)
              .fill(null)
              .map(
                () =>
                  matrixChars[Math.floor(Math.random() * matrixChars.length)]
              )
              .join("")
          );

        return {
          output: [
            "Wake up, Neo...",
            "The Matrix has you...",
            "",
            ...output,
            "",
            "Follow the white rabbit. 🐇",
          ],
          type: "info",
          animate: true,
        };
      },

      clear: (): CommandResult => {
        clearTerminal();
        return { output: [] };
      },

      history: (): CommandResult => ({
        output:
          state.history.length > 0
            ? [
                "Command History:",
                "",
                ...state.history.map((cmd, i) => `  ${i + 1}  ${cmd}`),
              ]
            : ["No commands in history"],
        type: "info",
      }),

      resume: (): CommandResult => ({
        output: [
          "Preparing resume download...",
          "📄 Resume_FullStackDeveloper.pdf",
          "Size: 184 KB",
          "",
          "Download started!",
        ],
        action: () => {
          const link = document.createElement("a");
          link.href = "/resume.pdf";
          link.download = "SuvidhJain_Resume.pdf";
          link.click();
        },
        type: "success",
      }),

      github: (): CommandResult => ({
        output: ["Opening GitHub profile..."],
        action: () => window.open("https://github.com/SuvidhJ", "_blank"),
        type: "success",
      }),

      linkedin: (): CommandResult => ({
        output: ["Opening LinkedIn profile..."],
        action: () =>
          window.open("https://www.linkedin.com/in/suvidh-jain-72a88728a", "_blank"),
        type: "success",
      }),

      email: (): CommandResult => ({
        output: ["Opening email client..."],
        action: () => (window.location.href = "mailto:suvidh.jain3@gmail.com"),
        type: "success",
      }),

      fortune: (): CommandResult => {
        const fortunes = [
          "A new opportunity will present itself soon.",
          "Your code will compile on the first try today.",
          "The bug you seek is in line 42.",
          "Your next project will exceed expectations.",
          "Coffee is the answer. It doesn't matter what the question is.",
        ];
        return {
          output: [
            "🔮 Your fortune:",
            "",
            fortunes[Math.floor(Math.random() * fortunes.length)],
          ],
          type: "info",
        };
      },
    }),
    [state.history, clearTerminal, smoothScrollToSection]
  );

  const getAutocompleteSuggestions = useCallback(
    (input: string): string[] => {
      const raw = input.trim().toLowerCase();
      if (!raw) return [];

      return Object.keys(commands).filter((cmd) =>
        cmd.toLowerCase().startsWith(raw)
      );
    },
    [commands]
  );

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      addLine({
        type: "command",
        text: trimmedInput,
        timestamp: Date.now(),
        metadata: { user: state.environment.get("USER") },
      });

      addToHistory(trimmedInput);
      setCurrentCommand("");
      setShowSuggestions(false);

      startTransition(() => {
        setState((prev) => ({ ...prev, isProcessing: true }));
      });

      try {
        const parsed = parseCommand(trimmedInput);
        const command = commands[parsed.name.toLowerCase()];

        if (command) {
          const startTime = performance.now();
          const result = await Promise.resolve(command());
          const duration = performance.now() - startTime;

          result.output.forEach((text, index) => {
            setTimeout(
              () => {
                addLine({
                  type: result.type === "error" ? "error" : "output",
                  text,
                  timestamp: Date.now(),
                  metadata: {
                    duration: index === 0 ? duration : undefined,
                    status: result.type === "error" ? "error" : "success",
                  },
                });
              },
              result.animate ? index * 50 : 0
            );
          });

          if (result.action) {
            result.action();
          }
        } else {
          addLine({
            type: "error",
            text: `Command not found: ${parsed.name}. Type 'help' for available commands.`,
            timestamp: Date.now(),
            metadata: { status: "error" },
          });
        }
      } catch (error) {
        addLine({
          type: "error",
          text: `Error: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`,
          timestamp: Date.now(),
          metadata: { status: "error" },
        });
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [commands, state.environment, addLine, addToHistory]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (currentCommand.trim()) {
            executeCommand(currentCommand.trim());
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            setState((prev) => ({ ...prev, historyIndex: newIndex }));
            setCurrentCommand(state.history[newIndex] || "");
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            setState((prev) => ({ ...prev, historyIndex: newIndex }));
            setCurrentCommand(state.history[newIndex] || "");
          } else {
            setState((prev) => ({
              ...prev,
              historyIndex: state.history.length,
            }));
            setCurrentCommand("");
          }
          break;

        case "Tab":
          e.preventDefault();
          const suggestions = getAutocompleteSuggestions(currentCommand);
          if (suggestions.length === 1) {
            setCurrentCommand(suggestions[0]);
            setShowSuggestions(false);
          } else if (suggestions.length > 1) {
            setShowSuggestions(true);
          }
          break;

        case "Escape":
          setShowSuggestions(false);
          break;

        case "l":
          if (e.ctrlKey) {
            e.preventDefault();
            clearTerminal();
          }
          break;
      }
    },
    [
      currentCommand,
      state.history,
      state.historyIndex,
      executeCommand,
      getAutocompleteSuggestions,
      clearTerminal,
    ]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCurrentCommand(value);
      setShowSuggestions(
        value.length > 0 && getAutocompleteSuggestions(value).length > 0
      );
    },
    [getAutocompleteSuggestions]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const renderLine = useCallback(
    (line: TerminalLine) => {
      const getLineColor = () => {
        switch (line.type) {
          case "command":
            return "text-emerald-400";
          case "error":
            return "text-red-400";
          case "system":
            return "text-yellow-400";
          default:
            return "text-gray-300";
        }
      };

      const formatText = (text: string) => {
        return text
          .replace(
            /`([^`]+)`/g,
            '<code class="bg-gray-800 px-1 rounded text-cyan-400">$1</code>'
          )
          .replace(
            /\*\*([^*]+)\*\*/g,
            '<strong class="text-white font-bold">$1</strong>'
          )
          .replace(
            /```math\n([^```]+)```/g,
            '<span class="text-blue-400">[$1]</span>'
          );
      };

      return (
        <motion.div
          key={line.id}
          variants={lineVariants}
          initial="hidden"
          animate="visible"
          className={`mb-1 ${getLineColor()} font-mono text-sm`}
        >
          {line.type === "command" && (
            <span className="text-gray-500 mr-2">
              [
              {new Date(line.timestamp).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              ]
            </span>
          )}
          {line.type === "command" ? (
            <>
              <span className="text-cyan-400 mr-2">$</span>
              <span className="text-emerald-400">{line.text}</span>
            </>
          ) : (
            <span
              dangerouslySetInnerHTML={{ __html: formatText(line.text) }}
              className="whitespace-pre-wrap"
            />
          )}
          {line.metadata?.duration && (
            <span className="text-gray-600 text-xs ml-2">
              ({line.metadata.duration.toFixed(2)}ms)
            </span>
          )}
        </motion.div>
      );
    },
    [lineVariants]
  );

  return (
    <TerminalErrorBoundary>
      <motion.div
        id={terminalId}
        className="relative bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700/50 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-gray-800/30 pointer-events-none" />

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none"
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4 select-none">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-3 h-3 bg-red-500 rounded-full cursor-pointer"
                onClick={() => console.log("Close")}
                aria-label="Close terminal"
              />
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer"
                onClick={() => console.log("Minimize")}
                aria-label="Minimize terminal"
              />
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-3 h-3 bg-green-500 rounded-full cursor-pointer"
                onClick={() => inputRef.current?.focus()}
                aria-label="Maximize terminal"
              />
            </div>
            <div className="flex-1 text-center text-gray-400 text-sm font-medium">
              <span className="text-gray-500">portfolio@</span>
              <span className="text-cyan-400">SuvidhJ</span>
              <span className="text-gray-500">:</span>
              <span className="text-blue-400">{state.currentDirectory}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            role="log"
            aria-label="Terminal output"
            aria-live="polite"
          >
            {state.lines.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 mb-4"
              >
                <pre className="text-xs text-gray-600 mb-4">
                  {`
 ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
 ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
 ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
 ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
 ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`}
                </pre>
                <p className="mb-2">
                  Welcome to my interactive portfolio terminal! 🚀
                </p>
                <p className="mb-2">
                  Type{" "}
                  <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">
                    help
                  </code>{" "}
                  to see available commands.
                </p>
                <p className="text-xs text-gray-600">
                  Pro tip: Use ↑/↓ arrows for command history and Tab for
                  auto-completion.
                </p>
              </motion.div>
            )}

            {state.lines.map((line) => renderLine(line))}

            <div className="flex items-center mt-2">
              <span className="text-gray-500 text-sm mr-2">
                [
                {new Date().toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
                ]
              </span>
              <span className="text-cyan-400 mr-2">$</span>
              <div className="flex-1 relative font-mono text-sm">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none text-gray-300 caret-transparent"
                  placeholder="Enter command..."
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terminal command input"
                  disabled={state.isProcessing}
                />

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10"
                    >
                      {getAutocompleteSuggestions(currentCommand).map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setCurrentCommand(suggestion);
                              setShowSuggestions(false);
                              inputRef.current?.focus();
                            }}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!state.isProcessing && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "steps(2)",
                    }}
                    className="absolute top-0 text-gray-300"
                    style={{
                      left: `calc(${currentCommand.length}ch + 0.125rem)`,
                    }}
                  >
                    ▊
                  </motion.span>
                )}

                {state.isProcessing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Lines: {state.lines.length}</span>
              <span>History: {state.history.length}</span>
              <span>Mode: {state.isProcessing ? "Processing" : "Ready"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </motion.div>
    </TerminalErrorBoundary>
  );
};

export default Terminal;
