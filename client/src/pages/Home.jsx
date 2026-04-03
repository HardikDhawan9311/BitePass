import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, CalendarDays, X, Calendar, Clock, ArrowRight, Trash2, Edit3, Plus, Type, Upload, FileText, Sun, Moon } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { formatDate } from "../utils/formatters";

export default function Home() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    event_name: "",
    start_date: "",
    end_date: "",
  });
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  const handleChange = (e) =>
    setEventData({ ...eventData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(eventData.start_date);
    const end = new Date(eventData.end_date);

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }


    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      await api.post("/events/create", eventData);
      toast.success("Event created successfully! 🎊");
      setShowEventForm(false);
      setEventData({ event_name: "", start_date: "", end_date: "" });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Server connection failed. Please try again.");
      console.error("Create event error:", err);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white transition-colors duration-500">
      <Navbar />

      <main className="flex-1 px-6 py-14 flex flex-col items-center text-center relative">
        {/* HERO */}
        <div className="transition-all duration-500 py-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
            Event <span className="text-[#C77DFF]">Management</span> 🎯
          </h1>
          <p className="max-w-xl mx-auto mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300 transition-colors">
            Create, schedule, and manage hackathon events seamlessly with our premium dashboard.
          </p>

          <button
            onClick={() => setShowEventForm(true)}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] font-bold text-white shadow-lg shadow-[#7F5AF0]/20 hover:scale-105 active:scale-95 transition-all flex gap-3 items-center mx-auto"
          >
            <Plus size={20} strokeWidth={3} />
            Create Event
          </button>
        </div>

        {/* FEATURES */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          {[
            { icon: Gift, title: "Event Creation", desc: "Design immersive experiences" },
            { icon: CalendarDays, title: "Scheduling", desc: "Manage timelines efficiently" },
            { icon: CalendarDays, title: "Real-time Sync", desc: "Database connected management" },
          ].map((f, i) => (
            <div
              key={i}
              className="group bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl dark:hover:bg-white/10 hover:border-[#7F5AF0]/30 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-[#7F5AF0]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <f.icon size={32} className="text-[#7F5AF0] dark:text-[#C77DFF]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {f.desc}. Secure and reliable hackathon management at your fingertips.
              </p>
            </div>
          ))}
        </div>

        {/* CREATE EVENT MODAL */}
        <AnimatePresence>
          {showEventForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowEventForm(false);
                  setError("");
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 overflow-hidden text-left transition-colors duration-500 bg-white/90 dark:bg-[#1A1625]/80 border border-gray-100 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_-12px_rgba(127,90,240,0.3)]"
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#7F5AF0]/20 blur-[100px]" />

                <div className="relative z-10">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3 overflow-hidden"
                      >
                        <div className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold flex items-center gap-3 transition-colors text-gray-900 dark:text-white">
                        <Plus className="p-2 bg-[#7F5AF0] rounded-xl text-white" size={40} />
                        Create New Event
                      </h2>
                      <p className="mt-1 transition-colors text-gray-500 dark:text-gray-400">Set up your next hackathon experience</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowEventForm(false);
                        setError("");
                      }}
                      className="p-2 rounded-full transition-all bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1 transition-colors text-gray-700 dark:text-gray-300">Event Title</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#7F5AF0] transition-colors">
                          <Type size={18} />
                        </div>
                        <input
                          name="event_name"
                          placeholder="e.g. Winter Hack 2024"
                          value={eventData.event_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-[#7F5AF0] focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1 transition-colors text-gray-700 dark:text-gray-300">Start Date</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#7F5AF0] transition-colors">
                            <Calendar size={18} />
                          </div>
                          <input
                            type="date"
                            name="start_date"
                            min={new Date().toISOString().split("T")[0]}
                            value={eventData.start_date}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-[#7F5AF0] outline-none transition-all bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1 transition-colors text-gray-700 dark:text-gray-300">End Date</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#7F5AF0] transition-colors">
                            <Calendar size={18} />
                          </div>
                          <input
                            type="date"
                            name="end_date"
                            min={eventData.start_date || new Date().toISOString().split("T")[0]}
                            value={eventData.end_date}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-[#7F5AF0] outline-none transition-all bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="flex-1 py-4 px-6 rounded-2xl border font-semibold transition-all active:scale-95 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button className="flex-[2] py-4 px-6 rounded-2xl bg-[#7F5AF0] hover:bg-[#6b4ae0] font-bold text-white shadow-lg shadow-[#7F5AF0]/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span>Launch Event</span>
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EVENTS LIST */}
        <div className="w-full max-w-6xl mt-24 mb-20 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-left">
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0F0C29] dark:from-white to-[#302B63] dark:to-gray-400 text-center md:text-left">
                📅 Upcoming Events
              </h2>
              <p className="mt-2 text-center md:text-left text-gray-600 dark:text-gray-400 transition-colors">Manage and monitor your hackathon activities</p>
            </div>
            <div className="h-1 flex-1 mx-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent hidden md:block" />
          </div>

          {events.length === 0 ? (
            <div className="py-20 rounded-3xl border flex flex-col items-center w-full transition-all duration-500 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <Calendar size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg text-gray-500 dark:text-gray-400">No events scheduled yet.</p>
              <button
                onClick={() => setShowEventForm(true)}
                className="mt-4 text-[#C77DFF] hover:underline"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {events
                .filter(e => {
                  const status = getEventStatus(e.start_date, e.end_date);
                  return status.label === "Live Now" || status.label === "Upcoming";
                })
                .map((e) => {
                  const status = getEventStatus(e.start_date, e.end_date);
                  return (
                    <div
                      key={e.event_id}
                      className="group relative backdrop-blur-2xl border rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 overflow-hidden text-left bg-white dark:bg-[#1A1625]/60 border-gray-100 dark:border-white/10 shadow-xl dark:shadow-2xl hover:border-[#7F5AF0]/50 hover:shadow-2xl"
                    >
                      {/* Decorative glow */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 blur-[100px] transition-all duration-500 bg-[#7F5AF0]/5 dark:bg-[#7F5AF0]/10 group-hover:bg-[#7F5AF0]/10 dark:group-hover:bg-[#7F5AF0]/20" />

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async (event) => {
                                event.stopPropagation();
                                toast((t) => (
                                  <div className="flex flex-col gap-4 w-full">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2.5 bg-red-500/20 rounded-full shrink-0">
                                        <Trash2 className="text-red-400" size={24} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">Delete Event</p>
                                        <p className="font-medium text-sm leading-snug mt-1 text-gray-500 dark:text-gray-400">
                                          Delete all data for <span className="text-[#C77DFF] font-bold">{e.event_name}</span>?
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-3 mt-2">
                                      <button onClick={() => toast.dismiss(t.id)} className="flex-1 px-4 py-2 rounded-xl text-sm font-bold transition bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10">
                                        Cancel
                                      </button>
                                      <button
                                        onClick={async () => {
                                          toast.dismiss(t.id);
                                          const toastId = toast.loading("Deleting event...");
                                          try {
                                            await api.delete(`/events/${e.event_id}`);
                                            toast.success("Event deleted", { id: toastId });
                                            fetchEvents();
                                          } catch (err) {
                                            toast.error(err.response?.data?.message || err.message, { id: toastId });
                                          }
                                        }}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/20 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ), { duration: Infinity, style: { borderRadius: '1.25rem', padding: '1.25rem', maxWidth: '400px' } });
                              }}
                              className="p-2.5 rounded-xl transition-all duration-300 opacity-60 group-hover:opacity-100 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                              title="Delete Event"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 line-clamp-1 transition-colors text-gray-900 dark:text-white group-hover:text-[#7F5AF0] dark:group-hover:text-[#C77DFF]">
                          {e.event_name}
                        </h3>

                        <div className="space-y-3 mb-8">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={16} className="mr-3 text-[#7F5AF0]" />
                            <span>{formatDate(e.start_date)} - {formatDate(e.end_date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <CalendarDays size={16} className="mr-3 text-[#7F5AF0]" />
                            <span>{Math.ceil((new Date(e.end_date) - new Date(e.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days Event</span>
                          </div>
                        </div>

                        <Link
                          to={`/schedule/${e.event_id}`}
                          className="w-full py-4 px-6 rounded-2xl border flex items-center justify-between group/btn hover:bg-[#7F5AF0] hover:border-[#7F5AF0] transition-all duration-300 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10"
                        >
                          <span className="font-semibold transition-colors group-hover/btn:text-white text-gray-600 dark:text-gray-300">Manage Event</span>
                          <ArrowRight size={20} className="text-[#C77DFF] group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
