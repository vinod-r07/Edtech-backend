import mongoose, {Schema} from "mongoose";

const courseSchema= new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        catalog: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        discout: {
            type: Number
        },
        discount_expires_in: {
            type: Date,
        },
        description: [
            {
                type: String
            }
        ],
        details: {
            type: String,
            required: true,
        },
        subject: {
            type: String
        },
        what_will_you_learn: [
            {
                type: String,
            }
        ],
        content: {
            type: Schema.Types.ObjectId,
            ref: "Lecture"
        },
        rating: {
            Type: Number,
        },
        userRating: [
            {
                userName: {
                    type: String
                },
                userDp: {
                    type: String
                },
                rating: {
                    type: Number
                },
                message: {
                    Type: String
                }
            }
        ],
        benefits: [
            {
                type: String
            }
        ],
        coupon: {
            type: String
        },
        students: [
            {
                type: String
            }
        ],
        instructor: {
            type: Schema.Type.ObjectId,
            ref: "Instructor"
        }

    },
    {
        timestamps: true
    }
)

export const Course= mongoose.model("Course", courseSchema);