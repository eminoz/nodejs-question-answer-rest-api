const Question = require("../models/Question");
const Answer = require("../models/Answer");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { question_id } = req.params;
  const user_id = req.user.id;
  const information = req.body;
  const answer = await Answer.create({
    content: information.content,
    question: question_id,
    user: user_id,
  });
  return res.status(2000).json({
    success: true,
    data: answer,
  });
});
const getAllAnswerByQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { question_id } = req.params;

  const question = await Question.findById(question_id).populate("answers"); //Burada questionları aswerları ile beraber getiriri

  console.log(question);
  const answer = question.answers;

  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const getSingleAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;

  const answer = await Answer.findById(answer_id)
    .populate({
      path: "user",
      select: "name profile_image",
    })
    .populate({
      path: "question",
      select: "title",
    });

  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const editAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;

  const { content } = req.body.id;

  const answer = await Answer.findById(answer_id);
  answer.content = content;
  await answer.save();
  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const deleteAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const { question_id } = req.params;

  await Answer.findByIdAndRemove(answer_id);
  const question = await Question.findById(question_id);
  //Aşağıdaki satırda answerlarımızın içersindeki answer_id isimli BİR tane yorumu kaldımış olduk
  //Kaldırmasaydık yorum gözükmeyecekti ama arayin olduğu yerin varlığı devam edecekti
  question.answers.splice(question.answers.indexOf(answer_id), 1);
  question.answerCount = question.answers.length;
  await question.save();
  return res.status(200).json({
    success: true,
    message: "Deleted succesfuly",
  });
});
const likeAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const answer = await Answer.findById(answer_id);

  //bu kullanıcı bu questionu beğenmişte
  if (answer.likes.includes(req.user.id)) {
    return next(new CustomError("You have already liked this question"), 400);
  }
  answer.likes.push(req.user.id);
  await answer.save();
  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const undoLikeAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const answer = await Answer.findById(answer_id);

  if (!answer.likes.includes(req.user.id)) {
    return next(new CustomError("You can not undo this question"), 400);
  }
  const index = answer.likes.indexOf(req.user.id);

  answer.likes.splice(index, 1);

  await answer.save();

  return res.status(200).json({
    success: true,
    data: answer,
  });
});
module.exports = {
  addNewAnswerToQuestion,
  getAllAnswerByQuestion,
  getSingleAnswer,
  editAnswer,
  deleteAnswer,
  likeAnswer,
  undoLikeAnswer,
};
