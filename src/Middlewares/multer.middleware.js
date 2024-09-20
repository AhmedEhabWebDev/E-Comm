import multer from "multer";


import { extensions } from "../Utils/index.js";

export const multerHost = ({ allowedExtensions = extensions.Images }) => {
  const storage = multer.diskStorage({});

  // fileFilter
  const fileFilter = (req, file, cb) => {
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(
      new ErrorClass(
        `Invalid file type, only ${allowedExtensions} images are allowed`,
        400,
        `Invalid file type, only ${allowedExtensions} images are allowed`
      ),
      false
    );
  };

  return multer({ fileFilter, storage });
};
