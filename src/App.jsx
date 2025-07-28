import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useInView,
  useSpring,
} from "framer-motion";
import Terminal from "./components/Terminal/Terminal";
import LiveEditor from "./components/CodeShowcase/LiveEditor";
import SkillTabs from "./components/Skills/SkillTabs";
import ProjectsSection from "./components/Projects/ProjectsSection";
import DeveloperContact from "./components/Contact/DeveloperContact";
import Navigation from "./components/Navigation";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import { sampleProjects } from "./data/projectsData";
import { clsx } from "clsx";
import { FiMail, FiLinkedin, FiGithub, FiInstagram } from "react-icons/fi";
import {
  MapPin,
  GraduationCap,
  Briefcase,
  FolderKanban,
  CircleDot,
} from "lucide-react";

const GlitchText = ({ children, className = "" }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0 -ml-0.5 text-blue-400 opacity-70 animate-glitch-1">
        {children}
      </span>
    </span>
  );
};

const MetricCard = ({ label, value, suffix = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  const rafRef = useRef(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const entryDelayMs = delay * 1000;

    const tick = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * value);

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, entryDelayMs);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [isInView, value, delay]);

  const formattedValue = new Intl.NumberFormat().format(displayValue);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-all group"
    >
      <h3 className="text-gray-400 text-sm mb-2">{label}</h3>
      <p className="text-3xl font-bold text-green-400 group-hover:text-blue-400 transition-colors">
        {formattedValue}
        {suffix}
      </p>
    </motion.div>
  );
};

