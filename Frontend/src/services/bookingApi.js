import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/bookings";

export const getBookings = async (date) => {
  const response = await axios.get(`${API_BASE_URL}?date=${date}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await axios.post(API_BASE_URL, bookingData);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};
