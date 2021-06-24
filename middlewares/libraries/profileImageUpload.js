const multer = require("multer");
const path = require('path');
const CustomErros = require("../../helpers/error/CustomError");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const rootDir = path.dirname(require.main.filename);
        cb(null, path.join(rootDir, "/public/uploads"));
    },
    filename: function (req, file, cb) {

        const extension = file.mimetype.split("/")[1]; //jpg gif veya jpeg olaanı alır
        req.savedProfileImage = "image_" + req.user.id + "." + extension;
        cb(null, req.savedProfileImage)
    }
})

const fileFilter = (req, file, cb) => {

    const allowedMimeType = ["image/jpg", "image/jpeg", "image/gif", "image/png"];

    if (!allowedMimeType.includes(file.mimetype)) {

        return cb(new CustomErros("Please provide a valid image file", 400), false);
    }
    return cb(null, true);
}
const profileImageUpload = multer({ storage, fileFilter });

module.exports = profileImageUpload;