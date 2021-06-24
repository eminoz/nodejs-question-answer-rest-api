const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const {
  isTokenIncluded,
  getAccessTokenFromHeader,
} = require("../../helpers/authorization/tokenHelpers");
const asyncErrorWrapper = require("express-async-handler");
const User = require("../../models/User");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");

const getAccessToRoute = (req, res, next) => {
  const { JWT_SECRET_KEY } = process.env;

  if (!isTokenIncluded(req)) {
    /*
        burada iki tane status dödürürüz
        401 Unauthorized
        403 Forbiden
        */
    return next(new CustomError("You are not authorized this route", 401));
  }

  const accesToken = getAccessTokenFromHeader(req);

  jwt.verify(accesToken, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new CustomError("You are not authorized this route2", 401));
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
    next();
    console.log(decoded);
  });
};
const getAdminAcces = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role !== "admin") {
    return next(new CustomError("Only admins can access this route", 403)); //Forbiden hatası
  }
  next();
});

const getQuestionOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const questionId = req.params.id;
  const question = await Question.findById(questionId);

  if (question.user != userId) {
    return next(new CustomError("Only can access your own question", 403));
  }
  next();
});
const getAnswerOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const answerId = req.params.id;

  const answer = await Question.findById(answerId);
  if (answer.user.id != userId) {
    return next(new CustomError("Only can access your own question", 403));
  }
  next();
});

module.exports = {
  getAccessToRoute,
  getAdminAcces,
  getQuestionOwnerAccess,
  getAnswerOwnerAccess,
};
