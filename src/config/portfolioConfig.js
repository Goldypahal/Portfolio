export const portfolioConfig = {
  name: "GOLDY PAHAL",
  role: "AI/ML ENGINEER · DEVELOPER · RESEARCHER",
  tagline: "I build intelligent systems, software products, and experimental AI solutions that turn ideas into working technology.",
  location: "CHANDIGARH UNIVERSITY / INDIA",
  status: "OPEN TO AI/ML & DEVELOPER ROLES",
  email: "goldypahal06@gmail.com",
  phone: "+91 8398831554",
  phoneRaw: "+918398831554",
  githubUrl: "https://github.com/Goldypahal",
  linkedinUrl: "https://www.linkedin.com/in/goldy-pahal-8a6b84332/",
  resumeUrl: "#",

  about: {
    title: "About Me",
    institution: "Chandigarh University",
    degree: "Bachelor of Engineering — Computer Science Engineering",
    specialization: "Artificial Intelligence & Machine Learning",
    timeline: "2024 — Present",
    bio: "I'm a Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning at Chandigarh University. My interests sit at the intersection of AI research, software engineering, and practical product development. I enjoy taking an idea from a rough concept, understanding the underlying problem, experimenting with different approaches, and turning the result into something people can actually use.",
    workedOn: "I've worked on projects involving machine learning, natural language processing, computer vision, web applications, augmented reality, and AI-powered systems."
  },

  pillars: [
    { title: "BUILD", desc: "I like turning concepts into functional prototypes and products.", icon: "Hammer" },
    { title: "RESEARCH", desc: "I enjoy experimenting with models, algorithms, datasets, and unconventional approaches.", icon: "Search" },
    { title: "LEARN", desc: "I'm constantly expanding my understanding of AI, software engineering, and computer science.", icon: "BookOpen" },
    { title: "SOLVE", desc: "I approach technical problems by breaking them down, experimenting, debugging, and iterating.", icon: "Zap" }
  ],

  skillCategories: [
    {
      category: "Programming Languages",
      skills: ["C", "C++", "Python", "JavaScript", "SQL"]
    },
    {
      category: "Artificial Intelligence & Machine Learning",
      skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Generative AI", "AI Agents"]
    },
    {
      category: "ML / AI Technologies",
      skills: ["NumPy", "Pandas", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "Hugging Face"]
    },
    {
      category: "Web Development",
      skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Node.js"]
    },
    {
      category: "Databases & Infrastructure",
      skills: ["PostgreSQL", "Redis", "Docker", "NGINX"]
    },
    {
      category: "Tools & Platforms",
      skills: ["Git", "GitHub", "Linux", "WSL", "Jupyter", "Unity"]
    },
    {
      category: "Core Computer Science",
      skills: ["Data Structures & Algorithms", "Object-Oriented Programming", "DBMS", "Operating Systems", "Computer Networks"]
    }
  ],

  exploring: [
    {
      title: "Generative AI",
      desc: "Learning how modern generative models work and how they can be integrated into practical applications."
    },
    {
      title: "AI Agents",
      desc: "Experimenting with systems capable of planning, reasoning, interacting with tools, and completing multi-step tasks."
    },
    {
      title: "Multimodal AI",
      desc: "Exploring systems that combine text, images, and other forms of information."
    },
    {
      title: "Computer Vision",
      desc: "Building and experimenting with systems that understand and interact with visual environments."
    },
    {
      title: "AI Research",
      desc: "Studying model robustness, evaluation, optimization, and emerging approaches to intelligent systems."
    },
    {
      title: "Modern AI Systems",
      desc: "Exploring modern AI systems beyond traditional machine-learning pipelines."
    }
  ],

  // Scroll journey: moon -> projects (one planet each) -> black hole + contact.
  // `image` / `imageFar` are keys resolved in components/SpaceJourney.js
  journey: {
    moon: {
      name: "LUNAR ORBIT",
      tag: "DEPARTURE POINT",
      desc: "The sun has set on the home sky. Keep scrolling to leave orbit and fly through the systems I've built."
    },
    blackHole: {
      name: "SINGULARITY",
      tag: "END OF TRANSMISSION"
    },
    planets: [
      {
        id: "cortex",
        name: "CORTEX HUB",
        tag: "ENTERPRISE AI COMPONENT STORE",
        desc: "Production-ready, deterministic AI engines with exact document byte-offset citations, hybrid vector retrieval and sovereign VPC / air-gapped deployment.",
        stack: ["AI Engines", "Hybrid Retrieval", "PostgreSQL", "Razorpay"],
        repo: "https://github.com/Goldypahal/Cortex-Hub",
        image: "cortex",
        focus: [0.49, 0.52]
      },
      {
        id: "ffire",
        name: "FFIRE",
        tag: "FINANCIAL FRAUD INVESTIGATION REASONING ENGINE",
        desc: "A multi-agent investigation engine where every claim is checked and every case is replayable.",
        stack: ["LangGraph", "FastAPI", "React 19", "TypeScript"],
        repo: "https://github.com/Goldypahal/FFRE",
        image: "ffire",
        imageFar: "ffireFar",
        focus: [0.5, 0.5]
      },
      {
        id: "reel",
        name: "RESEARCH REEL",
        tag: "RESEARCH SHARING PLATFORM",
        desc: "A cloud-native microservices platform for sharing research as short-form video reels and interactive documents.",
        stack: ["Next.js", "Express", "Python RAG", "Postgres", "Redis"],
        repo: "https://github.com/Goldypahal/ResearchReel",
        image: "reel",
        focus: [0.65, 0.46]
      },
      {
        id: "heimdal",
        name: "HEIMDAL / SHIELD",
        tag: "PERSONAL SAFETY PLATFORM",
        desc: "Plan safer walking routes, share a walk live with guardians, and raise an SOS by button, voice keyword or a silent duress PIN.",
        stack: ["Expo / React Native", "FastAPI", "TypeScript"],
        repo: "https://github.com/Goldypahal/Shield",
        image: "heimdal",
        focus: [0.28, 0.48]
      },
      {
        id: "multirag",
        name: "MULTI RAG SYSTEM",
        tag: "SEARCH. REASON. SUMMARIZE. TOGETHER.",
        desc: "A multi-paper research RAG system that searches, reasons over and summarizes across many papers at once.",
        stack: ["FastAPI", "LangChain", "ChromaDB"],
        repo: "https://github.com/Goldypahal/Multi-Paper-Research-RAG-System-",
        image: "multirag",
        focus: [0.48, 0.46]
      }
    ]
  },

  socials: [
    { label: "GITHUB", url: "https://github.com/Goldypahal" },
    { label: "LINKEDIN", url: "https://www.linkedin.com/in/goldy-pahal-8a6b84332/" },
    { label: "EMAIL", url: "mailto:goldypahal06@gmail.com" },
    { label: "PHONE", url: "tel:+918398831554" }
  ]
};
