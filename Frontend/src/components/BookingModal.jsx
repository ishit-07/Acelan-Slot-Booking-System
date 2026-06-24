import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BookingModal = ({ isOpen, onClose, selectedDate, selectedSlot, onBook, isSubmitting }) => {
  const [formData, setFormData] = useState({
    bookingRef: "",
    bookingDetails: "",
    blockBooking: false,
    blockUntil: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bookingRef: "",
        bookingDetails: "",
        blockBooking: false,
        blockUntil: null
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      blockUntil: date
    }));
    if (errors.blockUntil) {
      setErrors((prev) => ({ ...prev, blockUntil: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tempErrors = {};
    if (!formData.bookingRef.trim()) {
      tempErrors.bookingRef = "Booking Reference is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.bookingRef)) {
      tempErrors.bookingRef = "Alphanumeric characters only & No spaces";
    }

    if (!formData.bookingDetails.trim()) {
      tempErrors.bookingDetails = "Booking details are required";
    } else if (formData.bookingDetails.length > 250) {
      tempErrors.bookingDetails = "Booking details cannot exceed 250 characters";
    }

    if (formData.blockBooking) {
      if (!formData.blockUntil) {
        tempErrors.blockUntil = "Block until date is required";
      } else {
        const untilDate = new Date(formData.blockUntil);
        const selDate = new Date(selectedDate);
        selDate.setHours(0, 0, 0, 0);
        untilDate.setHours(0, 0, 0, 0);

        const maxLimit = new Date();
        maxLimit.setMonth(maxLimit.getMonth() + 2);
        maxLimit.setHours(23, 59, 59, 999);

        if (untilDate <= selDate) {
          tempErrors.blockUntil = "Block until date must be after selected booking date";
        } else if (untilDate > maxLimit) {
          tempErrors.blockUntil = "Block until date cannot exceed 2 months from today";
        }
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    const payload = {
      bookingRef: formData.bookingRef,
      bookingDate: formatDate(selectedDate),
      slot: selectedSlot,
      bookingDetails: formData.bookingDetails,
      blockBooking: formData.blockBooking,
      blockUntil: formData.blockBooking ? formatDate(formData.blockUntil) : null
    };

    onBook(payload);
  };

  const minBlockUntil = new Date(selectedDate);
  minBlockUntil.setDate(minBlockUntil.getDate() + 1);

  const maxBlockUntil = new Date();
  maxBlockUntil.setMonth(maxBlockUntil.getMonth() + 2);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Booking Details</h2>
          <button onClick={onClose} className="text-white hover:text-slate-300 font-bold focus:outline-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Booking Reference</label>
            <input
              type="text"
              name="bookingRef"
              value={formData.bookingRef}
              onChange={handleChange}
              placeholder="e.g. TH213"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.bookingRef ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200"
              }`}
            />
            {errors.bookingRef && <p className="text-red-500 text-xs mt-1">{errors.bookingRef}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Booking Date</label>
            <input
              type="text"
              readOnly
              value={formatDate(selectedDate)}
              className="w-full bg-slate-100 border border-slate-300 text-slate-600 rounded px-3 py-2 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Booking Slot</label>
            <input
              type="text"
              readOnly
              value={selectedSlot || ""}
              className="w-full bg-slate-100 border border-slate-300 text-slate-600 rounded px-3 py-2 cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-slate-700">Booking Details</label>
              <span className="text-xs text-slate-500">{formData.bookingDetails.length}/250 characters</span>
            </div>
            <textarea
              name="bookingDetails"
              value={formData.bookingDetails}
              onChange={handleChange}
              rows="3"
              placeholder="Provide context or details about the booking..."
              maxLength="250"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.bookingDetails ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200"
              }`}
            />
            {errors.bookingDetails && <p className="text-red-500 text-xs mt-1">{errors.bookingDetails}</p>}
          </div>

          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="blockBooking"
              name="blockBooking"
              checked={formData.blockBooking}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="blockBooking" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
              Block Booking
            </label>
          </div>

          {formData.blockBooking && (
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Block Until</label>
              <DatePicker
                selected={formData.blockUntil}
                onChange={handleDateChange}
                minDate={minBlockUntil}
                maxDate={maxBlockUntil}
                placeholderText="Select date to block until"
                className={`w-full bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.blockUntil ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200"
                }`}
              />
              {errors.blockUntil && <p className="text-red-500 text-xs mt-1">{errors.blockUntil}</p>}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
