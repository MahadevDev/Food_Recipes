const express = require("express");
const router = express.Router();
const RegisterController = require("../controllers/RegisterControl");

router.post("/register", RegisterController);

module.exports = router;
