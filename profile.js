const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  username: String,

  name: String,

  bio: String,

  github: String,

  linkedin: String,

  resumeUrl: String,

  skills: {
    frontend: [String],
    backend: [String],
    devops: [String]
  },

  projects: [
    {
      title: String,
      description: String,
      techStack: [String],
      repoLink: String,
      liveLink: String,
      screenshot: String
    }
  ],

  templateId: {
    type: String,
    default: "minimalist"
  }
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;