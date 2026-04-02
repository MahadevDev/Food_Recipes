const User = require("../Schema/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^(?=.*[a-z])(?=.*\d)[a-z0-9]{5,12}@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email is invalid." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.SECRET
    );

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = Login;
