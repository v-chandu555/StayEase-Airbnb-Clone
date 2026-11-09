import { Router } from "express";
import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { location, category, guests } = req.query;
    const filter = {};
    if (location) filter.location = { $regex: location, $options: "i" };
    if (category && category !== "All stays") filter.category = category;
    if (guests) filter.maxGuests = { $gte: Number(guests) };
    const listings = await Listing.find(filter).populate("host", "name").sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("host", "name");
    if (!listing) return res.status(404).json({ message: "Property not found" });
    res.json({ listing });
  } catch (error) { next(error); }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { title, location, description, category, price, maxGuests, image } = req.body;
    if (!title || !location || !description || !price || !image) return res.status(400).json({ message: "Please fill all required fields" });
    const listing = await Listing.create({ title, location, description, category, price: Number(price), maxGuests: Number(maxGuests || 2), image, host: req.user._id });
    res.status(201).json({ listing });
  } catch (error) { next(error); }
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Property not found" });
    if (String(listing.host) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own listings" });
    Object.assign(listing, req.body);
    await listing.save();
    res.json({ listing });
  } catch (error) { next(error); }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Property not found" });
    if (String(listing.host) !== String(req.user._id)) return res.status(403).json({ message: "You can only delete your own listings" });
    const activeBookings = await Booking.exists({ listing: listing._id, status: "confirmed", checkOut: { $gt: new Date() } });
    if (activeBookings) return res.status(400).json({ message: "This property has upcoming bookings and cannot be deleted yet" });
    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (error) { next(error); }
});

export default router;
