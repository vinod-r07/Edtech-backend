
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Student} from "../models/student.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


const getData = asyncHandler(
    async( req, res) => {
        
        // 1. search in database
        // 2. return to the user

        const {email, userId}= await req.body;

        const existedUser = await User.findOne({
            $or: [{ userId }, { email }]
        })

        if( !existedUser )
            throw new ApiError(400, "User not exist !!");

        const savedUser= existedUser.select(" -password -refreshToken")

        return res.status(200).json(
            new ApiResponse(200, savedUser, "Data fetched successfull")
        )

    }
    
)

const updateDetails= asyncHandler(

    // 1. fullName
    // 2. dp
    // 3. bio
    // 4. college
    // 5. Branch
    // 6. passingYear

   async (req, res) => {

        const { fullName, dp, bio, college, branch, passingYear } = req.student;

        const studentId = req?.student?._id;

        if( !studentId )
            throw new ApiError(400, "Something went wrong !!");

        await Student.findByIdAndUpdate({
            studentId,
            {
               $set: [{fullName}, {bio}, {college}, {dp}, {branch}, {passingYear}]  
            },
            {
                new: true
            }
        })

        const student= req.student;
        student.dp= dp;
        student.bio= bio;
        student.fullName= fullName;

        student.save();

        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { fullName: fullName, email: req?.student?.email, 
                    college: college, branch: branch, passing_year: passingYear, 
                    dp: dp, branch: branch, bio: bio
                },
                "Profile updated successfully !!"
            )
        )

   }
)

const enroll= asyncHandler(
    async( req, res ) => {

    }
)



export { 
    getData,
   
};