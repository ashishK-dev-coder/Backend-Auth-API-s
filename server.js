import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { limiter } from "./config/ratelimiter.js";
import helmet from "helmet";
import cors from "cors";

dotenv.config({
  path: "./.env",
});

const app = express();

// Ejs
app.set("view engine", "ejs");
app.set("views", "./views");

// * Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(helmet());
app.use(cors());
app.use(limiter);

// import routes
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";

// routes declaration
app.use("/api", userRoute);
app.use("/", authRoute);

// DB Connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 9998, () => {
      console.log(`Server is running is on PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
