import { Router } from "express";
import { verifyJwt } from '../middlewares/verify.middleware.js';
import {
    getRevenue
}
 from "../controllers/instructor.controller.js";

const router= Router();

router.route('/get-revenue').get( verifyJwt, getRevenue)

export default router;