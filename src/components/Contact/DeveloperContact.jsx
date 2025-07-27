// components/Contact/DeveloperContact.jsx
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
  createContext,
  useContext,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  useAnimation,
} from "framer-motion";

const ShaderBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    // Vertex shader with advanced transformations
    const vertexShaderSource = `#version 300 es
      in vec4 a_position;
      in vec2 a_texCoord;
      out vec2 v_texCoord;
      uniform float u_time;
      
      void main() {
        v_texCoord = a_texCoord;
        vec4 pos = a_position;
        pos.x += sin(u_time * 0.5 + a_position.y * 3.0) * 0.02;
        pos.y += cos(u_time * 0.3 + a_position.x * 2.0) * 0.02;
        gl_Position = pos;
      }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      in vec2 v_texCoord;
      out vec4 outColor;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
        vec2 uv0 = uv;
        vec3 finalColor = vec3(0.0);
        
        float dist = length(uv - u_mouse);
        
        for (float i = 0.0; i < 4.0; i++) {
          uv = fract(uv * 1.5) - 0.5;
          float d = length(uv) * exp(-length(uv0));
          vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);
          d = sin(d * 8.0 + u_time) / 8.0;
          d = abs(d);
          d = pow(0.01 / d, 1.2);
          d *= 1.0 - smoothstep(0.0, 0.5, dist);
          finalColor += col * d;
        }
        
        float n = noise(uv0 * 10.0 + u_time);
        finalColor += vec3(0.0, 0.1, 0.05) * n * 0.1;
        
        outColor = vec4(finalColor * 0.2, 1.0);
      }
    `;

    // Shader compilation and program setup
    const createShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    const positions = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    let startTime = Date.now();
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(texCoordLoc);
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);

      gl.uniform1f(timeLoc, time);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30"
      style={{ filter: "blur(1px)" }}
    />
  );
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        touched: { ...state.touched, [action.field]: true },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case "CLEAR_ERROR":
      { const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return { ...state, errors: newErrors }; }
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };
    case "SET_STATUS":
      return { ...state, submitStatus: action.status };
    case "RESET":
      return {
        values: { name: "", email: "", message: "" },
        errors: {},
        touched: {},
        isSubmitting: false,
        submitStatus: null,
      };
    default:
      return state;
  }
};

const FormAnalyticsContext = createContext();

const FormAnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState({
    fieldInteractions: {},
    timeSpent: {},
    errorCount: 0,
    submissionAttempts: 0,
  });

  const trackFieldInteraction = useCallback((field) => {
    setAnalytics((prev) => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [field]: (prev.fieldInteractions[field] || 0) + 1,
      },
    }));
  }, []);

  const trackTimeSpent = useCallback((field, time) => {
    setAnalytics((prev) => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [field]: (prev.timeSpent[field] || 0) + time,
      },
    }));
  }, []);

  return (
    <FormAnalyticsContext.Provider
      value={{ analytics, trackFieldInteraction, trackTimeSpent }}
    >
      {children}
    </FormAnalyticsContext.Provider>
  );
};

// AI-powered suggestion system
const useAISuggestions = (fieldName, value) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (fieldName === "message" && value.length > 10) {
      const keywords = value.toLowerCase().split(" ");
      const suggestionMap = {
        project: [
          "I have experience with similar projects",
          "I can help bring your vision to life",
        ],
        team: [
          "I excel in collaborative environments",
          "I have strong communication skills",
        ],
        deadline: [
          "I have a track record of delivering on time",
          "I can work efficiently under pressure",
        ],
        budget: [
          "I offer competitive rates",
          "I can work within your budget constraints",
        ],
        experience: [
          "I have 5+ years in the field",
          "My portfolio showcases relevant work",
        ],
      };

      const relevantSuggestions = [];
      Object.keys(suggestionMap).forEach((key) => {
        if (keywords.some((word) => word.includes(key))) {
          relevantSuggestions.push(...suggestionMap[key]);
        }
      });

      setSuggestions(relevantSuggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [fieldName, value]);

  return suggestions;
};

