import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Plus, 
  Save, 
  X, 
  ArrowLeft, 
  Utensils, 
  Clock, 
  ChevronRight, 
  ClipboardList, 
  CheckCircle2,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { formatDate, formatTime } from "../utils/formatters";

const normalizeDate = (d) => (typeof d === "string" ? d.slice(0, 10) : "");

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [mealDays, setMealDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [tempMeals, setTempMeals] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.event);
        setMealDays(res.data.meals || []);
      })
      .catch((err) => console.error("Fetch Error:", err));
  }, [id]);

  const getDateRange = (s, e) => {
    const d = [];
    let c = new Date(s);
    const l = new Date(e);
    while (c <= l) {
      d.push(c.toISOString().slice(0, 10));
      c.setDate(c.getDate() + 1);
    }
    return d;
  };

  const allDates = event ? getDateRange(event.start_date, event.end_date) : [];

  const getMealStatus = (dateStr, startTime, endTime) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    
    if (dateStr < todayStr) return { label: "Ended", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    if (dateStr > todayStr) return { label: "Upcoming", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    
    const start = new Date();
    start.setHours(startH, startM, 0);
    const end = new Date();
    end.setHours(endH, endM, 0);
    
    if (now >= start && now <= end) return { label: "Live Now", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (now < start) return { label: "Upcoming", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    return { label: "Expired", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const addMealRow = () => {
    const savedMealsCount = mealDays.find(d => normalizeDate(d.date) === selectedDate)?.meals.length || 0;
    if (tempMeals.length + savedMealsCount >= 5) {
      toast.error("Maximum 5 meals per day allowed.");
      return;
    }
    setTempMeals([...tempMeals, { meal_name: "", start_time: "", end_time: "" }]);
  };

  const handleMealChange = (i, f, v) => {
    const m = [...tempMeals];
    m[i][f] = v;
    setTempMeals(m);
  };

  const saveMeals = async () => {
    // Combine saved meals and temp meals
    const existingMeals = mealDays.find(d => normalizeDate(d.date) === selectedDate)?.meals || [];
    const combinedMeals = [...existingMeals, ...tempMeals];

    if (combinedMeals.length > 5) {
      toast.error("Maximum 5 meals per day allowed.");
      return;
    }

    setIsSaving(true);

    try {
      await api.post(`/events/${id}/meals/saveAll`, { 
        date: selectedDate, 
        meals: combinedMeals 
      });

      toast.success("Schedule synced successfully! 🍕");

      setTempMeals([]);
      // Refresh meal list
      const d = await api.get(`/events/${id}`);
      setMealDays(d.data.meals || []);
    } catch (error) {
      console.error("Error saving meals:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMeal = async (m) => {
    if (window.confirm(`Delete ${m.meal_name}?`)) {
      const dayData = mealDays.find(d => normalizeDate(d.date) === selectedDate);
      if (!dayData) return;

      const updatedDayMeals = dayData.meals.filter(meal => meal.meal_id !== m.meal_id);
      
      try {
        await api.post(`/events/${id}/meals/saveAll`, { 
          date: selectedDate, 
          meals: updatedDayMeals 
        });

        toast.success("Meal deleted successfully.");
        // Refresh meal list
        const d = await api.get(`/events/${id}`);
        setMealDays(d.data.meals || []);
      } catch (error) {
        console.error("Error deleting meal:", error);
        toast.error("An error occurred while deleting the meal.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-6xl mx-auto w-full px-6 py-12"
      >
        {/* TOP NAV BAR */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 text-sm font-medium text-[#C77DFF] bg-[#C77DFF]/10 px-4 py-2 rounded-full border border-[#C77DFF]/20">
            <CheckCircle2 size={16} />
            Auto-sync Enabled
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F5AF0]/20 text-[#7F5AF0] text-xs font-bold border border-[#7F5AF0]/30 mb-4 uppercase tracking-widest">
            Configuration Mode
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white via-gray-800 dark:via-white to-gray-500">
            Configure <span className="text-[#C77DFF]">{event?.event_name || "Event"}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
            Design and schedule daily meals for your participants. Select a date to start organizing the food schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: DATE SELECTOR & ADD MEALS */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="bg-white dark:bg-[#1A1625]/60 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7F5AF0]/5 dark:bg-[#7F5AF0]/10 blur-[80px] group-hover:bg-[#7F5AF0]/10 dark:group-hover:bg-[#7F5AF0]/20 transition-all" />
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-bold">
                    <Calendar size={20} className="text-[#7F5AF0]" />
                    Select Schedule Date
                  </div>
                  <div className="relative group/select">
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setTempMeals([]);
                      }}
                      className="w-full bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-6 py-4 rounded-2xl outline-none border border-gray-200 dark:border-white/10 focus:border-[#7F5AF0]/50 transition-all appearance-none cursor-pointer text-lg font-medium"
                    >
                      <option value="" className="bg-white dark:bg-[#1A1625]">Choose a date...</option>
                      {allDates.map((d) => (
                        <option key={d} value={d} className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-white">
                          {formatDate(d)}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rotate-90" />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 pt-6 border-t border-white/5"
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Plus className="text-[#C77DFF]" size={20} />
                          Add Meal Rows
                        </h2>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{tempMeals.length}/5 meals</span>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {tempMeals.length === 0 && (
                          <div className="py-10 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <Utensils size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">Click "Add Meal" to start</p>
                          </div>
                        )}
                        {tempMeals.map((m, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl space-y-4 relative group/row hover:border-gray-200 dark:hover:border-white/20 transition-all"
                          >
                            <button 
                              onClick={() => {
                                const newMeals = [...tempMeals];
                                newMeals.splice(i, 1);
                                setTempMeals(newMeals);
                              }}
                              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover/row:opacity-100"
                            >
                              <X size={14} />
                            </button>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#7F5AF0]/20 text-[#7F5AF0] text-xs font-bold">
                                {i + 1}
                              </div>
                              <input
                                placeholder="Meal Name (e.g. Breakfast)"
                                className="flex-1 bg-transparent py-2 border-b border-gray-200 dark:border-white/10 focus:border-[#7F5AF0] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-white"
                                value={m.meal_name}
                                onChange={(e) => handleMealChange(i, "meal_name", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 ml-1">Starts At</span>
                                <input
                                  type="time"
                                  className="w-full bg-white/5 p-3 rounded-xl border border-white/5 outline-none [color-scheme:dark]"
                                  value={m.start_time}
                                  onChange={(e) => handleMealChange(i, "start_time", e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 ml-1">Ends At</span>
                                <input
                                  type="time"
                                  className="w-full bg-gray-100 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 outline-none [color-scheme:dark]"
                                  value={m.end_time}
                                  onChange={(e) => handleMealChange(i, "end_time", e.target.value)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={addMealRow}
                          disabled={tempMeals.length + (mealDays.find(d => normalizeDate(d.date) === selectedDate)?.meals.length || 0) >= 5}
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-white/5 text-gray-700 dark:text-white"
                        >
                          <Plus size={18} /> Add Meal Row
                        </button>

                        {tempMeals.length > 0 && (
                          <button
                            onClick={saveMeals}
                            disabled={isSaving}
                            className="flex-[1.5] flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] font-bold text-white shadow-lg shadow-[#7F5AF0]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Save size={18} /> Sync Schedule
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SAVED MEALS DASHBOARD */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8">
            <div className="bg-white dark:bg-[#1A1625]/40 backdrop-blur-3xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 shadow-xl dark:shadow-2xl min-h-[500px]">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#C77DFF]/10 rounded-2xl">
                    <ClipboardList className="text-[#C77DFF]" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Schedule</h2>
                    <p className="text-gray-500 text-sm">Review day-specific menu and timings</p>
                  </div>
                </div>
                {selectedDate && (
                  <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 dark:text-gray-400">
                    {selectedDate}
                  </div>
                )}
              </div>

              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center animate-float">
                    <Calendar size={40} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">No Date Selected</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Please pick a date from the selector to view or manage its meal schedule.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealDays.find((d) => normalizeDate(d.date) === selectedDate) ? (
                    mealDays
                      .find((d) => normalizeDate(d.date) === selectedDate)
                      .meals.map((m, i) => {
                        const status = getMealStatus(selectedDate, m.start_time, m.end_time);
                        return (
                          <motion.div
                            key={m.meal_id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative flex justify-between items-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-8 py-6 rounded-[1.5rem] hover:bg-gray-100 dark:hover:bg-white/10 hover:border-[#7F5AF0]/30 transition-all duration-300 overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#7F5AF0] focus-within:opacity-100 opacity-20 transition-opacity" />
                            
                            <div className="flex items-center gap-6">
                              <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl text-[#C77DFF] group-hover:scale-110 transition-transform">
                                <Utensils size={24} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xs uppercase tracking-widest text-[#7F5AF0] font-bold">Meal {i + 1}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#C77DFF] transition-colors">{m.meal_name}</h3>
                                <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                                  <Clock size={14} />
                                  <span>{formatTime(m.start_time)} – {formatTime(m.end_time)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                Synced
                              </div>
                              <button
                                onClick={() => deleteMeal(m)}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Meal"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center opacity-30">
                        <Utensils size={32} />
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 max-w-xs">There are no meals scheduled for this date yet. Use the tool on the left to add one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(127, 90, 240, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(127, 90, 240, 0.6);
        }
      `}</style>
    </div>
  );
}
