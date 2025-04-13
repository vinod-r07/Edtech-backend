import mongoose, {Schema} from "mongoose";

// Video schema (embedded document)
const videoSchema = new Schema({
    header: {
        type: String,
        required: false, // Allowing empty strings as shown in your data
        trim: true
    },
    url: {
        type: String,
        required: false, // Allowing empty strings as shown in your data
        trim: true
    }
});

// Lecture schema
const lectureSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    videos: [videoSchema] // Array of video subdocuments
});

// Create the model
export const Lecture = mongoose.model('Lecture', lectureSchema);
