const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const QuestionSchema = new Schema({
  title: {
    type: String,
    require: [true, "Please provide a title"],
    minlenght: [10, "Please provide a title least 10 character"],
    unique: true,
  },
  content: {
    type: String,
    minlength: [20, "Please provide a title least 20 character"],
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  answerCount: {
    type: Number,
    default: 0,
  },
  answers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Answer",
    },
  ],
});
//Pre kayıt edilmeden hemen önce demek

QuestionSchema.pre("save", function (next) {
  if (!this.isModified("title")) {
    next();
  }
  this.slug = this.makeSlug();
  next();
});
QuestionSchema.methods.makeSlug = function () {
  return slugify(this.title, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: false,
  });
};

module.exports = mongoose.model("Question", QuestionSchema);
