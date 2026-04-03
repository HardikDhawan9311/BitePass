import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, XCircle, Info, Calendar } from "lucide-react";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { formatDate, formatTime } from "../utils/formatters";

export default function ParticipantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [mealSchedule, setMealSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMeals, setFetchingMeals] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
  const [togglingMealId, setTogglingMealId] = useState(null);

  useEffect(() => {
    fetchParticipantDetails();
  }, [id]);

  const fetchParticipantDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/participants/${id}`);
      setParticipant(res.data);
      fetchTeamMembers(res.data.event_id, res.data.team_name);
      fetchMealSchedule();
    } catch (err) {
      console.error("Failed to fetch participant details:", err);
      toast.error("An error occurred while fetching details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (eventId, teamName) => {
    try {
      const res = await api.get(`/participants/event/${eventId}/team/${encodeURIComponent(teamName)}`);
      setTeamMembers(res.data.filter(m => m.id.toString() !== id.toString()));
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
  };

  const fetchMealSchedule = async () => {
    try {
      setFetchingMeals(true);
      const res = await api.get(`/participants/${id}/meals`);
      setMealSchedule(res.data);
    } catch (err) {
      console.error("Failed to fetch meal schedule:", err);
    } finally {
      setFetchingMeals(false);
    }
  };

  const handleToggleMeal = async (mealId) => {
    try {
      setTogglingMealId(mealId);
      const res = await api.post(`/participants/${id}/toggle-meal/${mealId}`);
      toast.success(res.data.message);
      fetchMealSchedule();
      const pRes = await api.get(`/participants/${id}`);
      setParticipant(pRes.data);
    } catch (err) {
      console.error("Toggle meal error:", err);
      toast.error("An error occurred");
    } finally {
      setTogglingMealId(null);
    }
  };

  const handleSendMail = async () => {
    try {
      setSendingMail(true);
      const toastId = toast.loading("Sending Meal Pass PDF...");
      const res = await api.post("/emails/send-single", { 
        participant_id: id,
        event_id: participant.event_id 
      });
      toast.success(res.data.message || "Meal Pass email sent successfully! 🚀", { id: toastId });
    } catch (err) {
      console.error("Failed to send mail:", err);
      toast.error("An error occurred while sending email");
    } finally {
      setSendingMail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C77DFF]"></div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <XCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-bold">Participant Not Found</h1>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition text-gray-900 dark:text-white"
          >
            <ArrowLeft size={20} /> Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Participant Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: QR Code and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
              <div className="w-48 h-48 bg-white rounded-2xl p-2 mb-6 shadow-glow overflow-hidden">
                {participant.qr_code ? (
                  <img src={participant.qr_code} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Info size={32} className="mb-2" />
                    <p className="text-xs">QR Not Available</p>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{participant.name}</h2>
              <p className="text-[#C77DFF] font-medium mb-4">{participant.team_name}</p>
              
              <div className="w-full h-px bg-gray-200 dark:bg-white/10 mb-6"></div>
              
              <button
                onClick={handleSendMail}
                disabled={sendingMail || !participant.qr_code}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition duration-300 ${
                  sendingMail || !participant.qr_code
                    ? "bg-gray-600/50 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-[#7B2CBF] to-[#C77DFF] hover:shadow-[0_0_20px_rgba(199,125,255,0.4)] hover:scale-[1.02]"
                }`}
              >
                {sendingMail ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Mail size={20} />
                    Send Mail
                  </>
                )}
              </button>
              {!participant.qr_code && (
                <p className="text-xs text-red-400 mt-2">QR code required to send mail</p>
              )}
            </div>

            {/* Status Section */}
            <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Info size={20} className="text-[#C77DFF]" /> Status
              </h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <span className="text-gray-500 dark:text-gray-400">Meals Eaten</span>
                <span className="text-[#C77DFF] font-bold text-xl">{participant.meals_eaten}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info and Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Detailed Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem label="Full Name" value={participant.name} />
                <InfoItem label="Email Address" value={participant.email} />
                <InfoItem label="Team Name" value={participant.team_name} />
                <InfoItem label="Token ID" value={participant.token_id} />
              </div>
            </div>

            <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Calendar className="text-[#C77DFF]" /> Event Participation
              </h3>
              
              <div className="p-6 bg-gradient-to-r from-[#7B2CBF]/20 to-transparent border border-[#7B2CBF]/30 rounded-2xl">
                <p className="text-gray-400 text-sm mb-1">Registered Event</p>
                <h4 className="text-2xl font-bold">{participant.event_name}</h4>
                <div className="mt-4 flex gap-4">
                   <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-[#C77DFF] border border-[#C77DFF]/30">
                     Active Participation
                   </div>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            {teamMembers.length > 0 && (
              <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Other Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => navigate(`/participant/${member.id}`)}
                      className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{member.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                           {member.meals_eaten} Meals
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Meal Schedule Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Meal Schedule & Status</h3>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/10">
                  Admin Control
                </div>
              </div>

              {fetchingMeals ? (
                <div className="flex justify-center p-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C77DFF]"></div>
                </div>
              ) : mealSchedule.length > 0 ? (
                <div className="space-y-4">
                  {mealSchedule.map((meal) => (
                    <div 
                      key={meal.meal_id}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300"
                    >
                      <div className="flex items-start gap-4 mb-4 md:mb-0">
                        <div className={`mt-1 h-3 w-3 rounded-full ${meal.is_scanned ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                        <div>
                          <p className="font-bold text-lg leading-tight mb-1 text-gray-900 dark:text-white">{meal.meal_name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                             <span className="flex items-center gap-1">
                               <Calendar size={12} className="text-[#C77DFF]" />
                               {formatDate(meal.date)}
                             </span>
                             <span className="h-1 w-1 rounded-full bg-gray-600"></span>
                             <span>{formatTime(meal.start_time)} - {formatTime(meal.end_time)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${meal.is_scanned ? 'text-green-400' : 'text-gray-500'}`}>
                             {meal.is_scanned ? 'Scanned' : 'Pending'}
                           </span>
                           <span className="text-[10px] text-gray-600">Manual Override</span>
                        </div>
                        
                        <button
                          onClick={() => handleToggleMeal(meal.meal_id)}
                          disabled={togglingMealId === meal.meal_id}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                            meal.is_scanned ? 'bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-700'
                          }`}
                        >
                          <span className="sr-only">Toggle Scan</span>
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              meal.is_scanned ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                          {togglingMealId === meal.meal_id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                               <div className="animate-spin h-3 w-3 border-t-2 border-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-500 dark:text-gray-400">No meals scheduled for this event.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
      <p className="text-lg font-medium break-all text-gray-900 dark:text-white">{value || "—"}</p>
    </div>
  );
}
