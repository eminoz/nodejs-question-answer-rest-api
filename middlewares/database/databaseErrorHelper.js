const User = require("../../models/User");
const CustomError = require("../../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");

const checkUserExits = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("There is no such user whit that id", 400));
  }
  next();
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    succes: true,
    data: user,
  });
});

const checkQuestionExist = asyncErrorWrapper(async (req, res, next) => {
  const question_id = req.params.id || req.params.question_id;

  const question = await Question.findById(question_id);

  if (!question) {
    return next(new CustomError("There is no such question whit that id", 400));
  }
  next();
});

const checkQuestionAndAnswerExist = asyncErrorWrapper(
  async (req, res, next) => {
    const question_id = req.params.question_id;

    const answer_id = req.params.answer_id;

    const answer = await Answer.findById({
      _id: answer_id,
      question: question_id,
    });
    if (!answer) {
      return next(
        new CustomError(
          "There is no asnwer whit that id associated with question id"
        ),
        400
      );
    }
    next();
  }
);

module.exports = {
  checkUserExits,
  getAllUsers,
  checkQuestionExist,
  checkQuestionAndAnswerExist,
};
