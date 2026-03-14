import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" }
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
