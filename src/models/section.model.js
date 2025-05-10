import mongoose, {Schema} from "mongoose";



// Lecture schema
const sectionSchema = new Schema({
   title: {
        type: String,
        required: true,
        trim: true
    },
    files: [{
        type: Schema.Types.ObjectId,
        ref: "File"
    }] // Array of video subdocuments
});

// Create the model
export const Section = mongoose.model('Section', sectionSchema);
