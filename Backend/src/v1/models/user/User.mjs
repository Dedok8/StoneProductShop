import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Name is required"],
    unique: [true, "Name is not allowed"],
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must be at most 50 characters long"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    // minlength: [6, 'Password must be at least 6 characters long'],
    // maxlength: [8, 'Password must be at most 8 characters long'],
    // validate: {
    //   validator: function (v) {
    //     return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    //       v
    //     )
    //   },
    //   message: (props) =>
    //     'Password must contain at least one letter, one number, and one special character',
    // },
  },
  email: {
    type: String,
    required: [true, "email is required"],
    // unique: [true, 'Name is not allowed'],
    // minlength: [3, 'Name must be at least 3 characters long'],
    // maxlength: [50, 'Name must be at most 50 characters long'],
    trim: true,
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "Type",
  },
});

//--- Хешування паролю перед збереженням ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.hash(this.password, salt);
  next();
});

//--- Функція для перевірки правильності пароля ---

userSchema.method.validPassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);

  return isMatch;
};

const User = mongoose.model("User", userSchema);
export default User;
