import mongoose, {Schema} from "mongoose";
import bcrypt, { genSalt } from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';

const instructorSchema= new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true, 
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true, 
        index: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    refreshToken: {
        type: String,
    },
    dp: {
        type: String,
    },
    bio: {
        type: String,
    },
    subject: {
        type: String
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    college: {
        type: String,
    },
    branch: {
            type: String,
    },
    refreshToken: {
        type: String
    },
    passingYear: {
        type: String
    }
    
},
{
    timestamps: true
}
)


instructorSchema.pre("save", async function(next) {
      if( !this.isModified("password") )
            return next();
    
        const salt= await genSalt(10);
        this.password= await bcrypt.hash(this.password, salt);
        return next();
})

instructorSchema.methods.isPasswordCorrect= async function(password)  {
    return await bcrypt.compare( this.password, password)
}


instructorSchema.methods.generateAccessToken= function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            phone: this.phone,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

instructorSchema.methods.generateRefreshToken= function() {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Instructor= mongoose.model("Instructor", instructorSchema);