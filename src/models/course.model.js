import mongoose, {Schema} from "mongoose";

const courseSchema= new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        description: {
                type: String,
                required: true
        },
        what_will_you_learn: [ String],
        content: [{
            type: Schema.Types.ObjectId,
            ref: "Section"
        }],
        rating: {
            Type: Number,
        },
        userRating: [
            {
                type: Schema.Types.ObjectId,
                ref: "UserReview"
            }
        ],
        benefits: [String],
        coupon: {
            type: String
        },
        students: [
            {
                type: Schema.Types.ObjectId,
                ref: "Student",
            }
        ],
        requirements: [String],
        instructor: {
            type: Schema.Types.ObjectId,
            ref: "Instructor"
        }

    },
    {
        timestamps: true
    }
)

export const Course= mongoose.model("Course", courseSchema);
