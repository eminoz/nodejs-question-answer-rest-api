const Question = require("../models/Question");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const askNewQuestion = asyncErrorWrapper(async (req, res, next) => {
  const information = req.body;

  const question = await Question.create({
    title: information.title,
    user: req.user.id,
  });
  return res.status(200).json({
    success: true,
    data: question,
  });
});
const getAllQuestions = asyncErrorWrapper(async (req, res, next) => {
  /*
    {{URL}}/api/questions?search=mongodb yaptığımız zaman  search içersinde mongodbyi yakalamış oluruz
    console.log(req.query.search)
    */

  let query = Question.find();
  const populate = true;
  const populateObject = {
    path: "user",
    select: "name profile_image",
  };
  //search
  if (req.query.search) {
    const searchObject = {};
    //Bu bizim dbdeki search ile gelen verileri regex ile küçük büyük yazıya duyarlı olmaksızın bulacaktır
    const regex = new RegExp(req.query.search, "i");
    searchObject["title"] = regex;
    query = query.where(searchObject);
  }
  //populate
  if (populate) {
    query = query.populate(populateObject);
  }

  //pagination

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination = {};
  const total = await Question.countDocuments; // countDocuments ile Question dbsinde kaç tane soru olduğunu bulum oluruz

  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }
  query = query.skip(startIndex).limit(limit);

  //sort : req.query.sortBy most-answered most-liked

  const sortKey = req.query.sortBy;

  if (sortKey == "most-answered -createdAt") {
    //normalde en azdan en çoğa doğru sıralar.Başına - koyarak en çoktan en aza doğru sıraladık:
    query = query.sort("-answerCount");
  }
  if (sortKey == "most-liked") {
    query = query.sort("-likeCount");
  } else {
    query = query.sort("-createdAt");
  }

  const questions = await query;

  return res.status(200).json({
    success: true,
    count: questions.length,
    pagination: pagination,
    data: questions,
  });
});
const getSingleQuestions = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  return res.status(200).json({
    success: true,
    data: question,
  });
});

const editQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let question = await Question.findById(id);

  question.title = title;
  question.content = content;
  question = await question.save();
  return res.status(200).json({
    success: true,
    data: question,
  });
});
const deleteQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;

  await Question.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Question was deleted successfly",
  });
});
const likeQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const question = await Question.findById(id);

  //bu kullanıcı bu questionu beğenmişte
  if (question.likes.includes(req.user.id)) {
    return next(new CustomError("You have already liked this question"), 400);
  }
  question.likes.push(req.user.id);
  question.likeCount = question.likes.length;
  await question.save();
  return res.status(200).json({
    success: true,
    data: question,
  });
});
const undolikeQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const question = await Question.findById(id);

  if (!question.likes.includes(req.user.id)) {
    return next(new CustomError("You can not undo this question"), 400);
  }
  const index = question.likes.indexOf(req.user.id);

  question.likes.splice(index, 1);
  question.likeCount = question.likes.length;

  await question.save();

  return res.status(200).json({
    success: true,
    data: question,
  });
});

module.exports = {
  askNewQuestion,
  getAllQuestions,
  getSingleQuestions,
  editQuestion,
  deleteQuestion,
  likeQuestion,
  undolikeQuestion,
};
