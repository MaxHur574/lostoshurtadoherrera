import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id:     { type: String,  required: true, unique: true }, // sub del token Auth0
  username:    { type: String,  default: null, unique: true, sparse: true, trim: true },
  usernameSet: { type: Boolean, default: false },
  email:       { type: String,  default: "" },
  createdAt:   { type: Date,    default: Date.now },
});

export default mongoose.model("User", userSchema);