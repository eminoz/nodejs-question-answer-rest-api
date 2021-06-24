const bcrypt=require("bcryptjs");

const validationUserInput = (email, password) => {
    return email && password;
}

const comparePassword = (password, hashedPassword) => {
return bcrypt.compareSync(password,hashedPassword)
}

module.exports = {
    validationUserInput,
    comparePassword
};