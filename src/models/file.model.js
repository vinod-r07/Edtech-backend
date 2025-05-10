import mongoose, {Schema} from "mongoose";

const fileSchema= new Schema({
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
    }
})

export const File= mongoose.model('File', fileSchema);