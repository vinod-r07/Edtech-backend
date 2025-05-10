import {Router } from 'express';
import {
    register,
    login,
    changePassword,
    regenerateRefreshToken,
    forgetPassword,
    getUser
} from "../controllers/auth.controller.js";
import { verifyJwt } from '../middlewares/verify.middleware.js';


const router= Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forget-password').post(forgetPassword);
router.route('/get-user').get(getUser);

// secured routes
router.route('/change-password').post(verifyJwt, changePassword);
router.route('/refresh-token').post(verifyJwt, regenerateRefreshToken);


export default router;