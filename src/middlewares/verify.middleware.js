import { Instructor } from "../models/instructor.model.js";
import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, _, next) => {
  // Extract token from cookies or Authorization header
  const token =
    req.cookies?.accessToken ||
    (req.headers["authorization"]?.startsWith("Bearer ") &&
      req.headers["authorization"].split(" ")[1]);

  if (!token) {
    throw new ApiError(401, "Access token required");
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check for Student or Instructor
    const user =
      (await Student.findById(decodedToken?.id)) ||
      (await Instructor.findById(decodedToken?.id));

    if (!user) {
      throw new ApiError(401, "User not found or invalid token");
    }

    // Attach user and role to request
    req.user = user;
    req.user.role = user instanceof Student ? "Student" : "Instructor";
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { verifyJwt };