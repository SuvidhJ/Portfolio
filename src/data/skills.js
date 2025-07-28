// data/skills.js
import {
  SiC,
  SiCplusplus,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
  SiMysql,
  SiMongodb,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiTensorflow,
  SiPytorch,
  SiGit,
  SiDocker,
  SiKubernetes,
  SiTurborepo,
} from "react-icons/si";
import { FaJava, FaDatabase } from "react-icons/fa";
import { BiLogoVisualStudio } from "react-icons/bi";
import { TbApi } from "react-icons/tb";
import { BiData } from "react-icons/bi";
import { GiProcessor } from "react-icons/gi";

export const skills = [
  // Programming Languages
  {
    name: "C",
    category: "Programming Languages",
    level: 85,
    description:
      "Systems programming, memory management, and low-level operations.",
    icon: SiC,
    color: "#00599C",
  },
  {
    name: "C++",
    category: "Programming Languages",
    level: 85,
    description:
      "Object-oriented programming, STL, and competitive programming.",
    icon: SiCplusplus,
    color: "#00599C",
  },
  {
    name: "Python",
    category: "Programming Languages",
    level: 90,
    description:
      "Data analysis, machine learning, automation, and backend development.",
    icon: SiPython,
    color: "#3776AB",
  },
  {
    name: "Java",
    category: "Programming Languages",
    level: 80,
    description:
      "Enterprise applications, Android development, and Spring framework.",
    icon: FaJava,
    color: "#007396",
  },
  {
    name: "JavaScript",
    category: "Programming Languages",
    level: 92,
    description:
      "ES6+, async programming, DOM manipulation, and full-stack development.",
    icon: SiJavascript,
    color: "#F7DF1E",
  },
  {
    name: "TypeScript",
    category: "Programming Languages",
    level: 88,
    description:
      "Type-safe JavaScript, interfaces, generics, and advanced types.",
    icon: SiTypescript,
    color: "#3178C6",
  },

  // Web Technologies
  {
    name: "React.js",
    category: "Web Technologies",
    level: 95,
    description:
      "Component-based architecture, hooks, state management, and modern UI development.",
    icon: SiReact,
    color: "#61DAFB",
  },
  {
    name: "Next.js",
    category: "Web Technologies",
    level: 90,
    description:
      "Server-side rendering, static generation, API routes, and optimized performance.",
    icon: SiNextdotjs,
    color: "#000000",
  },
  {
    name: "Node.js",
    category: "Web Technologies",
    level: 88,
    description:
      "Server-side JavaScript, event-driven architecture, and npm ecosystem.",
    icon: SiNodedotjs,
    color: "#339933",
  },
  {
    name: "Express.js",
    category: "Web Technologies",
    level: 85,
    description:
      "RESTful API development, middleware, routing, and server configuration.",
    icon: SiExpress,
    color: "#000000",
  },
  {
    name: "RESTful APIs",
    category: "Web Technologies",
    level: 90,
    description: "API design, HTTP methods, status codes, and authentication.",
    icon: TbApi,
    color: "#009688",
  },
  {
    name: "HTML5",
    category: "Web Technologies",
    level: 95,
    description:
      "Semantic markup, accessibility, SEO optimization, and web standards.",
    icon: SiHtml5,
    color: "#E34C26",
  },
  {
    name: "CSS3",
    category: "Web Technologies",
    level: 92,
    description:
      "Flexbox, Grid, animations, responsive design, and modern layouts.",
    icon: SiCss3,
    color: "#1572B6",
  },
  {
    name: "Tailwind CSS",
    category: "Web Technologies",
    level: 90,
    description:
      "Utility-first styling, custom components, and rapid UI development.",
    icon: SiTailwindcss,
    color: "#06B6D4",
  },

  // Databases & Data
  {
    name: "MySQL",
    category: "Databases & Data",
    level: 85,
    description:
      "Relational database design, SQL queries, optimization, and indexing.",
    icon: SiMysql,
    color: "#4479A1",
  },
  {
    name: "MongoDB",
    category: "Databases & Data",
    level: 87,
    description:
      "NoSQL database, document storage, aggregation, and Mongoose ODM.",
    icon: SiMongodb,
    color: "#47A248",
  },
  {
    name: "Pandas",
    category: "Databases & Data",
    level: 85,
    description:
      "Data manipulation, analysis, cleaning, and transformation in Python.",
    icon: SiPandas,
    color: "#150458",
  },
  {
    name: "NumPy",
    category: "Databases & Data",
    level: 83,
    description:
      "Numerical computing, array operations, and mathematical functions.",
    icon: SiNumpy,
    color: "#013243",
  },
  {
    name: "Scikit-learn",
    category: "Databases & Data",
    level: 80,
    description:
      "Machine learning algorithms, preprocessing, and model evaluation.",
    icon: SiScikitlearn,
    color: "#F7931E",
  },

  // AI/ML Frameworks
  {
    name: "TensorFlow",
    category: "AI/ML Frameworks",
    level: 78,
    description:
      "Deep learning, neural networks, and production ML deployment.",
    icon: SiTensorflow,
    color: "#FF6F00",
  },
  {
    name: "PyTorch",
    category: "AI/ML Frameworks",
    level: 75,
    description:
      "Dynamic neural networks, research-focused ML, and computer vision.",
    icon: SiPytorch,
    color: "#EE4C2C",
  },

  // Developer Tools
  {
    name: "Git",
    category: "Developer Tools",
    level: 92,
    description:
      "Version control, branching strategies, and collaborative development.",
    icon: SiGit,
    color: "#F05032",
  },
  {
    name: "Docker",
    category: "Developer Tools",
    level: 85,
    description: "Containerization, microservices, and deployment automation.",
    icon: SiDocker,
    color: "#2496ED",
  },
  {
    name: "Kubernetes",
    category: "Developer Tools",
    level: 75,
    description:
      "Container orchestration, scaling, and cloud-native applications.",
    icon: SiKubernetes,
    color: "#326CE5",
  },
  {
    name: "Turborepo",
    category: "Developer Tools",
    level: 82,
    description: "Monorepo management, build optimization, and caching.",
    icon: SiTurborepo,
    color: "#EF4444",
  },
  {
    name: "VS Code",
    category: "Developer Tools",
    level: 95,
    description:
      "IDE mastery, extensions, debugging, and productivity shortcuts.",
    icon: BiLogoVisualStudio ,
    color: "#007ACC",
  },

  // Core CS
  {
    name: "Data Structures & Algorithms",
    category: "Core CS",
    level: 90,
    description: "Algorithm design, complexity analysis, and problem-solving.",
    icon: BiData,
    color: "#FF6B6B",
  },
  {
    name: "OOPS",
    category: "Core CS",
    level: 88,
    description:
      "Object-oriented design patterns, SOLID principles, and abstraction.",
    icon: GiProcessor,
    color: "#4ECDC4",
  },
  {
    name: "DBMS",
    category: "Core CS",
    level: 85,
    description:
      "Database design, normalization, transactions, and query optimization.",
    icon: BiData,
    color: "#45B7D1",
  },
];
