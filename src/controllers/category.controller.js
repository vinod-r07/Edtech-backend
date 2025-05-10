import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { Instructor } from "../models/instructor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createCategory = asyncHandler( 
    async(req, res) => {

        const { category, similarCategory} = req.body;

        const cat= category.trim();

        if( category.trim() === "" )
            throw new ApiError(400, "Category is required !!");

        const existCategory = await Category.findOne({
            category: { $regex: new RegExp(`^${category}$`, "i") }
        })

        if( existCategory ) 
            throw new ApiError(400, "Category already exist !!")

        const newCategory= new Category(
            {
                category: cat,
                similarCategory,
                content: []
            }
        )

        await newCategory.save();

        return res.status(201).json(
            new ApiResponse(200, newCategory, "Category created successfully !! ")
        );
    }
)

const getCategories = asyncHandler(
    async(req, res) => {

        const { category } = req.body;

        if( !category)
            throw new ApiError(400, "Category is not defined !!");

        const details= await Category.findOne({
            category: { $regex: new RegExp(`^${category}$`, "i") }
        })

        if( !details) 
            throw new ApiError(400, "Category not found")

        return res.status(201).json(
            new ApiResponse(200, details, "Category result fetched successfully !!")
        )

    }
)

const getAllCategory = asyncHandler(
    async(req, res) => {

        const allCategory= await Category.find({})
        .populate({
            path: 'content', // Populate the 'content' field (Course)
            populate: {
                path: 'instructor', // Populate the 'Instructor' field within Course
                select: "fullName dp id"
            }
        })
        .lean()
        .exec();

        return res.status(201).json(
            new ApiResponse(200, allCategory, "All category data fetched successfully !!")
        )

    }
)

const addCourseToCategory = asyncHandler(async (req, res) => {
    
    // 1. fetch the values
    const {
        category, title, price,
         topics, benefits,
        description, requirements
    } = req.body;

   
    // 2. fetch the instructor
    const instructor= req.user;

    // 3. validate the instructor
    if( req.user.role !== "Instructor")
        throw new ApiError(401, "Authorization denied")

    // 4. parse the contents in string array format
    const contentTopic= topics.split(',');
    const benefitsOfStd= benefits.split(',');
    const rqr= requirements.split(',');

    // 5. fetch the image from server
    const imagePath = req.file?.path;
    if (!imagePath) {
        throw new ApiError(400, "Course image is required");
    }

    // 6. Upload image to Cloudinary
    const imageUrl = await uploadOnCloudinary(imagePath);


    //7. Create new course
    const newCourse = await Course.create({
        title,
        instructor: instructor._id,
        image: imageUrl.url,
        what_will_you_learn: contentTopic,
        benefits: benefitsOfStd,
        requirements: rqr,
        price,
        description,
        students: [],
        rating: 0,
        userRating: []
    });

    // 8. Find the category
    const cat = await Category.findOne({
        category: { $regex: new RegExp(`^${category}$`, "i") }
    });

    if( !cat) {
        throw new ApiError(400, "Invalid category")
    }

    // 9. push course id into category id
    await Category.findByIdAndUpdate(cat?._id, {
        $push: {content: newCourse._id}
    })
   
    // 10. push course id into instructor course
    await Instructor.findByIdAndUpdate(instructor?._id, {
        $push: { courses: newCourse._id}
    })

    // 11. return
    return res.status(201).json(
        new ApiResponse( 200,newCourse, "Course created successfully" )
    );
});

export {
    getCategories,
    createCategory,
    addCourseToCategory,
    getAllCategory
}