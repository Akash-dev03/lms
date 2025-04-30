import dotenv from "dotenv";
import connectDB from "../database/db.js";
import seedData from "./seedData.js";

dotenv.config();

// Connect to MongoDB and run seeding
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    return seedData();
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  }); 