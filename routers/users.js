const router = require("express").Router();

const { getSingleUser } = require("../controllers/user.js")
const { checkUserExits,getAllUsers } = require("../middlewares/database/databaseErrorHelper");

router.get("/:id", checkUserExits, getSingleUser);
router.get("/", getAllUsers)

module.exports = router;