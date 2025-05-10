import { app } from "./app.js";
import dbConnect from "./db/database.js";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})


dbConnect()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

const catalog= [
    {
        id: 1,
        title: "Web Development"
    },
    {
        id: 2,
        title: "App Development"
    }
]

app.get("/", (req, res) => {
    return res.status(200).json(
        catalog,
        "Good"
    )
})




