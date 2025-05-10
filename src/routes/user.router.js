import {Router } from 'express';
import {
    updateDp,
    updateProfile
} from "../controllers/user.controller.js";
import { verifyJwt } from '../middlewares/verify.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router= Router();

router.route('/update-dp').post(verifyJwt, upload.single('image'), updateDp);
router.route('/update-data').post(verifyJwt, updateProfile);

export default router