import { useEffect, useState } from "react";
import { getFileUrl, getResume } from "./lib/api.js";
import { motion, useReducedMotion } from "motion/react";

import {


  Code2,
  ArrowUpRight,
  ArrowRight,
  Download,
  Menu,
  X,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Send,
  Terminal,
  BrainCircuit,
  Database,
  Briefcase,
  Award,
  FileText,
} from "lucide-react";

import { portfolio } from "./data/portfolio";
import { getProjects, getExperience, getCertificates, sendContactMessage } from "./lib/api";

const socialIcons = {
  github: Code2,
  linkedin: ExternalLink,
  leetcode: Code2,
};

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    ["About", "#about"],
    ["Experience", "#experience"],
    ["Skills", "#skills"],
    ["Projects", "#projects"],
    ["Education", "#education"],
    ["Contact", "#contact"],
  ];

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <a href="#" className="logo">
          <span>H</span>M.
        </a>

        <div className={`nav-links ${open ? "mobile-open" : ""}`}>
          {links.map(([label, href]) => (
            <a
              href={href}
              key={label}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}

          <a
            href="#contact"
            className="nav-cta"
            onClick={() => setOpen(false)}
          >
            Let's Talk <ArrowUpRight size={15} />
          </a>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
}

function SocialLinks() {
  return (
    <div className="social-links">
      {Object.entries(portfolio.socialLinks).map(([key, url]) => {
        const Icon = socialIcons[key];

        if (!url) return null;

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
          >
            <Icon size={19} />
          </a>
        );
      })}
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    let active = true;

    getResume()
      .then((data) => {
        if (active) setResume(data);
      })
      .catch((error) => {
        console.error("Unable to load resume:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="hero container">
      <div className="hero-content">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="availability">
            <span className="status-dot" />
            Open to opportunities
          </div>

          <p className="hero-intro">HELLO, I'M</p>

          <h1>
            Harsh <span>Mishra.</span>
          </h1>

          <h2>{portfolio.role}</h2>

          <p className="hero-description">
            {portfolio.description}
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="primary-btn">
              Explore Projects <ArrowUpRight size={18} />
            </a>

            <a href="#contact" className="secondary-btn">
              Contact Me <ArrowRight size={17} />
            </a>
            {resume?.file_path && (
  <a
    href={getFileUrl(resume.file_path)}
    className="secondary-btn"
    target="_blank"
    rel="noreferrer"
    download
  >
    Download Resume <Download size={17} />
  </a>
)}
          </div>

          <SocialLinks />
        </motion.div>
      </div>

      <motion.div
        className="hero-visual"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="orb orb-one" />
        <div className="orb orb-two" />

        <div className="profile-card">
          <div className="profile-top">
            <span>DEVELOPER PROFILE</span>
            <Sparkles size={18} />
          </div>

          <div className="avatar"><img src="/profile-photo.png" alt="Harsh Mishra" /></div>

          <h3>{portfolio.name}</h3>
          <p>{portfolio.role}</p>

          <div className="profile-divider" />

          <div className="profile-info">
            <span><MapPin size={15} /> {portfolio.location}</span>
            <span>
              <GraduationCap size={15} />
              B.Tech CSE | 2027
            </span>
          </div>

          <div className="profile-tags">
            <span>AI / ML</span>
            <span>Python</span>
            <span>Software</span>
          </div>
        </div>

        <div className="floating-chip chip-top">
          <BrainCircuit size={18} /> Machine Learning
        </div>

        <div className="floating-chip chip-bottom">
          <Terminal size={18} /> Problem Solver
        </div>
      </motion.div>

      <div className="hero-scroll">
        <span /> SCROLL TO EXPLORE
      </div>
    </section>
  );
}


function About() {
  return (
    <section id="about" className="section container">
      <SectionTitle
        eyebrow="ABOUT ME"
        title="A little about myself."
        description="My background, interests and what I bring to the table."
      />

      <div className="about-grid">
        <div className="about-main glass-card">
          <span className="card-label">WHO I AM</span>
          <h3>
            Turning ideas into
            <span className="gradient-text"> practical solutions.</span>
          </h3>

          <p>
            I am a Computer Science undergraduate at
            {` ${portfolio.education.college}`}. My interests
            include artificial intelligence, machine learning,
            data science and software development.
          </p>

          <p>
            I enjoy working with data, understanding technical
            problems and developing solutions that have practical
            applications.
          </p>

          <div className="education">
            <GraduationCap size={24} />
            <div>
              <strong>{portfolio.education.degree}</strong>
              <span>
                {portfolio.education.college}{" | "}
                {portfolio.education.graduation}
              </span>
            </div>
          </div>
        </div>

        <div className="about-side">
          <div className="mini-card glass-card">
            <BrainCircuit size={28} />
            <h3>AI & ML</h3>
            <p>Predictive models and intelligent systems.</p>
          </div>

          <div className="mini-card glass-card">
            <Database size={28} />
            <h3>Data & Software</h3>
            <p>Working with data, APIs and applications.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const [experiences, setExperiences] = useState(portfolio.experience);

  useEffect(() => {
    let active = true;

    getExperience()
      .then((data) => {
        if (active) setExperiences(data);
      })
      .catch((error) => {
        console.error("Unable to load experience from API:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatDuration = (item) => {
    if (item.duration) return item.duration;

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    };

    const start = formatDate(item.start_date);
    const end = item.currently_working
      ? "Present"
      : formatDate(item.end_date);

    return [start, end].filter(Boolean).join(" - ");
  };

  return (
    <section id="experience" className="section container">
      <SectionTitle
        eyebrow="MY JOURNEY"
        title="Professional experience."
        description="My internship and practical workplace experience."
      />

      <div className="skills-grid">
        {experiences.map((item, index) => (
          <motion.article
            className="skill-card glass-card"
            key={item.id || item.company}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Briefcase size={25} />
            <h3>{item.role}</h3>
            <span className="eyebrow">{item.company}</span>
            <p>{formatDuration(item)}</p>
            {item.location && <p>{item.location}</p>}
            <p>{item.description}</p>

            {item.certificate_path && (
              <div className="experience-actions">
                <a
                  href={`${getFileUrl(item.certificate_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certificate-btn"
                >
                  <FileText size={16} />
                  View Internship Certificate
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function EducationAndCertifications() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    let active = true;

    getCertificates()
      .then((data) => {
        if (active) setCertificates(data);
      })
      .catch((error) => {
        console.error("Unable to load certificates from API:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section id="education" className="section container">
        <SectionTitle
          eyebrow="ACADEMIC BACKGROUND"
          title="Education."
        />

        <div className="glass-card about-main">
          <GraduationCap size={28} />
          <h3>{portfolio.education.degree}</h3>
          <p>{portfolio.education.college}</p>
          <div className="project-metrics">
            <span>Graduation: {portfolio.education.graduation}</span>
            <span>CGPA: {portfolio.education.cgpa}</span>
            <span>Last Semester SGPA: {portfolio.education.lastSemesterSGPA}</span>
          </div>
        </div>
      </section>

      <section id="certifications" className="section container">
        <SectionTitle
          eyebrow="LEARNING & DEVELOPMENT"
          title="Certifications."
        />

        <div className="skills-grid">
          {certificates.map((certificate) => (
            <div className="skill-card glass-card" key={certificate.id}>
              <Award size={25} />
              <h3>{certificate.title}</h3>

              {certificate.issuer && (
                <span className="eyebrow">{certificate.issuer}</span>
              )}

              {certificate.description && <p>{certificate.description}</p>}

              {certificate.issue_date && (
                <p>
                  Issued: {new Date(certificate.issue_date).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              )}

              {certificate.credential_url && (
                <a className="project-link" href={certificate.credential_url} target="_blank" rel="noopener noreferrer">
                  Verify Credential <ExternalLink size={15} />
                </a>
              )}

              {certificate.file_path && (
                <a className="project-link" href={`${getFileUrl(certificate.file_path)}`} target="_blank" rel="noopener noreferrer">
                  View Certificate PDF <ExternalLink size={15} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function Skills() {
  return (
    <section id="skills" className="section container">
      <SectionTitle
        eyebrow="MY EXPERTISE"
        title="Skills & technologies."
        description="Technologies I have worked with in my projects and learning journey."
      />

      <div className="skills-grid">
        {portfolio.skills.map((group, index) => (
          <motion.div
            className="skill-card glass-card"
            key={group.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="skill-number">
              0{index + 1}
            </span>

            <h3>{group.category}</h3>

            <div className="skill-tags">
              {group.items.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const [projects, setProjects] = useState(portfolio.projects);

  useEffect(() => {
    let active = true;

    getProjects()
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch((error) => {
        console.error("Unable to load projects from API:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="projects" className="section container">
      <SectionTitle
        eyebrow="SELECTED WORK"
        title="Projects I've built."
        description="Practical implementations focused on solving real-world problems."
      />

      <div className="projects-grid">
        {projects.map((project, index) => (
          <motion.article
            className="project-card glass-card"
            key={project.id || project.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
          >
            <div className="project-top">
              <div className="project-icon">
                {index === 0 && <Database size={25} />}
                {index === 1 && <BrainCircuit size={25} />}
                {index === 2 && <Code2 size={25} />}
              </div>

              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.name} on GitHub`}
                >
                  <ExternalLink size={19} />
                </a>
              ) : (
                <span className="coming-soon">
                  Repository pending
                </span>
              )}
            </div>

            <span className="eyebrow">{project.category}</span>
            <h3>{project.name}</h3>
            <p>{project.description}</p>

            {project.metrics?.length > 0 && (
              <div className="project-metrics">
                {project.metrics.map((metric) => (
                  <span key={metric}>{metric}</span>
                ))}
              </div>
            )}

            <div className="project-tech">
              {project.technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    try {
      const result = await sendContactMessage(form);
      setStatus(result.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus(error.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section container">
      <div className="contact-card">
        <span className="eyebrow">GET IN TOUCH</span>

        <h2>
          Have an opportunity?
          <span className="gradient-text"> Let's connect.</span>
        </h2>

        <p>
          Interested in discussing a role, a project or a
          professional collaboration? Feel free to reach out.
        </p>

        <div className="contact-actions">
          <a href={`mailto:${portfolio.email}`} className="primary-btn">
            <Mail size={18} /> Email Me
          </a>

          <a
            href={portfolio.socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
          >
            <ExternalLink size={18} /> LinkedIn
          </a>
        </div>

        <div className="contact-form-preview">
          <h3>Send a message</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              maxLength={254}
              required
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject (optional)"
              value={form.subject}
              onChange={handleChange}
              maxLength={150}
            />

            <textarea
              name="message"
              placeholder="Tell me about your opportunity..."
              value={form.message}
              onChange={handleChange}
              maxLength={5000}
              required
            />

            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
              <Send size={16} />
            </button>
          </form>

          {status && (
            <small role="status" aria-live="polite">
              {status}
            </small>
          )}
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <a href="#" className="logo">
          <span>H</span>M.
        </a>

        <p>"Copyright "{new Date().getFullYear()} Harsh Mishra. Built with React.</p>

        <a href="#" aria-label="Back to top">Back to top</a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <EducationAndCertifications />
        <Contact />
      </main>

      <Footer />
    </>
  );
}










