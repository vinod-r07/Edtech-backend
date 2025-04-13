import {asyncHandler} from "../utils/asyncHandler.js";
import Instructor from "../models/instructor.model.js"
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
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

export {
    registerInstructor
}