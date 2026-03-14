import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  publishedYear?: number;
  isbn?: string;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverUrl: String,
    description: String,
    publishedYear: Number,
    isbn: String
  },
  { timestamps: true }
);

export const Book = mongoose.model<IBook>("Book", BookSchema);
