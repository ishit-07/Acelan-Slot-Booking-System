import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    bookingDate: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    blockBooking: {
      type: Boolean,
      default: false,
    },
    blockUntil: {
      type: String,
      default: null,
    },
    bookingDetails: {
      type: String,
      required: true,
      maxLength: 250,
    },
  },
  {
    timestamps: true,
  },
);

BookingSchema.index({ bookingDate: 1, slot: 1 }, { unique: true });

export const Booking = mongoose.model("Booking", BookingSchema);
