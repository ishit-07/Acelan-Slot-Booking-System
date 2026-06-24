import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBookings, createBooking, deleteBooking, getBookingById } from "./services/bookingApi";

const BookingModal = lazy(() => import("./components/BookingModal"));

const generateSlotsForPeriod = (startHour, endHour) => {
  const slots = [];
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const next = new Date(current.getTime() + 30 * 60 * 1000);
    const formatTime = (d) => {
      return d.toTimeString().substring(0, 5);
    };
    slots.push(`${formatTime(current)} - ${formatTime(next)}`);
    current = next;
  }
  return slots;
};

const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeDetails, setActiveDetails] = useState(null);

  const slots = useMemo(() => {
    return [
      ...generateSlotsForPeriod(9, 12),
      ...generateSlotsForPeriod(18, 21)
    ];
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchBookings = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const dateStr = formatDateString(selectedDate);
      const data = await getBookings(dateStr);
      setBookedSlots(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to fetch bookings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleBook = async (payload) => {
    setIsSubmitting(true);
    try {
      await createBooking(payload);
      showToast("Booking created successfully!");
      setModalOpen(false);
      setSelectedSlot(null);
      await fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Booking failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id) => {
    setIsLoading(true);
    try {
      const data = await getBookingById(id);
      setActiveDetails(data);
      setDetailsModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load booking details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    setIsLoading(true);
    try {
      await deleteBooking(id);
      showToast("Booking deleted successfully!");
      await fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete booking", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(minDate.getMonth() + 2);

  const isBooked = (slotStr) => bookedSlots.some((b) => b.slot === slotStr);
  const morningSlots = slots.filter((s) => s.startsWith("09") || s.startsWith("10") || s.startsWith("11"));
  const eveningSlots = slots.filter((s) => s.startsWith("18") || s.startsWith("19") || s.startsWith("20"));

  const renderSlotButton = (slotStr) => {
    const booked = isBooked(slotStr);
    const selected = selectedSlot === slotStr;

    const buttonClass = booked
      ? "bg-red-500 text-white cursor-not-allowed border border-red-600 py-3 px-4 rounded text-center shadow-sm w-full"
      : selected
      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer py-3 px-4 rounded text-center font-semibold shadow-md w-full transition duration-150"
      : "bg-green-600 text-white hover:bg-green-700 cursor-pointer py-3 px-4 rounded text-center font-semibold shadow-sm w-full transition duration-150";

    return (
      <button
        key={slotStr}
        type="button"
        disabled={booked}
        onClick={() => handleSlotSelect(slotStr)}
        className={buttonClass}
      >
        <div className="text-sm font-bold">{slotStr}</div>
        {booked && <div className="text-xs mt-1 font-semibold uppercase tracking-wider">N/A</div>}
        {!booked && !selected && <div className="text-xs mt-1 font-normal opacity-90">Available</div>}
        {selected && <div className="text-xs mt-1 font-bold">Selected</div>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Slot Booking System</h1>
        </div>
      </header>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center space-x-2 transition duration-300 ${
          toast.type === "error" ? "bg-red-600 animate-pulse" : "bg-green-600"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 font-bold focus:outline-none">&times;</button>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
              <label className="text-sm font-semibold text-slate-700 mb-2">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={minDate}
                maxDate={maxDate}
                inline
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600 font-medium">Loading slots...</span>
              </div>
            )}

            {!isLoading && (
              <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <div>
                  <h3 className="text-md font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Morning Slots (09:00 AM - 12:00 PM)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {morningSlots.map(renderSlotButton)}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Evening Slots (06:00 PM - 09:00 PM)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {eveningSlots.map(renderSlotButton)}
                  </div>
                </div>
              </div>
            )}

            {!isLoading && bookedSlots.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2">Booked Slots Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {bookedSlots.map((b) => (
                        <tr key={b._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-700">{b.slot}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => handleViewDetails(b._id)}
                              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer bg-transparent border-0 outline-none"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              className="text-red-600 hover:text-red-800 font-medium cursor-pointer bg-transparent border-0 outline-none"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <BookingModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSlot(null);
          }}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onBook={handleBook}
          isSubmitting={isSubmitting}
        />
      </Suspense>

      {detailsModalOpen && activeDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Booking Details</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white hover:text-slate-300 font-bold focus:outline-none">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Reference</span>
                <span className="text-sm font-semibold text-slate-800">{activeDetails.bookingRef}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Date</span>
                <span className="text-sm font-semibold text-slate-800">{activeDetails.bookingDate}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Slot</span>
                <span className="text-sm font-semibold text-slate-800">{activeDetails.slot}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Details</span>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{activeDetails.bookingDetails}</p>
              </div>
              {activeDetails.blockBooking && (
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Recurring Booking</span>
                  <span className="text-sm text-slate-600">Blocked until: {activeDetails.blockUntil}</span>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
