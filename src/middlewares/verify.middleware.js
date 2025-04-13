import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt= asyncHandler( async(req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if ( !token) {
            throw new ApiError(400, "");
        }
    
        const decodedToken= jwt.verify( token, process.env.ACCESS_TOKEN_SECRET);
    
        const student= await Student.findById(decodedToken?._id)
    
        if( !student)
            throw new ApiError(400, "Invalid access token");
    
        req.student= student;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})

export { verifyJwt};