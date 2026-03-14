import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClub extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  currentBook?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

   pinnedMessage?: {
    content: string;
    user: Types.ObjectId;
    createdAt: Date;
  } | null;
}

const ClubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    currentBook: { type: Schema.Types.ObjectId, ref: "Book" },

    pinnedMessage: {
      type: {
        content: { type: String },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date }
      },
      default: null
    }
  },
  { timestamps: true }
);

// 👇 IMPORTANT: named export (not default)
export const Club = mongoose.model<IClub>("Club", ClubSchema);
