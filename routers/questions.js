const express = require("express");
const router = express.Router();

const {
     askNewQuestion,
     getAllQuestions,
     getSingleQuestions,
     editQuestion,
     deleteQuestion,
     likeQuestion,
     undolikeQuestion
} = require("../controllers/questions")

const {
     checkQuestionExist
} = require("../middlewares/database/databaseErrorHelper")

const {
     getAccessToRoute,
     getQuestionOwnerAccess
} = require("../middlewares/authorization/auth");

const answer=require("./answer")

router.get("/", getAllQuestions);
router.get(":id/like", [getAccessToRoute, checkQuestionExist], likeQuestion)
router.get(":id/undo_like", [getAccessToRoute, checkQuestionExist], undolikeQuestion)
router.get("/:id", checkQuestionExist, getSingleQuestions);
router.post("/ask", getAccessToRoute, askNewQuestion);
router.put("/:id/edit", [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess], editQuestion)
router.delete("/:id/delete", [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess], deleteQuestion)

router.use("/:question_id/answers",checkQuestionExist,answer)

module.exports = router;