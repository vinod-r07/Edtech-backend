import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyCourseAccess= asyncHandler(
    async(req, _, next) => {
                
        const { courseId } = req.query;

        if( !courseId || courseId.trim() === "" )
            throw new ApiError(400, "Course id is required")

        if (!req.user.courses.includes(courseId)) {
          throw new ApiError(403, 
            req.user.role ==="Student" ? 
            "Student doesn't have access to this course" :
            "Instructor is not assigned to this course");
        }
        next();
    }
)

export {verifyCourseAccess}