import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { getToken, user, image_base_url } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setBookings(data.bookings);
    } catch (err) {
      console.log("Error fetching bookings:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    const checkStripeRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get("bookingId");

      if (bookingId) {
        // Verify payment for this booking first
        try {
          await axios.get(`/api/booking/verify-payment/${bookingId}`);
        } catch (err) {
          console.log("Error verifying payment:", err);
        }
        // Remove bookingId from URL to prevent loop
        window.history.replaceState(null, "", window.location.pathname);
      }

      await fetchBookings(); // fetch bookings after payment verification
    };

    checkStripeRedirect();
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length > 0 ? (
        bookings.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt={item.show.movie.title}
                className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.show.movie.title}</p>
                <p className="text-gray-400 text-sm">
                  {timeFormat(item.show.movie.runtime)}
                </p>
                <p className="text-gray-400">
                  {dateFormat(item.show.showDateTime)}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {item.amount}
                </p>
                {!item.isPaid && item.paymentLink && (
                  <button
                    onClick={() => (window.location.href = item.paymentLink)}
                    className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary-dull transition"
                  >
                    Pay Now
                  </button>
                )}
              </div>
              <div className="text-sm">
                <p>
                  <span className="text-gray-400">Total Tickets: </span>
                  {item.bookedSeats.length}
                </p>
                <p>
                  <span className="text-gray-400">Seat Number: </span>
                  {item.bookedSeats.join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold text-center">No Bookings Found</h2>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
