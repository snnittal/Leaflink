import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClubMessage extends Document {
  club: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  seenBy: Types.ObjectId[];
}

const ClubMessageSchema = new Schema(
  {
    club: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true },
);

export const ClubMessage = mongoose.model<IClubMessage>(
  "ClubMessage",
  ClubMessageSchema,
);