const SmartInput = ({
  type,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  icon,
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const { trackFieldInteraction, trackTimeSpent } =
    useContext(FormAnalyticsContext);

  const handleFocus = () => {
    setIsFocused(true);
    setStartTime(Date.now());
    trackFieldInteraction(name);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (startTime) {
      trackTimeSpent(name, Date.now() - startTime);
    }
    onBlur(e);
  };

  const getFieldStrength = () => {
    if (name === "email" && value) {
      const hasValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const hasProfessionalDomain = !/gmail|yahoo|hotmail/.test(value);
      const strength =
        (hasValidFormat ? 50 : 0) + (hasProfessionalDomain ? 50 : 0);
      return strength;
    }
    return 0;
  };

  const strength = getFieldStrength();

  return (
    <div className="relative">
      <motion.div
        className={`
          relative flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-300
          ${
            isFocused
              ? "border-green-400 bg-gray-800/50"
              : "border-gray-600 bg-gray-800/30"
          }
          ${touched && error ? "border-red-400" : ""}
        `}
        animate={{
          boxShadow: isFocused
            ? "0 0 20px rgba(34, 197, 94, 0.2)"
            : "0 0 0px rgba(0,0,0,0)",
        }}
      >
        {icon && (
          <motion.span
            className="mr-3 text-gray-400"
            animate={{ color: isFocused ? "#22c55e" : "#9ca3af" }}
          >
            {icon}
          </motion.span>
        )}

        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500"
          autoComplete={name}
        />

        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="ml-2"
            >
              {touched && !error ? (
                <motion.svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.path
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.svg>
              ) : touched && error ? (
                <motion.svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </motion.svg>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {name === "email" && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {strength >= 100
                ? "Professional"
                : strength >= 50
                ? "Valid"
                : "Invalid"}
            </span>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {touched && error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-center text-red-400 text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SmartTextarea = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  maxLength = 500,
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { trackFieldInteraction, trackTimeSpent } =
    useContext(FormAnalyticsContext);
  const suggestions = useAISuggestions(name, value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const textMetrics = useMemo(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const sentences = value.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordLength =
      words.length > 0
        ? words.reduce((sum, word) => sum + word.length, 0) / words.length
        : 0;

    return {
      characters: value.length,
      words: words.length,
      sentences: sentences.length,
      avgWordLength: avgWordLength.toFixed(1),
      readingTime: Math.ceil(words.length / 200), 
      sentiment: analyzeSentiment(value),
    };
  }, [value]);

  function analyzeSentiment(text) {
    const positiveWords = [
      "excited",
      "passionate",
      "love",
      "great",
      "excellent",
      "amazing",
      "wonderful",
    ];
    const negativeWords = [
      "not",
      "never",
      "hate",
      "dislike",
      "bad",
      "poor",
      "terrible",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach((word) => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });

    if (score > 2) return "positive";
    if (score < -2) return "negative";
    return "neutral";
  }

  const handleFocus = () => {
    setIsFocused(true);
    setStartTime(Date.now());
    trackFieldInteraction(name);
    setTimeout(() => setShowSuggestions(true), 1000);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setShowSuggestions(false);
    if (startTime) {
      trackTimeSpent(name, Date.now() - startTime);
    }
    onBlur(e);
  };

  const insertSuggestion = (suggestion) => {
    const newValue =
      value + (value.endsWith(" ") ? "" : " ") + suggestion + " ";
    onChange({ target: { name, value: newValue } });
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <motion.div
        className={`
          relative rounded-lg border-2 transition-all duration-300 overflow-hidden
          ${
            isFocused
              ? "border-green-400 bg-gray-800/50"
              : "border-gray-600 bg-gray-800/30"
          }
          ${touched && error ? "border-red-400" : ""}
        `}
        animate={{
          boxShadow: isFocused
            ? "0 0 30px rgba(34, 197, 94, 0.3)"
            : "0 0 0px rgba(0,0,0,0)",
        }}
      >
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{textMetrics.words} words</span>
              <span>{textMetrics.sentences} sentences</span>
              <span>~{textMetrics.readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                className={`
                  px-2 py-1 rounded text-xs
                  ${
                    textMetrics.sentiment === "positive"
                      ? "bg-green-900/50 text-green-400"
                      : textMetrics.sentiment === "negative"
                      ? "bg-red-900/50 text-red-400"
                      : "bg-gray-700/50 text-gray-400"
                  }
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={textMetrics.sentiment}
              >
                {textMetrics.sentiment} tone
              </motion.div>
            </div>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setCursorPosition(e.target.selectionStart);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={6}
          className="w-full px-4 py-3 bg-transparent outline-none text-gray-100 placeholder-gray-500 resize-none"
          style={{ minHeight: "150px" }}
        />

        <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-colors duration-300 ${
                    textMetrics.characters > maxLength * 0.9
                      ? "bg-red-400"
                      : textMetrics.characters > maxLength * 0.7
                      ? "bg-yellow-400"
                      : "bg-green-400"
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(textMetrics.characters / maxLength) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span
              className={`text-xs font-mono ${
                textMetrics.characters > maxLength
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {textMetrics.characters}/{maxLength}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
            >
              <div className="p-3">
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI Suggestions
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => insertSuggestion(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-300 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {touched && error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center text-red-400 text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeveloperContact = () => {
  const formRef = useRef(null);
  const [state, dispatch] = useReducer(formReducer, {
    values: { name: "", email: "", message: "" },
    errors: {},
    touched: {},
    isSubmitting: false,
    submitStatus: null,
  });

  const validationRules = {
    name: {
      pattern: /^[a-zA-Z\s]{2,50}$/,
      validate: (value) => {
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Name can only contain letters and spaces";
        if (value.trim().split(" ").length < 2)
          return "Please enter your full name";
        return null;
      },
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      validate: (value) => {
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email";

        // Advanced email validation
        const [localPart, domain] = value.split("@");
        if (localPart.length > 64) return "Email local part too long";
        if (domain && domain.length > 255) return "Email domain too long";

        // Check for common typos
        const commonDomains = [
          "gmail.com",
          "yahoo.com",
          "hotmail.com",
          "outlook.com",
        ];
        const typoDomains = [
          "gmial.com",
          "gmai.com",
          "yahooo.com",
          "hotmial.com",
        ];
        if (domain && typoDomains.includes(domain)) {
          return "Please check your email domain for typos";
        }

        return null;
      },
    },
    message: {
      validate: (value) => {
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10)
          return "Message must be at least 10 characters";
        if (value.trim().length > 500)
          return "Message must be less than 500 characters";

        const words = value.trim().split(/\s+/);
        if (words.length < 3)
          return "Please provide more detail in your message";

        const spamPatterns = [/^\d+$/, /^[A-Z\s]+$/, /(.)\1{5,}/];
        if (spamPatterns.some((pattern) => pattern.test(value))) {
          return "Please write a meaningful message";
        }

        return null;
      },
    },
  };

  const validateField = useCallback((field, value) => {
    const rule = validationRules[field];
    if (!rule) return;

    const error = rule.validate(value);
    if (error) {
      dispatch({ type: "SET_ERROR", field, error });
    } else {
      dispatch({ type: "CLEAR_ERROR", field });
    }
  }, []);

  const handleFieldChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch({ type: "SET_FIELD", field: name, value });
      validateField(name, value);
    },
    [validateField]
  );

  const handleFieldBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      validateField(name, value);
    },
    [validateField]
  );

  // Form submission with advanced features
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    let hasErrors = false;
    Object.keys(validationRules).forEach((field) => {
      const error = validationRules[field].validate(state.values[field]);
      if (error) {
        dispatch({ type: "SET_ERROR", field, error });
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    dispatch({ type: "SET_SUBMITTING", value: true });

    try {
      // Simulate API call with realistic behavior
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...state.values,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     analytics: analytics
      //   })
      // });

      dispatch({ type: "SET_STATUS", status: "success" });
      dispatch({ type: "RESET" });

      // Auto-hide success message
      setTimeout(() => {
        dispatch({ type: "SET_STATUS", status: null });
      }, 5000);
    } catch (error) {
      dispatch({ type: "SET_STATUS", status: "error" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      Object.keys(validationRules).every((field) => {
        const error = validationRules[field].validate(state.values[field]);
        return !error;
      }) && Object.keys(state.errors).length === 0
    );
  }, [state.values, state.errors]);

  // Scroll animations
  const controls = useAnimation();
  const inView = useInView(formRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <FormAnalyticsProvider>
      <motion.div
        ref={formRef}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="relative max-w-3xl mx-auto"
      >
        {/* Advanced background effects */}
        <div className="absolute inset-0 -z-10">
          <ShaderBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/95 to-gray-900/90" />
        </div>

        {/* Animated border gradient */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 opacity-75 blur-sm"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />

        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl border border-gray-800/50">
          {/* Header with typing animation */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Let's Connect
                  </h2>
                  <p className="text-sm text-gray-400">
                    I typically respond within 24 hours
                  </p>
                </div>
              </div>

              {/* Live status indicator */}
              <motion.div
                className="flex items-center space-x-2 text-xs text-green-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Available</span>
              </motion.div>
            </div>

            {/* Code-style intro */}
            <motion.div
              className="bg-gray-800/50 rounded-lg p-4 font-mono text-sm"
              whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.7)" }}
            >
              <div className="text-gray-400">
                <span className="text-purple-400">class</span>{" "}
                <span className="text-yellow-400">ContactForm</span> {"{"}
              </div>
              <div className="text-gray-400 ml-4">
                <span className="text-purple-400">constructor</span>() {"{"}
              </div>
              <div className="text-gray-400 ml-8">
                <span className="text-blue-400">this</span>.status =
                <span className="text-green-400"> "ready_to_collaborate"</span>;
              </div>
              <div className="text-gray-400 ml-4">{"}"}</div>
              <div className="text-gray-400">{"}"}</div>
            </motion.div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <SmartInput
                type="text"
                name="name"
                value={state.values.name}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                placeholder="John Doe"
                error={state.errors.name}
                touched={state.touched.name}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SmartInput
                type="email"
                name="email"
                value={state.values.email}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                placeholder="john@example.com"
                error={state.errors.email}
                touched={state.touched.email}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SmartTextarea
                name="message"
                value={state.values.message}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                placeholder="Tell me about your project..."
                error={state.errors.message}
                touched={state.touched.message}
              />
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={!isFormValid || state.isSubmitting}
                className={`
                  relative w-full py-4 px-6 rounded-xl font-medium text-white
                  transition-all duration-300 transform
                  ${
                    !isFormValid || state.isSubmitting
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  }
                `}
                whileHover={
                  isFormValid && !state.isSubmitting ? { scale: 1.02 } : {}
                }
                whileTap={
                  isFormValid && !state.isSubmitting ? { scale: 0.98 } : {}
                }
              >
                <AnimatePresence mode="wait">
                  {state.isSubmitting ? (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span className="ml-3">Sending your message...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <span>Send Message</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Status messages */}
          <AnimatePresence>
            {state.submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`
                  mt-6 p-4 rounded-xl flex items-center
                  ${
                    state.submitStatus === "success"
                      ? "bg-green-900/20 border border-green-500/30 text-green-400"
                      : "bg-red-900/20 border border-red-500/30 text-red-400"
                  }
                `}
              >
                {state.submitStatus === "success" ? (
                  <>
                    <svg
                      className="w-6 h-6 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">
                        Message sent successfully!
                      </p>
                      <p className="text-sm opacity-75">
                        I'll get back to you soon.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">Failed to send message</p>
                      <p className="text-sm opacity-75">
                        Please try again later.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </FormAnalyticsProvider>
  );
};

export default DeveloperContact;
