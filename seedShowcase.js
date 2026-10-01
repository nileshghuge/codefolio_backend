const mongoose = require("mongoose");
const Profile = require("./Profile");

// MongoDB connection
const MONGODB_URI =
  "mongodb+srv://codefolio:codefolio12345@cluster0.pmbyypn.mongodb.net/?appName=Cluster0";

const demoProfiles = [
  {
    username: "demo1",
    name: "Alex Morgan",
    bio: "Full Stack Developer building modern and scalable web applications.",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    resumeUrl: "https://example.com/resume",

    frontendSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
    ],

    backendSkills: [
      "Node.js",
      "Express.js",
      "MongoDB",
    ],

    devopsSkills: [
      "Git",
      "GitHub",
      "Docker",
    ],

    templateId: "minimalist",

    projects: [
      {
        title: "Task Manager",
        description:
          "A full-stack task management application for creating and tracking daily tasks.",
        techStack: [
          "React",
          "Node.js",
          "MongoDB",
        ],
        repoLink: "https://github.com/",
        liveLink: "https://example.com",
        screenshot: "",
      },
      {
        title: "E-Commerce Website",
        description:
          "A responsive e-commerce application with product browsing and shopping features.",
        techStack: [
          "React",
          "Express",
          "MongoDB",
        ],
        repoLink: "https://github.com/",
        liveLink: "https://example.com",
        screenshot: "",
      },
    ],
  },

  {
    username: "demo2",
    name: "Jordan Lee",
    bio: "Frontend developer focused on interactive interfaces and creative digital experiences.",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    resumeUrl: "https://example.com/resume",

    frontendSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Tailwind CSS",
    ],

    backendSkills: [
      "Node.js",
      "Express.js",
    ],

    devopsSkills: [
      "Git",
      "GitHub",
      "Vercel",
    ],

    templateId: "cyberpunk",

    projects: [
      {
        title: "AI Dashboard",
        description:
          "A modern dashboard interface for displaying AI-generated insights and analytics.",
        techStack: [
          "React",
          "JavaScript",
          "CSS",
        ],
        repoLink: "https://github.com/",
        liveLink: "https://example.com",
        screenshot: "",
      },
      {
        title: "Weather Application",
        description:
          "A responsive weather application that displays weather information in a simple interface.",
        techStack: [
          "React",
          "API",
          "CSS",
        ],
        repoLink: "https://github.com/",
        liveLink: "https://example.com",
        screenshot: "",
      },
    ],
  },
];

async function seedShowcaseProfiles() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected.");

    for (const profileData of demoProfiles) {
      await Profile.findOneAndUpdate(
        { username: profileData.username },
        profileData,
        {
          new: true,
          upsert: true,
        }
      );

      console.log(
        `Showcase profile created/updated: ${profileData.username}`
      );
    }

    console.log("Showcase profiles completed.");

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error(
      "Showcase seed error:",
      error
    );

    process.exit(1);
  }
}

seedShowcaseProfiles();

