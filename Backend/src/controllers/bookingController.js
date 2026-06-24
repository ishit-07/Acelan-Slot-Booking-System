import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";

const parseDateString = (str) => {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createBooking = async (req, res) => {
  const { bookingRef, bookingDate, slot, bookingDetails, blockBooking, blockUntil } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingsToCreate = [];

    if (blockBooking === true || blockBooking === "true") {
      const start = parseDateString(bookingDate);
      const end = parseDateString(blockUntil);
      let current = new Date(start);

      while (current <= end) {
        bookingsToCreate.push({
          bookingRef,
          bookingDate: formatDateString(current),
          slot,
          bookingDetails,
          blockBooking: true,
          blockUntil
        });
        current.setDate(current.getDate() + 1);
      }
    } else {
      bookingsToCreate.push({
        bookingRef,
        bookingDate,
        slot,
        bookingDetails,
        blockBooking: false,
        blockUntil: null
      });
    }

    const createdBookings = [];
    for (const item of bookingsToCreate) {
      const existing = await Booking.findOne({
        bookingDate: item.bookingDate,
        slot: item.slot
      }).session(session);

      if (existing) {
        throw new Error(`Slot is already booked on ${item.bookingDate}`);
      }

      const [newBooking] = await Booking.create([item], { session });
      createdBookings.push(newBooking);
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(createdBookings);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(409).json({ message: "Slot already booked for this date and time" });
    }
    return res.status(409).json({ message: error.message });
  }
};

export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }
    const bookings = await Booking.find({ bookingDate: date }).select("slot _id");
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Booking.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};