const express = require("express");
const router = express.Router();


const question = require("./questions");
const auth = require("./auth");
const user = require("./users")
const admin = require("./admin")

router.use("/questions", question);
router.use("/auth", auth);
router.use("/users", user)
router.use("/admin", admin)

module.exports = router;