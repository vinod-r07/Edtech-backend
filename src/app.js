import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express();

const allowedOrigin= [
    `https://localhost:${process.env.PORT}`
]

// CORS
app.use( cors(
    {
        origin: function(origin, callback) {
            if( !origin) return callback(null, true);
            if( allowedOrigin.includes(origin) )  {
                return callback( null, true);
            } 
            else{
                throw new error("CORS policy violation: Origin not allowed")
            }
        },
        credentials: true
    }
) )

  
app.use( express.json());
app.use( express.urlencoded({ extended: true}) );
app.use( express.static("public"));
app.use( cookieParser());

// routes import
import studentRouter from "./routes/student.routes.js";
import adminRouter from "./routes/admin.router.js";
import courseRouter from './routes/course.router.js';
import instructorRouter from "./routes/instructor.router.js";
import authRouter from "./routes/auth.router.js";

// routing
app.use("/api/v1/student", studentRouter);
  



export {app}