import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key   : process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary= async(localFilePath, resourceType= "auto") => {


    try {

        if( !localFilePath) return null;

        const response= await cloudinary.uploader.upload(localFilePath,  {
            resource_type: resourceType,
            fetch_format: 'auto',
            quality: 'auto',
        })

        //file is uploaded successfully 
        console.log("file is uploaded on cloudinary : ", response)

        // removed the locally stored file from user on server temperorily
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("error while uploading on cloudinary ", error)
        fs.unlinkSync(localFilePath)
        return null;
    }

}

const deleteFromCloudinary= async(fileUrl) => {
    return ;
}

export {
    uploadOnCloudinary, 
    deleteFromCloudinary}