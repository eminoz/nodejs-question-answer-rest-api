const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Question = require("./Question");

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Plase provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, // mongoose reg ex validation
      "Plase provide a valid email",
    ],
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  password: {
    type: String,
    minlength: [6, "Please provide a password with min lengt :6 "],
    required: [true, "Plase enter your password"],
    select: false, // get all users dediğimiz zaman pw gelmemesi için
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  title: {
    type: String,
  },
  about: {
    type: String,
  },
  place: {
    type: String,
  },
  website: {
    type: String,
  },
  profile_image: {
    type: String,
    default: "default.jpg",
  },
  blocted: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

// UserShema Methods
UserSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

  const payload = {
    id: this._id,
    name: this.name,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");

  const { RESET_PASSWORD_EXPIRE } = process.env;

  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");
  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);
  return resetPasswordToken;
};

//Pre hooks
UserSchema.pre("save", function (next) {
  //Burada bcrypt npm ini projemize dahil ettik:
  //Bu bizim parolamızı hashleyip db ye öyle gönderecektir

  //Parola değişmemişse
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      next(err);
    }
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        next(err);
      }
      this.password = hash;
      next();
    });
  });
});

UserSchema.post("remove", async function () {
  await Question.deleteMany({
    user: this._id,
  });
});
module.exports = mongoose.model("User", UserSchema);
//User'ı hem mongoose kayıt ettik hemde kullanmak içn dışarı attık:
