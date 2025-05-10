import {Router} from 'express';
import { upload } from '../middlewares/multer.middleware.js';

const router= Router();

import {
    getCategories,
    createCategory,
    addCourseToCategory,
    getAllCategory
} from "../controllers/category.controller.js";
import { verifyJwt } from '../middlewares/verify.middleware.js';

router.route("/category").get(getCategories);
router.route('/add-category').post(  createCategory);
router.route('/add-course').post(verifyJwt, upload.single('image') , addCourseToCategory);
router.route('/categories').get(getAllCategory);

export default router;