const TypewriterText = ({ phrases }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < phrase.length) {
            setCurrentText(phrase.slice(0, currentText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex, phrases]);

  return (
    <span>
      {currentText}
      <span className="animate-blink">|</span>
    </span>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center mb-16"
  >
    <h2 className="text-4xl md:text-5xl font-bold mb-4">
      <GlitchText className="text-green-400 font-mono">{title}</GlitchText>
    </h2>
    <p className="text-xl text-gray-400">{subtitle}</p>
  </motion.div>
);

const InfoItem = ({ icon, label, value, highlight = false }) => {
  return (
    <div className="flex items-start gap-x-4">
      <div className="mt-1 flex-shrink-0 text-neutral-500 dark:text-neutral-400">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
        <span
          className={clsx(
            "text-sm text-neutral-600 dark:text-neutral-400",
            highlight && "font-bold text-emerald-500 dark:text-emerald-400"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

const SkillCard = ({ title, icon, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-all"
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
);

// const TestimonialCard = ({ quote, author, company }) => ( //TODO: save for latter
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     viewport={{ once: true }}
//     className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800"
//   >
//     <div className="mb-4">
//       <svg
//         className="w-8 h-8 text-green-400 opacity-50"
//         fill="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
//       </svg>
//     </div>
//     <p className="text-gray-300 mb-4 italic">{quote}</p>
//     <div>
//       <p className="font-semibold text-white">{author}</p>
//       <p className="text-sm text-gray-400">{company}</p>
//     </div>
//   </motion.div>
// );

const ContactInfo = ({ icon, label, value, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-4 rounded-lg border border-neutral-800 bg-[#090f1d] p-4 transition-all duration-300 ease-in-out hover:border-emerald-400 hover:bg-neutral-800/50"
  >
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black text-neutral-400 transition-colors duration-300 group-hover:bg-emerald-900/50 group-hover:text-emerald-400">
      {icon}
    </div>

    <div className="truncate">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="truncate text-white transition-colors duration-300 group-hover:text-emerald-400">
        {value}
      </p>
    </div>
  </a>
);

const GitHubContributionGraph = () => {
  const contributions = Array.from({ length: 365 }, () =>
    Math.floor(Math.random() * 5)
  );

  return (
    <div className="overflow-x-auto">
      <div
        className="grid grid-flow-col gap-1"
        style={{ gridTemplateRows: "repeat(7, 1fr)" }}
      >
        {contributions.map((level, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-sm ${
              level === 0
                ? "bg-gray-800"
                : level === 1
                ? "bg-green-900"
                : level === 2
                ? "bg-green-700"
                : level === 3
                ? "bg-green-500"
                : "bg-green-400"
            }`}
            title={`${level} contributions`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-4">
        100+ contributions in the last year
      </p>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(false); //TODO: Set to true to show loading screen
  // const [activeSection, setActiveSection] = useState("");
  // const { scrollYProgress } = useScroll();
  // const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const achievements = [
    { label: "Projects Completed", value: 10, suffix: "+" },
    { label: "GitHub Contributions", value: 100, suffix: "+" },
    { label: "Hackathons Won", value: 1, suffix: "" },
    { label: "Internships", value: 2, suffix: "" },
  ];

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen duration={3000} onComplete={handleLoadingComplete} />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gray-950 text-white relative overflow-x-hidden"
        >
          <Navigation />

          <section
            id="home"
            className="min-h-screen flex items-center justify-center px-4 py-20 relative z-10"
          >
            <div className="max-w-7xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <span className="inline-block px-4 py-2 bg-green-400/10 text-green-400 rounded-full text-sm font-mono mb-4">
                    <span className="animate-pulse inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Available for hire
                  </span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold mb-6">
                  <GlitchText className="text-green-400">&lt;</GlitchText>
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Suvidh Jain
                  </span>
                  <GlitchText className="text-green-400">/&gt;</GlitchText>
                </h1>

                <div className="text-xl md:text-2xl text-gray-400 font-mono mb-8">
                  <TypewriterText
                    phrases={[
                      "Full Stack Developer",
                      "Performance Enthusiast",
                      "Problem Solver",
                    ]}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex flex-wrap gap-4 justify-center mb-12"
                >
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("projects")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-8 py-3 bg-green-400 text-gray-950 font-semibold rounded-lg hover:bg-green-300 transition-all hover:scale-105 cursor-pointer"
                  >
                    View My Work
                  </a>

                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-8 py-3 border-2 border-green-400 text-green-400 font-semibold rounded-lg hover:bg-green-300 hover:text-gray-950 transition-all hover:scale-105 cursor-pointer"
                  >
                    Let's Talk
                  </a>
                </motion.div>
              </motion.div>

              <Terminal />

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
              >
                {achievements.map((achievement, index) => (
                  <MetricCard
                    key={achievement.label}
                    {...achievement}
                    delay={index * 0.1}
                  />
                ))}
              </motion.div>
            </div>
          </section>

          <section id="about" className="min-h-screen px-4 py-20 relative z-10">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                title="// About Me"
                subtitle="Turning ideas into exceptional digital experiences"
              />

              <div className="grid lg:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
                    <h3 className="text-2xl font-bold text-green-400 mb-4">
                      Engineering Excellence Through Code
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      I'm a passionate full-stack developer who believes in
                      writing code that not only works but inspires. With over 1
                      year of experience building scalable web applications, I
                      specialize in creating performant, accessible, and
                      beautiful digital solutions.
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      My approach combines technical expertise with creative
                      problem-solving, always keeping the end user in mind. I
                      thrive in environments where innovation meets execution,
                      and I'm constantly exploring new technologies to push the
                      boundaries of what's possible on the web.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">
                          What I Do
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>
                              Build scalable web applications with modern
                              frameworks
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>
                              Design intuitive user interfaces with attention to
                              detail
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>
                              Optimize performance for lightning-fast
                              experiences
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>Implement robust testing</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">
                          My Values
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>Clean, maintainable code that scales</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>User-centric design thinking</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>Continuous learning and improvement</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">▸</span>
                            <span>Collaborative problem solving</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="space-y-4 rounded-lg border bg-[#090f1d] border-[#1e2939] p-6 leading-relaxed">
                    <InfoItem
                      icon={<MapPin size={20} />}
                      label="Location"
                      value="Surat, Gujarat"
                    />
                    <InfoItem
                      icon={<GraduationCap size={20} />}
                      label="Education"
                      value="B.Tech CSE (2023)"
                    />
                    <InfoItem
                      icon={<Briefcase size={20} />}
                      label="Experience"
                      value="1+ Years"
                    />
                    <InfoItem
                      icon={<FolderKanban size={20} />}
                      label="Projects"
                      value="10+ Completed"
                    />
                    <InfoItem
                      icon={
                        <CircleDot
                          size={20}
                          className="animate-pulse text-emerald-500"
                        />
                      }
                      label="Status"
                      value="Actively Seeking Opportunities"
                      highlight
                    />
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-green-400 mb-4">
                      Daily Drivers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "TypeScript",
                        "Node.js",
                        "Express.js",
                        "MySQL",
                        "MongoDB",
                        "Docker",
                        "Git",
                        "VS Code",
                      ].map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-green-400 hover:text-gray-950 transition-all cursor-default"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.a
                    href="/resume.pdf"
                    download="SuvidhJain_Resume.pdf"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block w-full bg-green-400 text-gray-950 font-semibold py-4 px-6 rounded-xl text-center shadow-lg transition-colors hover:bg-green-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Resume
                    </span>
                  </motion.a>
                </motion.div>
              </div>
              <div className="mt-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800"
                >
                  <h3 className="text-xl font-bold text-blue-400 mb-4">
                    My Coding Philosophy
                  </h3>
                  <LiveEditor />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Skills Section - Revolutionary Design */}
          <section
            id="skills"
            className="min-h-screen px-4 py-20 bg-gray-900/50 relative z-10"
          >
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                title="// Technical Expertise"
                subtitle="Building the future with cutting-edge technologies"
              />
            </div>

            {/* <div className="grid lg:grid-cols-2 gap-8 mb-12"> //TODO: remove code
                {Object.entries(expertise).map(([key, category]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-950/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800"
                  >
                    <h3 className="text-2xl font-bold text-green-400 mb-6">
                      {category.title}
                    </h3>
                    <div className="space-y-4">
                      {category.skills.map((skill) => (
                        <SkillBar key={skill.name} {...skill} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div> */}

            <SkillTabs />
            <div className="mr-4 ml-4 md:mr-8 md:ml-8">
              {/* Additional Skills Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 "
              >
                <SkillCard
                  title="Architecture"
                  icon="🏗️"
                  description="Microservices, Event-driven, MVC"
                />
                <SkillCard
                  title="DevOps"
                  icon="🔧"
                  description="CI/CD, Docker, Kubernetes"
                />
                <SkillCard
                  title="Security"
                  icon="🔒"
                  description="OAuth, JWT, HTTPS, XSS Prevention"
                />
                <SkillCard
                  title="Optimization"
                  icon="⚡"
                  description="Lazy Loading, Code Splitting, CDN"
                />
              </motion.div>
            </div>
          </section>

          {/* Projects Section - Enhanced */}
          <section
            id="projects"
            className="min-h-screen px-4 py-4 relative z-10"
          >
            <div className="max-w-7xl mx-auto">
              <ProjectsSection projects={sampleProjects} />
              {/* GitHub Contribution Graph// TODO: manage this section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4">
                  Open Source Contributions
                </h3>
                <GitHubContributionGraph />
              </motion.div> */}
            </div>
          </section>

          {/* Testimonials Section
          <section className="px-4 py-20 bg-gray-900/50 relative z-10">
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                title="// What People Say"
                subtitle="Feedback from colleagues and clients"
              />

              <div className="grid md:grid-cols-3 gap-6">
                <TestimonialCard
                  quote="An exceptional developer who consistently delivers high-quality code. Their attention to detail and problem-solving skills are outstanding."
                  author="Senior Tech Lead"
                  company="Tech Company"
                />
                <TestimonialCard
                  quote="Working with them was a game-changer for our project. They brought innovative solutions and exceeded all expectations."
                  author="Product Manager"
                  company="Startup Inc"
                />
                <TestimonialCard
                  quote="Rare combination of technical expertise and excellent communication. A true asset to any development team."
                  author="CTO"
                  company="Digital Agency"
                />
              </div>
            </div>
          </section> */}

          {/* Contact Section - Premium Design */}
          <section
            id="contact"
            className="min-h-screen px-4 py-20 relative z-10"
          >
            <div className="max-w-7xl mx-auto">
              <SectionHeader
                title="// Let's Build Something Amazing"
                subtitle="Ready to turn your ideas into reality"
              />

              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-green-400 mb-6">
                    Get In Touch
                  </h3>
                  <p className="text-gray-300 mb-8">
                    I'm currently looking for new opportunities and would love
                    to hear about your project. Whether you need a full-stack
                    developer, have a question, or just want to say hi, I'll get
                    back to you as soon as possible!
                  </p>

                  <div className="space-y-4 mb-8">
                    <ContactInfo
                      icon={<FiMail size={20} />} // Pass the icon component here
                      label="Email"
                      value="suvidh.jain3@gmail.com"
                      link="mailto:suvidh.jain3@gmail.com"
                    />
                    <ContactInfo
                      icon={<FiLinkedin size={20} />}
                      label="LinkedIn"
                      value="Suvidh Jain"
                      link="https://www.linkedin.com/in/suvidh-jain-72a88728a"
                    />
                    <ContactInfo
                      icon={<FiGithub size={20} />}
                      label="GitHub"
                      value="github.com/SuvidhJ"
                      link="https://github.com/SuvidhJ"
                    />
                    <ContactInfo
                      icon={<FiInstagram size={20} />}
                      label="Instagram"
                      value="@suvidhjain5"
                      link="https://instagram.com/suvidhjain5"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.a
                      href="mailto:suvidh.jain3@gmail.com"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-green-400 text-gray-950 font-semibold rounded-lg hover:bg-green-300 transition-all"
                    >
                      Send Email
                    </motion.a>
                    <motion.a
                      href="/resume.pdf"
                      download="SuvidhJain_Resume.pdf"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 border-2 border-green-400 text-green-400 font-semibold rounded-lg hover:bg-green-400 hover:text-gray-950 transition-all"
                    >
                      Download CV
                    </motion.a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <DeveloperContact />
                </motion.div>
              </div>
            </div>
          </section>

          <footer className="py-12 px-4 border-t border-gray-800 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-gray-400 font-mono text-sm">
                    &copy; 2024 Suvidh Jain | Crafted with React v.19 + Tailwind
                    CSS v4
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/SuvidhJ"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/suvidh-jain-72a88728a"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/suvidhjain5/"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 18 18"
                    >
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
