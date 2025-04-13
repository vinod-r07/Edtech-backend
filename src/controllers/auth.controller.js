import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Instructor } from "../models/instructor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (user) => {

    const refreshToken =  user.generateRefreshToken(user);
    const accessToken  =  user.generateAccessToken();

    user.refreshToken= refreshToken;

    await user.save();

    return {accessToken, refreshToken};

}


const register = asyncHandler(
    async( req, res) => {
        
        const {role, email, phone, fullName, password}=  req.body;

        if( 
            [email, phone, fullName, password].some( (field) => {
                field.trim() === ""
            })
        )
            throw new ApiError(400, "All fields are required")

        if( role === "Student" ){

            const userExistAsStudent = await Student.findOne({
                $or: [ {email}, {phone}]
            })

            const userExistAsTutor = await Instructor.findOne({
                $or: [{email}, {phone}]
            })

            if( userExistAsStudent )
                throw new ApiError(400, "User is already registered as student !!");

            if( userExistAsTutor )
                throw new ApiError(400, "User is already registered as instructor !!")

            const newStudent= new Student(
                {
                    email: this.email,
                    phone: this.phone,
                    fullName: this.fullName,
                    password: this.password,
                }
            )

             await newStudent.save();

            return res
            .status(201)
            .json(
                new ApiResponse(200, {email, phone, fullName}, 'Student registered successfully')
            )

        }
        else if( role === "Instructor" ) {

            const userExistAsStudent = await Student.findOne({
                $or: [ {email}, {phone}]
            })

            const userExistAsTutor = await Instructor.findOne({
                $or: [{email}, {phone}]
            })

            if( userExistAsStudent )
                throw new ApiError(400, "User is already registered as student !!");

            if( userExistAsTutor )
                throw new ApiError(400, "User is already registered as instructor !!")

             const newTutor= new Instructor(
                {
                    email: this.email,
                    phone: this.phone,
                    fullName: this.fullName,
                    password: this.password
                }
             )

             await newTutor.save();

             return res
             .status(201)
             .json(
                new ApiResponse(200, {email, phone, fullName}, "Instructor registered successfully !!")
             )

        } 
        else
        throw new ApiError(400, "Invalid role")

    }
)

const login = asyncHandler(
    async( req, res ) => {

        const { email, phone, fullName, password}= req.body;

        if( ( email.trim() === "" && phone.trim() === "" ) || ( fullName.trim() === "" || password.trim() === "" ) )
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

            return res
            .status(200)
            .cookie("accessToken",  accessToken,  options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, 
                    { accessToken: accessToken, refreshToken: refreshToken},
                     "Student logged in successfully !!")
            )

        } else if( tutorExist ){

            const isPasswordMatch = tutorExist.isPasswordCorrect(password);

            if( !isPasswordMatch )
                throw new ApiError(400, "Incorrect password");

            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(tutorExist);

            return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken: accessToken, refreshToken: refreshToken},
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

        const instructor = req.instructor;
        const student    = req.student;

        if( instructor ) {

            const isPasswordMatch= await instructor.isPasswordCorrect(oldPassword);

            if( !isPasswordMatch)
                throw new ApiError(400, "Incorrect old password");

            instructor.password= newPassword;

            await instructor.save();

            return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Password changed successfully !!")
            )

        } else if( student ) {

            const isPasswordMatch = await student.isPasswordCorrect(oldPassword);

            if( !isPasswordMatch)
                throw new ApiError(400, "Incorrect old password");

            student.password= newPassword;

            return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Password changed successfully !!")
            )

        } else{
            throw new ApiError(400, "something went wrong !! user role is not defined ");
        }

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




export 
{
    register,
    login,
    changePassword,
    regenerateRefreshToken,
    forgetPassword
}











/*
const regenerateRefreshToken= async(req, res) => {
    
    const incomingRefreshToken= await req.cookie.refreshToken || req.header("Authorisation").replace("Bearer ", "");

    if( !incomingRefreshToken )
        throw new ApiError(400, "unauthorized request");

    try {
        
        const decodedInfo= jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )

        const student= await Student.findById(decodedInfo?._id)

        if( !student)
            throw new ApiError(401, "Invalid refresh token")
            
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
                
        } 

        const { accessToken, newRefreshToken}= await generateAccessAndRefreshToken(student);

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

}

const generateAccessAndRefreshToken= async(user) => {

    try {
       const refreshToken= user.generateRefreshToken();
       const accessToken= user.generateAccessToken();
    
       user.refreshToken= refreshToken;
       await user.save( { validateBeforeSave: false });
    
       return {refreshToken, accessToken};
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
  
  }

const logout= asyncHandler(
    async(req, res) => {
        
        const student= req.student;
        const stdId= student?._id;

        const updatedStudent= await Student.findByIdAndUpdate(
             req.student._id,
            {
                $unset: {
                    refreshToken: 1 // this will clear the refresh token stored in database
                }
            },
            {
                new: true
            }
        )

        return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logout successfully !!")
        )

    }
)

const changePassword= asyncHandler(
    async(req, res) => {

        const { oldPassword, newPassword } = req.body;
        
        const student= req.student;
        
        const match= await student.isPasswordCorrect( oldPassword );

        if( !match ) 
            throw new ApiError(400, "Password does not matched");

        student.password= newPassword

        await student.save({validateBeforeSave: false});

        return res 
        .status(201)
        .json(
            new ApiResponse(200, {}, "Password changed successfully !!")
        )
    }
)


const login= asyncHandler( async(req, res) => {

    // 1. fetch user data
    // 2. validate data
    // 3. user is already registered or not
    // 4. compare the password
    // 5. on success, validate user and authorise user
    // 6. return success

    const {email, password} = req.body;

    if( email.trim() === "" || password.trim() === ""  )
        throw new ApiError(400, "All fields are required");

    const existedUser = await Student.findOne({email});

    if( !existedUser)
        throw new ApiError(400, "User not exist");

    const match = await existedUser.isPasswordCorrect(password);

    if( !match)
        throw new ApiError(400, "Password is incorrect");

    const {refreshToken, accessToken}= await generateAccessAndRefreshToken(existedUser);

    const user= {
        email: existedUser?.email,
        fullName: existedUser?.fullName,
        bio: existedUser?.bio
    };

    return res.
    status(201)
    .cookie("access-token", accessToken, options)
    .cookie("refresh-token", refreshToken, options)
    .json(
        new ApiResponse(200, user, "User logged in successfully !!")
    )

}) 

const register = asyncHandler( async(req, res) => {

    // 1. fetch user data
    // 2. validate data
    // 3. check user is already register or not
    // 4. store user data
    // 5. return the data

    const { fullName, email, password }=  req.body;

    if( [ fullName, email, password].some( (field) => {
         field?.trim() === "" 
    }) )
        throw new ApiError(400, "All fields are required")


    const existedUser = await Student.findOne({email});

    if( existedUser ) {
        throw new ApiError(409, "User with email already exists");
    }


    const newStudent= await Student.create({
        fullName,
        email,
        password
    })

    const savedUser= await Student.findById(newStudent._id).select(
        "-password -refreshToken"
    )

    if( !savedUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, savedUser, "User created successfully ")
    )

})
*/