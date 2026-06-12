import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chat:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Chat",
    required:true
  },

  content:{
    type:String,
    required:true
  },

  role:{
    type:String,
    enum:["user","ai"],
    required:true
  },

  isImage:{
    type:Boolean,
    default:false
  },

  imageUrl:{
    type:String,
    default:null
  },

  prompt:{
    type:String,
    default:null
  },

  attachedImageUrl:{
    type:String,
    default:null
  }

},{timestamps:true});

const MessageModel = mongoose.model("message",MessageSchema);

export default MessageModel;