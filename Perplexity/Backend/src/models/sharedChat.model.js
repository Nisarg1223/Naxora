import mongoose from "mongoose";

const sharedChatSchema = new mongoose.Schema(
  {
    originalChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
    },

    conversation: [
      {
        role: String,

        content: String,

        isImage: Boolean,

        imageUrl: String,

        prompt: String,

        attachedImageUrl: String,

        createdAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SharedChat", sharedChatSchema);