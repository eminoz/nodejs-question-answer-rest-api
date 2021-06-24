const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const {
  validationUserInput,
  comparePassword,
} = require("../helpers/input/inputHelper");
const { sendJwtToClient } = require("../helpers/authorization/tokenHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");

const register = asyncErrorWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  //Kayıt işlemi bittikten sonra user ve responseyi methodumuza yollamış olaucaz:
  sendJwtToClient(user, res);
});

const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  if (!validationUserInput(email, password)) {
    return next(new CustomError("Please check your input", 400));
  }
  const user = await User.findOne({
    email,
  }).select("+password");
  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please checkt your cradentions", 400));
  }
  sendJwtToClient(user, res);
});
const logout = asyncErrorWrapper(async (req, res, next) => {
  const { NODE_ENV } = process.env;
  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV == "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successful",
    });
});

const getUser = (req, res, next) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
    },
  });
};
const imageUpload = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profile_image: req.savedProfileImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    succes: true,
    message: "Image upload sucessful",
    data: user,
  });
});
const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  const resetEmail = req.body.email;

  const user = await User.findOne({
    email: resetEmail,
  });
  if (!user) {
    return next(new CustomError("Ther is no user with that email", 400));
  }

  /*
    Burada getResetPasswordTokenFromUser methoduna giderek password'u
    hashliyor ve yeni bir password üretiyor
    */
  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `
    <h3>  Reset your password  </h3>
    <p> This <a href= '${resetPasswordUrl}' target= '_blank'> link </a> will expire in 1 hour  </p>
    `;
  try {
    sendEmail({
      from: process.env.SMPT_USER,
      to: resetEmail,
      subject: "Reset your email",
      html: emailTemplate,
    });
    return res.status(200).json({
      success: true,
      message: "token send your email",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return next(new CustomError("Email could not be sent your email", 500));
  }
});
const resetPassword = asyncErrorWrapper(async (req, res, next) => {
  const { resetPasswordToken } = req.query;
  const { password } = req.body;

  if (!resetPasswordToken) {
    return next(new CustomError("please provide a valid token", 400));
  }

  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new CustomError("Invalid token or Session Expired", 404));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset password proses succecful",
  });
});
const editDetails = asyncErrorWrapper(async (req, res, next) => {
  const editInformations = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, editInformations, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    data: user,
  });
});
module.exports = {
  register,
  getUser,
  login,
  logout,
  imageUpload,
  forgotPassword,
  resetPassword,
  editDetails,
};
