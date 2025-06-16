import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Request, Response } from "express";
import cookieParser from "cookie-parser"
import All_Routes from "./Routes/All_Routes.js"
import cors from "cors";
const app = express();
const port = process.env.PORT || 9001;

// process.env.NODE_ENV === "production" ? process.env.PRODUCTION_FRONTEND_URL : process.env.LOCAL_FRONTEND_URL
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.PRODUCTION_FRONTEND_URL : process.env.LOCAL_FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Hello World!");
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
})
app.use("/api", All_Routes);

app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
})
