import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Instructor } from "../models/instructor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const options = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (user) => {

    const refreshToken =  user.generateRefreshToken();
    const accessToken  =  user.generateAccessToken();

    user.refreshToken= refreshToken;

    await user.save();

    return {accessToken, refreshToken};

}

const register = asyncHandler(
    async( req, res) => {
        
        const { role, email, phone, fullName, password } = req.body;

        // Check if any required field is missing or empty
        if ([email, phone, fullName, password, role].some(field => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }
        
        // Check if user already exists as a Student
        const userExistAsStudent = await Student.findOne({
            $or: [{ email }, { phone }]
        });
        
        if (userExistAsStudent) {
            throw new ApiError(400, "User is already registered as student!!");
        }
        
        // Check if user already exists as an Instructor
        const userExistAsTutor = await Instructor.findOne({
            $or: [{ email }, { phone }]
        });
        
        if (userExistAsTutor) {
            throw new ApiError(400, "User is already registered as instructor!!");
        }
        
        // Handle Student registration
        if (role === "Student") {
            const newStudent = new Student({
                email,
                phone,
                fullName,
                password,
            });
        
            const savedUser = await newStudent.save();
        
            const { refreshToken, accessToken } = generateAccessAndRefreshToken(savedUser);
        
            const response= await Student.findById(savedUser?._id).select(" -password -refreshToken").lean();
             response.token= accessToken;
             response.role= role
        
            return res
                .status(201)
                .cookie("refreshToken", refreshToken, options)
                .cookie("accessToken", accessToken, options)
                .json(
                    new ApiResponse(200, { response, accessToken}, 'Student registered successfully')
                );
        }else if( role === "Instructor" ) {

             const newTutor= new Instructor(
                {
                email,
                phone,
                fullName,
                password,
                }
             )

             const savedUser= await newTutor.save();

             const {refreshToken, accessToken}= generateAccessAndRefreshToken(savedUser);

             
             const response= await Instructor.findById(savedUser?._id).select(" -password -refreshToken").lean();
             response.token= accessToken;
             response.role=role

             return res
             .status(201)
             .cookie("refreshToken", refreshToken, options)
             .cookie("accessToken", accessToken, options)
             .json(
                 new ApiResponse(200,  { response, accessToken}, "Instructor registered successfully !!")
             )

        } 
        else
        throw new ApiError(400, "Invalid role")

    }
)

const login = asyncHandler(
    async( req, res ) => {

        const { email, phone,  password}= req.body;

        if( ( email.trim() === "" && phone.trim() === "" ) || (  password.trim() === "" ) )
            throw new ApiError(400, "All fields are required");

        const studentExist = await Student.findOne({
            $or:[ {email}, {phone}]
        })

        const tutorExist = await Instructor.findOne({
            $or:[{email}, {phone}]
        })

        if( studentExist ){

            const isPasswordMatch = studentExist.isPasswordCorrect(password);

            if( !isPasswordMatch )
                throw new ApiError(400, "Incorrect password !!")
            
            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(studentExist);

            const response= await Student.findById(studentExist?._id)
            .select(" -password -refreshToken")
            .populate("courses")
            .lean();
            response.token= accessToken;
            response.role= "Student"

            return res
            .status(200)
            .cookie("accessToken",  accessToken,  options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, 
                    { response, accessToken},
                     "Student logged in successfully !!")
            )

        } else if( tutorExist ){

            const isPasswordMatch = tutorExist.isPasswordCorrect(password);

            if( !isPasswordMatch )
                throw new ApiError(400, "Incorrect password");

            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(tutorExist);

            const response= await Instructor.findById(tutorExist?._id).select(" -password -refreshToken").populate("courses").lean();
            response.token= accessToken;
            response.role= "Instructor"

            return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {response, accessToken},
                    "Instructor logged in successfully !!"
                )
            )

        } else{
            throw new ApiError(400, "user does not exist !!");
        }

    }
)

const changePassword = asyncHandler(
    async( req, res ) => {

        const { newPassword, oldPassword } = req.body;

        if( newPassword.trim() === "" || oldPassword.trim() === "" )
            throw new ApiError(400, "All fields are required");

        const user= req.user;

            const isPasswordMatch= await user.isPasswordCorrect(oldPassword);

            if( !isPasswordMatch)
                throw new ApiError(400, "Incorrect old password");

            user.password= newPassword;

            await user.save();

            return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Password changed successfully !!")
            )
    }
)

const forgetPassword = asyncHandler(
    async( req, res ) => {

    }
)

const regenerateRefreshToken = asyncHandler(
    async( req, res ) => {

        const incomingRefreshToken = req.cookie("refreshToken") || req.header("Authorisation").replace("Bearer ", "");

        const student= req.student;
        const instructor = req.instructor;

        if( student ) {
            
            if( !incomingRefreshToken === student.refreshToken )
                throw new ApiError(400, "Invalid credentials");

            const { refreshToken, accessToken}= await generateAccessAndRefreshToken(student);

            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {accessToken: accessToken, refreshToken: refreshToken},
                    "Token refresh successfuly !!"
                )
            )

        }
        else if( instructor ) {

            if( !incomingRefreshToken === instructor.refreshToken )
                throw new ApiError(400, "Invalid credentials");

            const { refreshToken, accessToken}= await generateAccessAndRefreshToken(instructor);

            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {accessToken: accessToken, refreshToken: refreshToken},
                    "Token refresh successfuly !!"
                )
            )

        }
        else
        throw new ApiError(400, "Something went wrong !! role is not defined ")
    }
)

const getUser= asyncHandler( 
    async(req, res) => {

        const token= req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

        try {
            const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
            const std= await Student.findById(decodedToken?.id);
            if( std){
                console.log("std : ", std);
            }
    
            const tutor= await Instructor.findById(decodedToken?.id);
            if( tutor) {
                console.log("tutor : ", tutor)
            }
    
            return res.status(201).json( new ApiResponse(200, {},  "All good"))
        } catch (error) {
            throw new ApiError(400, "Something went wrong")
        }
    }
)

const deleteAcont= asyncHandler(
    async(req, res) => {

        // 1. get user
        const user= req.user;

        // 2. user role
        if( user.role === "Student" ){
            
        }
        else if( user.role === "Instructor" ) {

        }
        else{
            throw new ApiError(400, "Invalid user")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, " Account deleted successfully !!")
        )

    }
)


export 
{
    register,
    login,
    changePassword,
    regenerateRefreshToken,
    forgetPassword,
    getUser
}
