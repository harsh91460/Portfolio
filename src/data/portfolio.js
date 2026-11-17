export const portfolio = {
  name: "Harsh Mishra",
  initials: "HM",

  role: "Software Developer | Machine Learning & AI",
  tagline: "Building practical software and intelligent systems.",

  location: "India",
  email: "harshmishra9146@gmail.com",

  description:
    "Final-year Computer Science undergraduate at IMS Engineering College. I build REST API backends, real-time web applications and machine learning pipelines using Python, JavaScript, Node.js and modern development tools.",

  socialLinks: {
    github: "https://github.com/harsh91460",
    linkedin:
      "https://www.linkedin.com/in/harsh-mishra-316124295/",
    leetcode: "",
  },

  education: {
    degree: "B.Tech in Computer Science & Engineering",
    college: "IMS Engineering College, Ghaziabad",
    graduation: "2027",
    cgpa: "7.20",
    lastSemesterSGPA: "7.62",
  },

  experience: [
    {
      company: "Baqbenchers",
      role: "Web Development Intern",
      duration: "June 2026 – August 2026",
      description:
        "Built responsive web pages using HTML, CSS and JavaScript, integrated REST APIs, handled database CRUD operations and collaborated using Git, GitHub and Agile practices.",
    },
    {
      company: "TCS iON",
      role: "Virtual Experience Program",
      duration: "Virtual Internship",
      description:
        "Completed simulated workplace tasks involving project workflows, technical documentation, collaboration and structured problem solving.",
    },
  ],

  certifications: [
    "Data Science Training Program – Internshala",
    "Data Science Program – Unessa Foundation",
  ],

  skills: [
    {
      category: "Programming",
      items: ["Python", "JavaScript", "SQL", "HTML", "CSS"],
    },
    {
      category: "AI / Machine Learning",
      items: [
        "Machine Learning",
        "NLP",
        "Scikit-learn",
        "XGBoost",
        "Random Forest",
        "TF-IDF",
        "Pandas",
        "NumPy",
        "Feature Engineering",
        "Time-Series Forecasting",
      ],
    },
    {
      category: "Backend & Database",
      items: [
        "Node.js",
        "Express.js",
        "REST APIs",
        "JWT Authentication",
        "Socket.io",
        "MongoDB",
        "MySQL",
      ],
    },
    {
      category: "Tools & Core CS",
      items: [
        "Git",
        "GitHub",
        "VS Code",
        "Judge0",
        "DSA",
        "OOP",
        "DBMS",
        "Operating Systems",
        "Computer Networks",
      ],
    },
  ],

  projects: [
    {
      name: "SmartScale",
      category: "AI / Machine Learning",
      description:
        "An AI-based cloud autoscaling system that forecasts CPU and memory usage, predicts failures and recommends resource scaling actions using machine learning.",
      technologies: [
        "Python",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "XGBoost",
        "Random Forest",
      ],
      metrics: [
        "CPU Forecast R²: 0.8885",
        "Memory Forecast R²: 0.8717",
        "Failure Prediction F1: 0.9908",
        "Autoscaling Accuracy: 90.49%",
      ],
      github: "https://github.com/harsh91460/Smart-Scale",
      featured: true,
    },
    {
      name: "ArvyaX Emotion Guide",
      category: "NLP / Machine Learning",
      description:
        "A local emotion guidance system that processes journal text and contextual metadata to predict emotional states and intensity, with a recommendation engine.",
      technologies: [
        "Python",
        "TF-IDF",
        "Random Forest",
        "Linear Regression",
        "Pandas",
        "NumPy",
      ],
      metrics: [
        "State Classification Accuracy: 78.5%",
        "Intensity Prediction MSE: 0.92",
      ],
      github: "https://github.com/harsh91460/arvyax-emotion-guide",
      featured: true,
    },
    {
      name: "Bravo",
      category: "Full-Stack Development",
      description:
        "An in-progress multiplayer coding battle platform where teams compete across coding rounds, with real-time rooms, scoreboards and sandboxed code execution.",
      technologies: [
        "Node.js",
        "Express.js",
        "MongoDB",
        "Socket.io",
        "Judge0",
        "JWT",
      ],
      metrics: [],
      github: "https://github.com/harsh91460/Bravo",
      featured: true,
      status: "In Development",
    },
  ],
};
