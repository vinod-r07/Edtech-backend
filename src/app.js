import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express();

// CORS
app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true
  }));

  
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
import categoryRouter from './routes/category.router.js';
import userRouter from "./routes/user.router.js"

// routing
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/cat", categoryRouter);
app.use("/api/v1/auth", authRouter); 
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/instructor', instructorRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/user', userRouter);

export {app}