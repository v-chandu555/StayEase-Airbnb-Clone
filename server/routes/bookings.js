import { Router } from "express";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (!listingId || !checkIn || !checkOut || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || start < new Date(new Date().setHours(0,0,0,0))) {
      return res.status(400).json({ message: "Choose valid future check-in and check-out dates" });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Property not found" });
    const guestCount = Number(guests || 1);
    if (guestCount < 1 || guestCount > listing.maxGuests) return res.status(400).json({ message: `This property allows up to ${listing.maxGuests} guests` });
    if (String(listing.host) === String(req.user._id)) return res.status(400).json({ message: "You cannot book your own property" });
    const conflict = await Booking.findOne({
      listing: listingId, status: "confirmed",
      checkIn: { $lt: end }, checkOut: { $gt: start }
    });
    if (conflict) return res.status(409).json({ message: "Those dates are already booked. Please choose another date range." });
    const nights = Math.ceil((end - start) / 86400000);
    const booking = await Booking.create({ listing: listingId, guest: req.user._id, checkIn: start, checkOut: end, guests: guestCount, totalPrice: nights * listing.price });
    res.status(201).json({ booking });
  } catch (error) { next(error); }
});

router.get("/mine", auth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id }).populate({ path: "listing", populate: { path: "host", select: "name" } }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
});

router.get("/host", auth, async (req, res, next) => {
  try {
    const myListings = await Listing.find({ host: req.user._id }).select("_id");
    const bookings = await Booking.find({ listing: { $in: myListings.map(x => x._id) } }).populate("guest", "name email").populate("listing", "title location image").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
});

router.patch("/:id/cancel", auth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.checkIn <= new Date()) return res.status(400).json({ message: "A booking cannot be cancelled after check-in" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ booking });
  } catch (error) { next(error); }
});

export default router;
