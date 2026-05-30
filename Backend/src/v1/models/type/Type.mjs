import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  title: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must be at most 50 characters long"],
    trim: true,
  },
  role: {
    type: String,
    required: [true, "Role identifier is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
});

const Type = mongoose.model("Type", userSchema);
export default Type;
