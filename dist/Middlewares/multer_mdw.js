import multer from "multer";
const MIME_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!(file.mimetype in MIME_TYPES)) {
            return cb(new Error("Invalid file type. Only .png, .jpg, and .jpeg are allowed."));
        }
        cb(null, true);
    }
}).single('product_picture');
