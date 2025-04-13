import mongoose, {Schema} from "mongoose";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema= new Schema(
    {
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
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        refreshToken: {
            type: String,
        },
        dp: {
            type: String,
        },
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course"
            },
        ],
        bio: {
            Type: String,
        },
        college: {
            Type: String,
        },
        branch: {
            type: String,
        },
        passingYear: {
            Type: Number
        }
    },
    {
        timestamps: true
    }
)

studentSchema.pre("save", async function(next)  {
    if( !this.isModified("password") )
        return next();

    const salt= await genSalt(10);
    this.password= await bcrypt.hash(this.password, salt);
    return next();

})  

studentSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.generateAccessToken= function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            fullName: this.fullName,
            phone: this.phone
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

studentSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Student= mongoose.model("Student", studentSchema);