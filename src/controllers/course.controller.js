import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Section } from "../models/section.model.js";
import { Course} from "../models/course.model.js";
 import {File} from "../models/file.model.js"
import { Student } from "../models/student.model.js";
import { Instructor } from "../models/instructor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { UserReview } from "../models/userReview.model.js";

const createSection= asyncHandler(
    async(req, res) => {

        const instructor= req.user;
        
        if( instructor.role !== "Instructor")
            throw new ApiError(400, "Invalid Authorization")

        const { courseId, section}= req.body;

        if( !courseId || courseId.trim() === "" )
            throw new ApiError(400, "All fields are required");

        if( !section || section.trim() === "" )
            throw new ApiError(400, "All fields are required");

        const newSection = await Section.create({
            title: section,
            files: []
        });
        
        await Course.findByIdAndUpdate(courseId, {
            $push: { content: newSection?._id }
        });

        return res
        .status(201)
        .json(
            new ApiResponse(200, newSection, "New section created successfully !!")
        );

    }
)

const uploadFile= asyncHandler( 
    async(req, res) => {

        // 1. check the role 
        const instructor= req.user;
        if( instructor.role !== "Instructor")
            throw new ApiError(400, "Invalid authorization")
        
        //2. fetch the details
        const { sectionId } = req.query;
        const { fileName, fileType} = req.body;

        // 3. validation
        if(
            [sectionId, fileName, fileType].some(
                field => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required with courseId and sectionId")
        }

        // 4. fetch localpath of the file from server
        const filePath= req.file?.path;

        if( !filePath)
            throw new ApiError(400,"File is required")

        // 5. upload it on cloudinary ( raw for pdf)
        const response= await uploadOnCloudinary(filePath, "raw");

        if( !response)
            throw new ApiError(400, "Something went wrong while uploading at cloudinary")

        // // 6. save the url in databse
        const newFileSaved= await File.create({
            fileName,
            fileType,
            fileUrl: response?.url,
            duration: response?.duration,
        })

        if ( !newFileSaved) {
            throw new ApiError(400, "Something went wrong")
        }

        // // 7. save the id in section of course
        await Section.findByIdAndUpdate(sectionId, {
            $push: { files: newFileSaved._id }
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, newFileSaved, "File uploaded successfully !!")
        )

    }
)

const getCourseInfo= asyncHandler(
    async(req, res) => {

        const {courseId}= req.query;
        if( !courseId)
            throw new ApiError(400, "courseId not found !!");

        const courseInfo = await Course.findById(courseId)
                            .populate([
                                    {
                                        path:"content",
                                        populate: {
                                                    path: "files"
                                                }},
                                    {
                                        path: "userRating"
                                    }
                                    ])
                                        .lean()
                                        .exec();  // Note: .exec() should come after .lean()

if (!courseInfo) {
  throw new ApiError(404, "Course not found");
}

return res.status(200).json(  // Changed from 201 to 200 for GET requests
  new ApiResponse(200, courseInfo, "Course info fetched successfully")
);

    }
        
)

const getCourseInfoPublic= asyncHandler(
    async(req, res) => {

        const {courseId}= req.query;

        if( !courseId)
            throw new ApiError(400, "courseId not found !!");

        const courseInfo = await Course.findById(courseId)
        .populate(
            [{
                path: "content",
                populate: {
                    path: "files",
                    select: "fileName fileType",
                },
            },{
                path: "userRating"
            }])
        .lean()
        .exec();

        const instructor= await Course.findById(courseId)
                                .populate({
                                    path: "instructor",
                                    select: "fullName _id dp"
                                })
                                .select("instructor")
                                .lean();
        courseInfo.instructor= instructor;

        if( !courseInfo)
            throw new ApiError(404, "Course not found");

        return res.status(200).json(
            new ApiResponse(200, courseInfo, "Course info fetched successfully !!")
        )

    }
)

const courseEnrollment= asyncHandler(
    async(req, res) => {

        const user= req.user;

        const {courseId}= req.body;

        console.log('req received')

        if( !courseId || courseId.trim() === "")
            throw new ApiError(400, "CourseId is required");

        const courseAlreadyPurchased= user?.courses.includes(courseId);
        if( courseAlreadyPurchased)
            throw new ApiError(400, "Student already purchased this course")

        await Student.findByIdAndUpdate(user._id, {
            $push: { courses: courseId}
        })

        await Course.findByIdAndUpdate(courseId,
            {
                $push: { students: user._id}
            }
        )
        
        console.log('request serve, sending response')

        return res.status(200).json(
            new ApiResponse(200, {}, "Student enroll in course successfully !!")
        )

    }
)

const addCourseReview= asyncHandler(
    async (req, res) => {
        const { courseId, rating, message } = req.body;
    
        // 1. Fix the validation logic
        if (!courseId || courseId.trim() === "" || !message || message.trim() === "") {
            throw new ApiError(400, "All fields are required");
        }
    
        // Validate rating is a number and within range
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be a number between 1 and 5");
        }
    
        const user = req.user;
    
        if (user.role === "Instructor") {
            throw new ApiError(400, "Instructor can't rate!!");
        }
    
        // 2. Create the review
        const newRating = await UserReview.create({
            userId: user._id,
            userName: user.fullName,
            dp: user?.dp,
            userRating: rating,
            userMessage: message,
        });
    
        if (!newRating) {
            throw new ApiError(500, "Something went wrong while creating review");
        }
    
        // 3. Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
    
        // 4. Update course rating
        let totalRating;
        let updatedUserRatings = [...(course.userRating || [])];
        updatedUserRatings.push(newRating._id);
    
        if (!course.userRating || course.userRating.length === 0) {
            totalRating = rating;
        } else {
            // Fix the calculation - sum all ratings and divide by count
            const currentTotal = course.rating * course.userRating.length;
            totalRating = (currentTotal + rating) / updatedUserRatings.length;
            totalRating = parseFloat(totalRating.toFixed(1)); // Ensure it's a number
        }
    
        // 5. Update the course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    rating: totalRating,
                    userRating: updatedUserRatings
                }
            },
            { new: true }
        );
    
        if (!updatedCourse) {
            throw new ApiError(500, "Failed to update course rating");
        }
    
        return res
            .status(200)
            .json(
                new ApiResponse(200, newRating, "Review added successfully")
            );
    }
)

export {
    uploadFile,
    createSection,
    getCourseInfo,
    getCourseInfoPublic,
    courseEnrollment,
    addCourseReview
}



