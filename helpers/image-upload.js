const multer = require("multer");
const path = require("path");

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
];  

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/images/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname));
//     }
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, extension);

        cb(
            null,
            baseName + "-" + Date.now() + extension
        );
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Sadece JPG, JPEG, PNG ve WEBP formatında resim yükleyebilirsiniz."));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

function handleUpload(uploadMiddleware) {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                // multer'ın kendi hatası (boyut, tip vs.) burada req üzerine iliştiriliyor,
                // next(err) DEMİYORUZ ki istek normal akışa devam edip controller'a ulaşsın
                req.uploadError = err;
            }
            next();
        });
    };
}

module.exports.handleUpload = handleUpload;

module.exports.upload = upload;

