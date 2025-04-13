import mongoose, {Schema} from "mongoose";

const catalogSchema= new Schema(
    {
        category: {
            type: String,
        },
        similarCategory: [
            {
                type: String
            }
        ],
    }
)

export const Catalog= mongoose.model("Catalog", catalogSchema);