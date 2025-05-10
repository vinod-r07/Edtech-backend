import mongoose, {Schema} from 'mongoose'

const userReviewSchema= new Schema(
    {
        userId: {
            type: String,
            unique: true
        },
        userName: {
            type: String,
            required: true,
        },
        userMessage: {
            type: String,
            required: true
        },
        userRating: {
            type: Number,
            required: true
        },
        dp: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const UserReview= mongoose.model("UserReview", userReviewSchema);