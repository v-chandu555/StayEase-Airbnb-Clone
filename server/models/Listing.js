import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, default: "Amazing views" },
  price: { type: Number, required: true, min: 1 },
  maxGuests: { type: Number, default: 2, min: 1 },
  image: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Listing", listingSchema);
