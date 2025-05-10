import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, image, and video files are allowed!'));
    }
  }
});
