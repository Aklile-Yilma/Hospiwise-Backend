// db.js
import mongoose from "mongoose";

// Replace with your MongoDB Atlas connection string
const mongoURI = process.env.MONGODB_URL

if(mongoURI === undefined) {
  throw new Error("MONGODB_URL is not defined");
}

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {});
    console.log('MongoDB connected');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
