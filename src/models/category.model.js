import mongoose, {Schema} from "mongoose";

const catalogSchema= new Schema(
    {
        category: {
            type: String,
        },
        content: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course",
            }
        ],
        similarCategory: [
            {
                type: String
            }
        ],
    },
    
)

export const Category= mongoose.model("Category", catalogSchema);