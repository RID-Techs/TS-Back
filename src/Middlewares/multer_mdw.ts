import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const MIME_TYPES: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
}

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!(file.mimetype in MIME_TYPES)) {
            return cb(new Error("Invalid file type. Only .png, .jpg, and .jpeg are allowed."));
        }
        cb(null, true);
    }
}).single('product_picture');
