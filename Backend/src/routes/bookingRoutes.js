import { Router } from "express";
import { validateCreateBooking } from "../validation/bookingValidations.js";
import {
  createBooking,
  getBookingsByDate,
  getBookingById,
  deleteBooking
} from "../controllers/bookingController.js";

const router = Router();

router.post("/", validateCreateBooking, createBooking);
router.get("/", getBookingsByDate);
router.get("/:id", getBookingById);
router.delete("/:id", deleteBooking);

export default router;