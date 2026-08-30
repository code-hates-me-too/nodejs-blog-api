const multer = require("multer");
const path = require("path");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/avatars/");
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        // userid'yi dosya adına koyuyoruz, eski avatarı silerken kolayca bulmak için
        cb(null, "user-" + req.user.userid + "-" + Date.now() + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Sadece JPG, JPEG, PNG ve WEBP formatında resim yükleyebilirsiniz."));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } //2mb
});

module.exports.upload = upload;