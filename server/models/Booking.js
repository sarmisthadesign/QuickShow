import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true, ref: "User" },
  show: { type: String, required: true, ref: "Show" },
  bookedSeats: { type: Array, required: true },
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paymentLink: { type: String, default: "" },
  paymentSessionId: { type: String, default: "" }, // NEW
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
