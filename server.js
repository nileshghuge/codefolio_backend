
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Profile = require("./Profile");
const Contact = require("./Contact");
const User = require("./User");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// MONGODB CONNECTION
// ======================================================

// KEEP YOUR EXISTING WORKING MONGODB CONNECTION STRING HERE.
// Do NOT change the connection string that is currently working.

mongoose
  .connect("mongodb+srv://codefolio:codefolio12345@cluster0.pmbyypn.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// ======================================================
// EMAIL / NODEMAILER
// ======================================================

const EMAIL_USER = "nileshghuge847@gmail.com";
const EMAIL_PASSWORD = "xhtkihuqwyrciylo";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});


// ======================================================
// JWT
// ======================================================

const JWT_SECRET = "CODEFOLIO_SECRET_KEY";


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.send("CodeFolio backend is running!");
});


// ======================================================
// GET ALL PROFILES
// ======================================================

app.get("/api/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find();

    res.json(profiles);
  } catch (error) {
    console.log("Get profiles error:", error);

    res.status(500).json({
      message: "Unable to get profiles",
    });
  }
});


// ======================================================
// GET DEFAULT PROFILE
// ======================================================

app.get("/api/profile", async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.log("Get profile error:", error);

    res.status(500).json({
      message: "Unable to get profile",
    });
  }
});


// ======================================================
// GET PROFILE BY USERNAME
// ======================================================

app.get("/api/profile/:username", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      username: req.params.username,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.log("Get username profile error:", error);

    res.status(500).json({
      message: "Unable to get profile",
    });
  }
});


// ======================================================
// SAVE / UPDATE PROFILE
// ======================================================

app.post("/api/profile", async (req, res) => {
  try {
    const {
      username,
      name,
      bio,
      github,
      linkedin,
      resumeUrl,
      frontendSkills,
      backendSkills,
      devopsSkills,
      projects,
      templateId,
    } = req.body;

    if (!username || !name) {
      return res.status(400).json({
        message: "Username and name are required",
      });
    }

    const profileData = {
      username,
      name,
      bio,
      github,
      linkedin,
      resumeUrl,
      frontendSkills: frontendSkills || [],
      backendSkills: backendSkills || [],
      devopsSkills: devopsSkills || [],
      projects: projects || [],
      templateId: templateId || "minimalist",
    };

    const profile = await Profile.findOneAndUpdate(
      { username },
      profileData,
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      message: "Profile saved successfully!",
      profile,
    });
  } catch (error) {
    console.log("Save profile error:", error);

    res.status(500).json({
      message: "Unable to save profile",
    });
  }
});


// ======================================================
// CONTACT FORM
// ======================================================

app.post("/api/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      username,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const contact = new Contact({
      name,
      email,
      message,
      username,
    });

    await contact.save();

    await transporter.sendMail({
      from: `"CodeFolio Contact" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      replyTo: email,
      subject: `New CodeFolio Message from ${name}`,
      text: `
New message from your CodeFolio portfolio.

Username:
${username || "Not provided"}

Name:
${name}

Email:
${email}

Message:
${message}
      `,
    });

    res.status(200).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.log("Contact error:", error);

    res.status(500).json({
      message: "Unable to send message",
    });
  }
});


// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUsername = await User.findOne({
      username,
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,

      // New users are not Pro by default
      isPro: false,
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPro: user.isPro,
      },
    });
  } catch (error) {
    console.log("Register error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});


// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful!",
      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPro: user.isPro,
      },
    });
  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});


// ======================================================
// AUTHENTICATED USER
// ======================================================

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPro: user.isPro,
      },
    });
  } catch (error) {
    console.log("Auth error:", error);

    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
});


// ======================================================
// START SERVER
// ======================================================

app.listen(5000, () => {
  console.log(
    "Server running on http://localhost:5000"
  );
});

// ======================================================
// START SERVER
// ======================================================

