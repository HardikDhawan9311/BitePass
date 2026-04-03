import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AlertCircle, Upload, FileText, UploadCloud, FileSpreadsheet, X, Search, Calendar, Users, Activity, Mail, QrCode, Trash2, Power, Pencil, Plus } from "lucide-react";
import Navbar from "../Components/NavBar";
import QRScannerModal from "../Components/QRScannerModal";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { formatDate, formatTime } from "../utils/formatters";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [mealDays, setMealDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Tabs: "schedule", "participants", "logs"
  const [activeTab, setActiveTab] = useState("schedule");

  // Participants Tab (Import)
  const [file, setFile] = useState(null);

  // Logs Tab
  const [participants, setParticipants] = useState([]);
  const [groupedTeams, setGroupedTeams] = useState({});
  const [search, setSearch] = useState("");

  // Pagination State for Logs
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Toggle Status
  const [status, setStatus] = useState(1);

  // Scanner & Meal Picker State
  const [showScanner, setShowScanner] = useState(false);
  const [activeMeal, setActiveMeal] = useState(null);
  const [showMealPicker, setShowMealPicker] = useState(false);

  // Manual CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", team_name: "", check_in: "Yes" });

  // ✅ Fetch event + meals
  useEffect(() => {
    api.get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.event);
        setMealDays(res.data.meals);
        setLoading(false);
        if (res.data.event) setStatus(res.data.event.enabled);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [id]);

  // ✅ Fetch Logs
  const fetchLogs = async () => {
    try {
      const res = await api.get(`/participants/logs?event_id=${id}`);
      setParticipants(res.data);
      groupByTeam(res.data, search);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const groupByTeam = (data, searchTerm) => {
    const grouped = {};
    data.forEach((p) => {
      if (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.team_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        if (!grouped[p.team_name]) grouped[p.team_name] = [];
        grouped[p.team_name].push(p);
      }
    });
    setGroupedTeams(grouped);
  };

  useEffect(() => {
    if (activeTab === "logs" && participants.length === 0) fetchLogs();
  }, [activeTab, id]);

  useEffect(() => {
    groupByTeam(participants, search);
  }, [search, participants]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, participants]);

  const getBoxColor = (check_in, meals_eaten) => {
    if (check_in === "No" || check_in === 0) return "bg-gray-800 border-gray-700";
    if (meals_eaten > 0) return "bg-green-500 border-green-600 shadow-green-500/20";
    return "bg-red-500 border-red-600 shadow-red-500/20";
  };

  const totalEaten = participants.filter((p) => p.meals_eaten > 0).length;
  const totalNotEaten = participants.filter((p) => p.meals_eaten === 0).length;
  const checkedIn = participants.filter((p) => p.check_in === "Yes" || p.check_in === 1).length;

  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const sendEmail = async () => {
    const toastId = toast.loading("Processing emails...");
    try {
      const res = await api.post("/emails/send-all", { event_id: id });
      toast.success(res.data.message || "Emails processed successfully! 🚀", { id: toastId, duration: 5000 });
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to process request";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const toggleEvent = () => {
    api.put(`/events/${id}/toggle`)
      .then(() => {
        setStatus(status === 1 ? 0 : 1);
      })
      .catch((err) => console.error("Toggle Error:", err));
  };

  const deleteEvent = async () => {
    toast((t) => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-500/20 rounded-full shrink-0">
            <Trash2 className="text-red-400" size={24} />
          </div>
          <div>
            <p className="font-bold text-white text-lg">Delete Event</p>
            <p className="font-medium text-gray-400 text-sm leading-snug mt-1">
              Delete the event <span className="text-[#C77DFF] font-bold">{event.event_name}</span> and all its registered participants and scan logs? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading("Deleting event...", { style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              try {
                await api.delete(`/events/${id}`);
                toast.success("Event deleted successfully", { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
                navigate("/home");
              } catch (err) {
                toast.error(err.message, { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              }
            }}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/20 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all"
          >
            Yes, Wipe Event
          </button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', padding: '1.25rem', maxWidth: '400px' } });
  };

  const handleScanClick = () => {
    // Save all meals for the picker
    const allMeals = [];
    if (mealDays) {
      mealDays.forEach(day => {
        day.meals.forEach(meal => {
          allMeals.push({
            ...meal,
            date: day.date
          });
        });
      });
    }

    // If we already have a persistent active meal for THIS event, use it
    if (activeMeal && activeMeal.event_id === event.event_id) {
      setShowScanner(true);
      return;
    }

    // Otherwise try auto-detection
    const now = new Date();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const today = now.toISOString().split("T")[0];

    let currentMeal = null;
    allMeals.forEach(meal => {
      if (meal.date && meal.date.slice(0, 10) === today) {
        const [h1, m1, s1] = (meal.start_time || "00:00:00").split(":").map(Number);
        const [h2, m2, s2] = (meal.end_time || "23:59:59").split(":").map(Number);
        const start = h1 * 3600 + m1 * 60 + s1;
        const end = h2 * 3600 + m2 * 60 + s2;
        
        if (currentTime >= start && currentTime <= end) {
          currentMeal = meal;
        }
      }
    });

    if (currentMeal) {
      setActiveMeal({ ...currentMeal, event_id: event.event_id });
      setShowScanner(true);
    } else {
      setShowMealPicker(true);
    }
  };

  const handleDeleteParticipant = async (e, id, name) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-full shrink-0">
            <Trash2 className="text-red-400" size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-base">Delete Participant</p>
            <p className="font-medium text-gray-400 text-sm">Remove <span className="text-red-400">{name}</span> from the roster?</p>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
            Keep
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading("Deleting...", { style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              try {
                await api.delete(`/participants/${id}`);
                toast.success("Deleted successfully", { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
                fetchLogs();
              } catch (err) {
                toast.error("Failed to delete", { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              }
            }}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-105 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem', minWidth: '320px' } });
  };

  const handleDeleteTeam = async (team_name) => {
    toast((t) => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-full shrink-0">
            <Trash2 className="text-red-400" size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-base">Wipe Team</p>
            <p className="font-medium text-gray-400 text-sm">Delete <span className="text-red-400">{team_name}</span> entirely?</p>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading("Wiping team...", { style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              try {
                await api.delete(`/participants/event/${event.event_id}/team/${encodeURIComponent(team_name)}`);
                toast.success("Team wiped", { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
                fetchLogs();
              } catch (err) {
                toast.error("Failed to delete", { id: toastId, style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
              }
            }}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-105 transition-all"
          >
            Wipe Team
          </button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem', minWidth: '320px' } });
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding participant...");
    try {
      await api.post("/participants/add-manual", {
        event_id: event.event_id,
        ...newMember
      });
      toast.success("Participant added successfully!", { id: toastId });
      setShowAddModal(false);
      setNewMember({ name: "", email: "", team_name: "", check_in: "Yes" });
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add participant", { id: toastId });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }
    const formData = new FormData();
    formData.append("event_id", id);
    formData.append("file", file);
    const toastId = toast.loading("Uploading participants...");
    try {
      const response = await api.post("/participants/upload-excel", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { inserted = 0, errors = 0, duplicates = 0, message } = response.data;
      if (inserted === 0) {
        if (duplicates > 0 && errors === 0) {
          toast.error("Duplicate entries. No new ones added.", { id: toastId });
        } else {
          toast.error(message || "Failed to add participants.", { id: toastId });
        }
      } else {
        let successMsg = `${inserted} added successfully!`;
        if (duplicates > 0 || errors > 0) successMsg = `${inserted} added. ${duplicates} duplicates skipped. ${errors} errors.`;
        toast.success(successMsg, { id: toastId });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check the file.", { id: toastId });
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C77DFF]"></div></div>;
  if (!event) return <p className="text-gray-500 dark:text-gray-400 p-8 text-center mt-20 text-2xl font-bold">Event not found ❌</p>;

  const allDates = getDateRange(event.start_date, event.end_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white selection:bg-[#C77DFF]/30 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* HERO SECTION */}
        <div className="relative bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-3xl p-8 overflow-hidden shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#7F5AF0] rounded-full mix-blend-screen blur-[120px] opacity-10 dark:opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#C77DFF] rounded-full mix-blend-screen blur-[120px] opacity-10 dark:opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white to-gray-500 dark:to-gray-400">
                  {event.event_name}
                </h1>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${status === 1 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {status === 1 ? "Active" : "Disabled"}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar size={16} />
                {formatDate(event.start_date)} — {formatDate(event.end_date)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <button
                onClick={handleScanClick}
                className="flex-1 xl:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 text-white shadow-lg transition-all duration-300"
              >
                <QrCode size={16} />
                Scan QR
              </button>

              <Link
                to={`/schedule/edit/${event.event_id}`}
                className="flex-1 xl:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 transition-all duration-300"
              >
                <Pencil size={16} />
                Edit
              </Link>

              <button
                onClick={toggleEvent}
                className={`flex-1 xl:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  status === 1 ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                }`}
              >
                <Power size={16} />
                {status === 1 ? "Disable" : "Enable"}
              </button>

              <button
                onClick={sendEmail}
                className="flex-1 xl:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 transition-all duration-300"
                title="Send QR Emails"
              >
                <Mail size={16} />
                Emails
              </button>

              <button
                onClick={deleteEvent}
                className="flex-none flex items-center justify-center p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 transition-all duration-300"
                title="Delete Event"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {status === 0 && (
            <div className="mt-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
               <AlertCircle size={18} />
               <span className="text-sm">QR Scanning is currently suspended. Participants cannot check in.</span>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-4 overflow-x-auto custom-scrollbar">
          {[
            { id: "schedule", label: "Schedule", icon: Calendar },
            { id: "participants", label: "Participants", icon: Users },
            { id: "logs", label: "Live Logs", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] text-white shadow-lg shadow-[#7F5AF0]/20"
                  : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="text-[#C77DFF]" />
                Event Timetable
              </h2>

              <div className="mb-8">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">Select Date</label>
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                  {allDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl border transition-all duration-300 ${
                        selectedDate === date
                          ? "bg-[#C77DFF]/20 border-[#C77DFF] text-[#7F5AF0] dark:text-white"
                          : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="text-xs uppercase">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-xl font-bold">{new Date(date).getDate()}</span>
                      <span className="text-xs">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate ? (
                <div className="space-y-4">
                  {mealDays.some((d) => d.date.slice(0, 10) === selectedDate) ? (
                    mealDays
                      .filter((d) => d.date.slice(0, 10) === selectedDate)
                      .map((day) => (
                        <div key={day.date} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {day.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="group bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10 hover:border-[#C77DFF]/50 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-[#7F5AF0] rounded-full blur-[50px] opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500"></div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{meal.meal_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Activity size={14} className="text-[#C77DFF]" />
                                <span>{formatTime(meal.start_time)} - {formatTime(meal.end_time)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                      <Calendar className="mx-auto text-gray-400 dark:text-gray-600 mb-3" size={32} />
                      <p className="text-gray-500 dark:text-gray-400">No activities scheduled for this date.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 dark:text-gray-400">Select a date above to view the schedule.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: PARTICIPANTS */}
        {activeTab === "participants" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileSpreadsheet className="text-[#7F5AF0]" />
                    Import Roster
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Upload an Excel registry for bulk participant creation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-white/20 rounded-3xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#7F5AF0]/50 transition-all duration-300 group">
                  <UploadCloud className="text-gray-500 group-hover:text-[#C77DFF] mb-4 transition-colors" size={40} />
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white">Drag & drop your Excel file here</p>
                  <p className="text-xs text-gray-500 mt-2">Supports .xlsx and .xls formats</p>
                  <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </label>

                <div className="bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col justify-center gap-6">
                  {file ? (
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] rounded-xl shadow-lg">
                          <FileSpreadsheet className="text-white" size={24} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-white/5 border-dashed text-center flex flex-col items-center gap-2">
                       <FileText size={24} className="text-gray-600" />
                       <span className="text-gray-500 text-sm font-medium">Ready for selection</span>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                      file 
                      ? "bg-white text-black hover:scale-[1.02] hover:shadow-2xl active:scale-95" 
                      : "bg-white/5 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Upload size={18} />
                    Execute Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: LOGS */}
        {activeTab === "logs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* KPI GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Kpi title="Total Roster" value={participants.length} icon={Users} />
              <Kpi title="Checked In" value={checkedIn} icon={QrCode} color="text-blue-400" />
              <Kpi title="Meals Taken" value={totalEaten} icon={Activity} color="text-green-400" />
              <Kpi title="Missed Meals" value={totalNotEaten} icon={AlertCircle} color="text-red-400" />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col h-[600px]">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="text-[#C77DFF]" />
                  Live Activity Feed
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#7F5AF0]/20 hover:bg-[#7F5AF0]/40 border border-[#7F5AF0]/50 transition-all duration-300 text-sm font-semibold text-white shadow-lg"
                  >
                    <Plus size={16} />
                    Add Member
                  </button>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search participant or team..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C77DFF] focus:ring-1 focus:ring-[#C77DFF] outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {Object.keys(groupedTeams).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-2xl p-8">
                  <Search className="text-gray-600 mb-4" size={40} />
                  <p className="text-gray-400 font-medium text-lg">No results found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {Object.entries(groupedTeams)
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map(([team, members]) => (
                    <div key={team} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-200">{team}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full text-gray-300">
                            {members.length} members
                          </span>
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            className="p-1.5 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors"
                            title="Delete Team"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {members.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => navigate(`/participant/${m.id}`)}
                            className="group flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 border border-white/5 hover:border-white/20 hover:scale-105 transition-all duration-300 relative cursor-pointer shadow-md"
                          >
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${m.meals_eaten > 0 ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : (m.check_in === 1 || m.check_in === "Yes" ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")}`}></div>
                            
                            <span className="font-bold text-sm text-gray-200">{m.name}</span>
                            
                            <div className="flex gap-2 text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                              <span>In: {m.check_in === "Yes" || m.check_in === 1 ? "Yes" : "No"}</span>
                              <span>•</span>
                              <span>Meals: {m.meals_eaten}</span>
                            </div>

                            <button
                              onClick={(e) => handleDeleteParticipant(e, m.id, m.name)}
                              className="absolute -top-2 -right-2 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-red-500 transition-all shadow-xl z-20"
                              title="Delete Participant"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/10 shrink-0">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white outline-none focus:border-[#C77DFF] transition-colors"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span>teams</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Prev
                      </button>
                      <span className="text-sm text-gray-400 px-2">
                        Page {currentPage} of {Math.ceil(Object.keys(groupedTeams).length / itemsPerPage) || 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(Object.keys(groupedTeams).length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(Object.keys(groupedTeams).length / itemsPerPage) || Object.keys(groupedTeams).length === 0}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Meal Selection Modal */}
      {showMealPicker && event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMealPicker(false)}></div>
          <div className="relative bg-[#1a1a2e] border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Select Scan Session</h2>
            <div className="space-y-3">
              {mealDays.flatMap(d => d.meals.map(m => ({...m, date: d.date}))).length > 0 ? (
                mealDays.flatMap(d => d.meals.map(m => ({...m, date: d.date}))).map((meal) => (
                  <button
                    key={meal.meal_id}
                    onClick={() => {
                      setActiveMeal({ ...meal, event_id: event.event_id });
                      setShowMealPicker(false);
                      setShowScanner(true);
                    }}
                    className={`w-full p-4 rounded-2xl transition text-left flex flex-col ${
                      activeMeal?.meal_id === meal.meal_id ? "bg-[#7F5AF0] ring-2 ring-white text-white" : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold">{meal.meal_name}</span>
                      {activeMeal?.meal_id === meal.meal_id && <span className="text-[10px] bg-white text-[#7F5AF0] px-2 py-1 rounded-full font-bold">Active</span>}
                    </div>
                    <span className="text-xs opacity-60 mt-1">
                      {formatDate(meal.date)} | {formatTime(meal.start_time)} - {formatTime(meal.end_time)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm border border-dashed border-white/10 rounded-xl">No specific meals found</p>
              )}
              
              <button
                onClick={() => setShowMealPicker(false)}
                className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-[#1a1a2e] border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Team Name</label>
                <input required type="text" value={newMember.team_name} onChange={(e) => setNewMember({...newMember, team_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#C77DFF]" placeholder="Triton Labs" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input required type="text" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#C77DFF]" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input required type="email" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#C77DFF]" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Check In Status</label>
                <select value={newMember.check_in} onChange={(e) => setNewMember({...newMember, check_in: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#C77DFF]">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] text-white hover:opacity-90 transition shadow-lg">
                <Plus size={18} />
                Create Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          eventId={event.event_id}
          activeMeal={activeMeal}
          onChangeMeal={() => {
            setShowScanner(false);
            setShowMealPicker(true);
          }}
        />
      )}
    </div>
  );
}

function Kpi({ title, value, icon: Icon, color = "text-white" }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
         <Icon size={100} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white/5 ${color} bg-opacity-20`}>
          <Icon size={18} className={color !== "text-white" ? color : "text-gray-300"} />
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      </div>
      <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
