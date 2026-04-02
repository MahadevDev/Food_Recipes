const User = require("../Schema/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const emailRegex = /^(?=.*[a-z])(?=.*\d)[a-z0-9]{5,12}@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email is invalid." });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password must match" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in DB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create JWT token (expires in 1 hour)
    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    // Return user info (excluding password) and token
    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Register;
