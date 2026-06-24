const parseDateString = (str) => {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const validSlots = [
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00",
  "18:00 - 18:30", "18:30 - 19:00", "19:00 - 19:30", "19:30 - 20:00", "20:00 - 20:30", "20:30 - 21:00"
];

export const validateCreateBooking = (req, res, next) => {
  const { bookingRef, bookingDate, slot, bookingDetails, blockBooking, blockUntil } = req.body;

  if (!bookingRef || !/^[a-zA-Z0-9]+$/.test(bookingRef)) {
    return res.status(400).json({ message: "Booking reference must be alphanumeric" });
  }

  if (!bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
    return res.status(400).json({ message: "Booking date must be in YYYY-MM-DD format" });
  }

  const bDate = parseDateString(bookingDate);
  if (isNaN(bDate.getTime())) {
    return res.status(400).json({ message: "Invalid booking date" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(today.getMonth() + 2);
  twoMonthsLater.setHours(23, 59, 59, 999);

  if (bDate < today || bDate > twoMonthsLater) {
    return res.status(400).json({ message: "Booking date must be within the next 2 months" });
  }

  if (!slot || !validSlots.includes(slot)) {
    return res.status(400).json({ message: "Invalid slot selection" });
  }

  if (!bookingDetails || bookingDetails.trim() === "") {
    return res.status(400).json({ message: "Booking details are required" });
  }

  if (bookingDetails.length > 250) {
    return res.status(400).json({ message: "Booking details cannot exceed 250 characters" });
  }

  if (blockBooking === true || blockBooking === "true") {
    if (!blockUntil || !/^\d{4}-\d{2}-\d{2}$/.test(blockUntil)) {
      return res.status(400).json({ message: "Block until date is required in YYYY-MM-DD format" });
    }

    const untilDate = parseDateString(blockUntil);
    if (isNaN(untilDate.getTime())) {
      return res.status(400).json({ message: "Invalid block until date" });
    }

    if (untilDate <= bDate) {
      return res.status(400).json({ message: "Block until date must be after the booking date" });
    }

    if (untilDate > twoMonthsLater) {
      return res.status(400).json({ message: "Block until date cannot exceed 2 months from today" });
    }
  }

  next();
};
