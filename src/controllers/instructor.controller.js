import {asyncHandler} from "../utils/asyncHandler.js";
import {Instructor} from "../models/instructor.model.js"
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import {Course} from "../models/course.model.js";
import jwt from "jsonwebtoken";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerInstructor = asyncHandler( 
    async(req, res) => {

        // 1. get email, fullName and password
        // 2. validate details
        // 3. check instructor is already registered or not
        // 4. if not hash the password
        // 5. return the user

        
        const { email, phone, fullName, password } = req.body;   // 1. Fetching details

        // 2. validation
        if(
            [email, phone, fullName, password]
            .some(  (field) => field.trim() === "" )
        )
        throw new ApiError(400, "All fields are required")

        // 3. check instructor is already registered or not
        const teacher= await Instructor.findOne({
            
        })

        const student= await Student.findOne({
            $or: [ {email} , {phone} ]
        })

        if( teacher || student )
            throw new ApiError(400, "User is already registered")

        const instructor= new Instructor(
            {
                email: this.email,
                phone: this.phone,
                fullName: this.fullName,
                password: this.password
            }
        )

        const newInstructor= await instructor.save();

        if( !newInstructor)
            throw new ApiError(500, "Something went wrong !! instructor registraion failed")

        instructor.password= undefined;
 
        return res
        .status(201)
        .json(
            new ApiResponse(200, instructor, "Instructor registered successfully !!")
        )

    }
)

const getRevenue = asyncHandler(async (req, res) => {
    // 1. get user
    const user = req.user;
    
    // 2. find instructor with populated courses (assuming 'content' is the field for courses)
    // Note: Make sure your Instructor model has a 'content' field that references courses
    const instructor = await Instructor.findById(user._id)
        .populate({
            path: 'courses',
            select: 'students price title' // only populate these fields for efficiency
        })
        .exec();

    if (!instructor) {
        throw new ApiError(404, "Instructor not found");
    }

    // 3. calculate students and revenue for each course
    const data = instructor.courses.map(item => {
        console.log("items : ", item)
        return {
            courseId: item._id, // include course ID for reference
            students: item.students.length ,
            revenue: item.students.length * item.price ,
            price: item.price, // include price for reference,
            title: item.title
        }
    });

    // 4. calculate totals
    const totalStudents = data.reduce((sum, course) => sum + course.students, 0);
    const totalRevenue = data.reduce((sum, course) => sum + course.revenue, 0);

    return res.status(200).json(
        new ApiResponse(200, {
            courses: data,
            summary: {
                totalCourses: data.length,
                totalStudents,
                totalRevenue
            }
        }, "Revenue calculated successfully")
    );
});

export {
    registerInstructor,
    getRevenue
}