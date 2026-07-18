import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: String,
  price: Number,
  description: String,
  tags: [String]
}, { timestamps: true });
export const Product = mongoose.model("Product", schema);
