import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";
import { CalendarDays, Calendar, Clock, ArrowRight, Trash2, LayoutGrid, History, Upload, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { formatDate } from "../utils/formatters";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Fetch events error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59);

    if (now >= startDate && now <= endDate) return { label: "Live Now", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (now < startDate) return { label: "Upcoming", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    return { label: "Ended", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
  };

  const activeEvents = events.filter(e => {
    const status = getEventStatus(e.start_date, e.end_date);
    return status.label === "Live Now" || status.label === "Upcoming";
  });

  const pastEvents = events.filter(e => {
    const status = getEventStatus(e.start_date, e.end_date);
    return status.label === "Ended";
  });

  const EventCard = ({ e }) => {
    const status = getEventStatus(e.start_date, e.end_date);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white dark:bg-[#1A1625]/60 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#7F5AF0]/50 hover:shadow-2xl overflow-hidden text-left"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7F5AF0]/5 dark:bg-[#7F5AF0]/10 blur-[100px] group-hover:bg-[#7F5AF0]/10 dark:group-hover:bg-[#7F5AF0]/20 transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
              {status.label}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={async (event) => {
                  event.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this event? This will also delete all participants and meals.")) {
                    const toastId = toast.loading("Deleting event...");
                    try {
                      await api.delete(`/events/${e.event_id}`);
                      toast.success("Event deleted successfully", { id: toastId });
                      fetchEvents();
                    } catch (err) {
                      toast.error(err.message, { id: toastId });
                    }
                  }
                }}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-300 opacity-60 group-hover:opacity-100"
                title="Delete Event"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-[#7F5AF0] dark:group-hover:text-[#C77DFF] transition-colors">
            {e.event_name}
          </h3>

          <div className="space-y-3 mb-8">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Clock size={16} className="mr-3 text-[#7F5AF0]" />
              <span>{formatDate(e.start_date)} - {formatDate(e.end_date)}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <CalendarDays size={16} className="mr-3 text-[#7F5AF0]" />
              <span>{Math.ceil((new Date(e.end_date) - new Date(e.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days Event</span>
            </div>
          </div>

          <Link
            to={`/schedule/event/${e.event_id}`}
            className="w-full py-4 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between group/btn hover:bg-[#7F5AF0] hover:border-[#7F5AF0] transition-all duration-300"
          >
            <span className="font-semibold text-gray-600 dark:text-gray-300 group-hover/btn:text-white transition-colors">Manage Event</span>
            <ArrowRight size={20} className="text-[#C77DFF] group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 px-6 py-14 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white to-[#C77DFF]">
            Event Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            View and manage all your hackathon events, from upcoming highlights to past successes.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7F5AF0]"></div>
          </div>
        ) : (
          <>
            {/* ACTIVE EVENTS */}
            <section className="mb-20">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <LayoutGrid className="text-green-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold">Upcoming & Live Events</h2>
                <div className="h-px flex-1 bg-white/10 ml-4 hidden md:block" />
              </div>

              {activeEvents.length === 0 ? (
                <div className="py-20 bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-6">
                  <Calendar size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-medium tracking-wide">No active events found.</p>
                  <Link to="/home" className="mt-4 text-[#C77DFF] hover:underline font-semibold flex items-center gap-2">
                    Create an event <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeEvents.map(e => <EventCard key={e.event_id} e={e} />)}
                </div>
              )}
            </section>

            {/* PAST EVENTS */}
            <section className="mb-20">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <History className="text-blue-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200">Past Events</h2>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 ml-4 hidden md:block" />
              </div>

              {pastEvents.length === 0 ? (
                <div className="py-20 bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-6">
                  <History size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-medium tracking-wide">No past events recorded.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
                  {pastEvents.map(e => <EventCard key={e.event_id} e={e} />)}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
