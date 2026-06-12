import mongoose from "mongoose";

async function connecttoDB(){
  try{
     await mongoose.connect(process.env.MONGO_URL);
     console.log("connect to DB"); 
  }
  catch(err){
    console.error("Database connection error:", err);
  }
}

export default connecttoDB;