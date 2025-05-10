import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Instructor } from "../models/instructor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const updateDp= asyncHandler(
    async(req, res) => {

        // 1. find user and it's previous dp
        const user= req.user;
        const dp= user?.dp;

        // 2. fetch dp from server
        console.log("user dp : ", req.file?.path)
        const imagePath= req.file?.path;

        if( !imagePath)
            throw new ApiError(400, "Image is required")

        // 3. upload dp on cloudinary
        const response= await uploadOnCloudinary(imagePath);

        if( !response)
            throw new ApiError("Something went wrong")

        // 4. upload image a/c to role
        if( user.role === "Student" ){
            await Student.findByIdAndUpdate(user?._id, {
                $set: {dp: response.url }
            })
        }
        else if( user.role === "Instructor"){
            await Instructor.findByIdAndUpdate(user?._id, {
                $set: { dp: response.url}
            })
        }

        // 5. delete previous dp
        if( dp) {
            await deleteFromCloudinary(dp)
        }

        // 7. return response
        return res
        .status(200)
        .json(
            new ApiResponse(200, response.url, "Profile dp updated successfully !!")
        )
    }
)

const updateProfile= asyncHandler(
    async(req, res) => {

        const { fullName, bio, college, branch, passingYear } = req.body;
    
        // 3. Get authenticated user
        const user = req.user;
    
            // 4. Update based on role
            if (user.role === "Student") {
                await Student.findByIdAndUpdate(
                    user._id,
                    {
                        $set: {
                            fullName,
                            bio, 
                            branch, 
                            college, 
                            passingYear
                        }
                    },
                    { new: true, runValidators: true }
                );
            } 
            else if (user.role === "Instructor") {
                await Instructor.findByIdAndUpdate(
                    user._id,
                    {
                        $set: {
                            fullName,
                            bio,
                            branch,
                            college,
                            passingYear
                        }
                    },
                    { new: true, runValidators: true }
                );
            } else {
                throw new ApiError(400, "Invalid user role");
            }
    
            // 5. Return success response
            return res.status(200).json(
                new ApiResponse(200, {}, "Profile updated successfully")
            );
    
    }
)

export{
    updateDp,
    updateProfile
}