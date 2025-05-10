import { Router } from "express";
import { verifyJwt } from "../middlewares/verify.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';
import {
       uploadFile,
       createSection,
       getCourseInfo,
       getCourseInfoPublic,
       courseEnrollment,
       addCourseReview
} from "../controllers/course.controller.js";
import { verifyCourseAccess } from "../middlewares/verifyCourseAccess.middleware.js";

const router= Router();

router.route('/create-section').post(verifyJwt, createSection);
router.route('/upload-file').post(verifyJwt, upload.single('file'), uploadFile);
router.route('/course-info').get(verifyJwt, verifyCourseAccess, getCourseInfo);
router.route('/course-info-public').get(getCourseInfoPublic);
router.route('/enroll-student').post(verifyJwt, courseEnrollment);
router.route('/add-course-review').post(verifyJwt, addCourseReview)

export default router;