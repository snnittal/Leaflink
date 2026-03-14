import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  user: Types.ObjectId;
  book: Types.ObjectId;
  content: string;
  rating?: number;
  likes: Types.ObjectId[];
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    content: { type: String, required: true },
    rating: Number,
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
