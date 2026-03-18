const express = require("express");
const router = express.Router();
const ForgotPassword = require("../controllers/forgotpassword");

router.put("/forgotpassword", ForgotPassword);

module.exports = router;
