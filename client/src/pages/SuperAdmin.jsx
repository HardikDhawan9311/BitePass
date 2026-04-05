import React, { useState, useEffect } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Activity,
  TrendingUp, 
  Database,
  Search,
  Layout,
  Trash2,
  Edit,
  X,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Menu,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import api from "../utils/api";
import { decodeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from "recharts";

const ChartContainer = ({ title, icon: Icon, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#1A1625] border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden group"
  >
    <div className="flex justify-between items-center mb-8 lg:mb-10 relative z-10">
      <h2 className="text-lg lg:text-xl font-black flex items-center gap-3">
        <Icon size={24} className="text-[#7F5AF0]" />
        {title}
      </h2>
      <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer">
        <ArrowUpRight size={20} />
      </div>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

const StatCard = ({ icon: Icon, title, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="bg-[#1A1625] border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-3x ${color} group-hover:scale-150 transition-transform`} />
    <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-lg shadow-${color.replace('bg-', '')}/10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div className="flex items-center gap-1 text-green-500 text-[10px] font-black bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
        Live
      </div>
    </div>
    <h3 className="text-gray-500 font-medium mb-1 uppercase tracking-[0.15em] text-[10px]">{title}</h3>
    <p className="text-2xl lg:text-4xl font-black text-white">{value}</p>
  </motion.div>
);

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🛡️ Security Check
  useEffect(() => {
    const user = decodeToken();
    if (!user || user.role !== "super admin") {
      toast.error("Access Denied: Super Admin privileges required.");
      navigate("/home");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } else if (activeTab === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
      toast.error("Failed to fetch system intelligence");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      });
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      try {
        const toastId = toast.loading("Deleting user...");
        await api.delete(`/admin/users/${userId}`);
        toast.success("User deleted successfully!", { id: toastId });
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete user");
        console.error("Delete user error:", err);
      }
    }
  };

  const engagementData = stats ? [
    { name: "Participants", count: stats.totalParticipants },
    { name: "Scans", count: stats.totalScans }
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#0F0C19] text-white selection:bg-[#7F5AF0] selection:text-white relative">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="flex-1 overflow-x-hidden pb-24 lg:pb-0">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-20 bg-[#1A1625]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] flex items-center justify-center">
                 <ShieldCheck size={24} className="text-white" />
              </div>
              <h1 className="font-black text-lg">BitePass <span className="text-[#C77DFF]">Admin</span></h1>
           </div>
           <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl">
              <Menu size={24} />
           </button>
        </header>

        <div className="px-4 lg:px-10 py-8 lg:py-14">
           {/* Animated Tab Content */}
           <AnimatePresence mode="wait">
             {activeTab === "dashboard" ? (
               <motion.section
                 key="dashboard"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8 lg:space-y-12"
               >
                 <div className="flex justify-between items-end">
                   <div className="space-y-2 lg:space-y-3">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F5AF0]/10 text-[#7F5AF0] text-[10px] font-black uppercase tracking-[0.2em] border border-[#7F5AF0]/20">
                       <TrendingUp size={12} />
                       Visual Intelligence
                     </div>
                     <h1 className="text-3xl lg:text-5xl font-black tracking-tight">System <span className="text-[#C77DFF]">Intelligence</span></h1>
                   </div>
                 </div>

                 {/* STATS GRID */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    <StatCard 
                      icon={Database} 
                      title="Total Events" 
                      value={stats?.totalEvents || 0} 
                      color="bg-blue-500" 
                      delay={0.1}
                    />
                    <StatCard 
                      icon={Calendar} 
                      title="Upcoming Events" 
                      value={stats?.upcomingEvents || 0} 
                      color="bg-[#C77DFF]" 
                      delay={0.2}
                    />
                    <StatCard 
                      icon={Users} 
                      title="Total Participants" 
                      value={stats?.totalParticipants || 0} 
                      color="bg-green-500" 
                      delay={0.3}
                    />
                    <StatCard 
                      icon={Activity} 
                      title="Verification Scans" 
                      value={stats?.totalScans || 0} 
                      color="bg-yellow-500" 
                      delay={0.4}
                    />
                 </div>

                 {/* MULTI-CHART GRID */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                   {/* 1. Bar Chart */}
                   <ChartContainer title="Event Overview" icon={Database} delay={0.1}>
                     <div className="h-[300px] lg:h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <BarChart data={stats?.chartData || []}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2D293B" vertical={false} />
                           <XAxis dataKey="name" stroke="#5D5A6D" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <YAxis stroke="#5D5A6D" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <Tooltip 
                             cursor={{ fill: 'rgba(127, 90, 240, 0.05)' }} 
                             contentStyle={{ backgroundColor: '#1A1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', fontWeight: 700 }}
                             itemStyle={{ color: '#fff' }}
                             labelStyle={{ color: '#fff' }}
                           />
                           <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={50}>
                             {stats?.chartData?.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index === 1 ? '#C77DFF' : '#7F5AF0'} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </ChartContainer>

                   {/* 2. Area Chart */}
                   <ChartContainer title="Engagement Metrics" icon={Users} delay={0.2}>
                     <div className="h-[300px] lg:h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <AreaChart data={engagementData}>
                           <defs>
                             <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#7F5AF0" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#7F5AF0" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2D293B" vertical={false} />
                           <XAxis dataKey="name" stroke="#5D5A6D" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <YAxis stroke="#5D5A6D" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#1A1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', fontWeight: 700 }}
                             itemStyle={{ color: '#fff' }}
                             labelStyle={{ color: '#fff' }}
                           />
                           <Area type="monotone" dataKey="count" stroke="#7F5AF0" strokeWidth={4} fillOpacity={1} fill="url(#colorEngage)" />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </ChartContainer>

                   {/* 3. Pie Chart */}
                   <ChartContainer title="Status Distribution" icon={PieChartIcon} delay={0.3}>
                     <div className="h-[300px] lg:h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <PieChart>
                           <Pie
                             data={[
                               { name: "Upcoming", value: stats?.upcomingEvents || 0 },
                               { name: "Past", value: stats?.pastEvents || 0 }
                             ]}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={8}
                             dataKey="value"
                           >
                             <Cell fill="#C77DFF" stroke="rgba(255,255,255,0.05)" />
                             <Cell fill="#7F5AF0" stroke="rgba(255,255,255,0.05)" />
                           </Pie>
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#1A1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 700 }}
                             itemStyle={{ color: '#fff' }}
                             labelStyle={{ color: '#fff' }}
                           />
                           <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   </ChartContainer>

                   {/* 4. Gauge/Horizontal Bar */}
                   <ChartContainer title="System Throughput" icon={Activity} delay={0.4}>
                     <div className="h-[300px] lg:h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <BarChart data={[
                           { name: "Events", count: stats?.totalEvents || 0 },
                           { name: "Users", count: stats?.totalParticipants || 0 },
                           { name: "Scans", count: stats?.totalScans || 0 }
                         ]} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#2D293B" horizontal={false} />
                           <XAxis type="number" stroke="#5D5A6D" axisLine={false} tickLine={false} hide />
                           <YAxis dataKey="name" type="category" stroke="#5D5A6D" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} width={80} />
                           <Tooltip 
                             cursor={{ fill: 'rgba(127, 90, 240, 0.05)' }} 
                             contentStyle={{ backgroundColor: '#1A1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', fontWeight: 700 }}
                             itemStyle={{ color: '#fff' }}
                             labelStyle={{ color: '#fff' }}
                           />
                           <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={30}>
                              <Cell fill="#7F5AF0" />
                              <Cell fill="#C77DFF" />
                              <Cell fill="#4CC9F0" />
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </ChartContainer>
                 </div>
               </motion.section>
             ) : (
               <motion.section
                 key="users"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8 lg:space-y-10"
               >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                   <div className="space-y-2 lg:space-y-3">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                       <Users size={12} />
                       Identity Engine
                     </div>
                     <h1 className="text-3xl lg:text-5xl font-black tracking-tight">Identity <span className="text-blue-500">Access</span></h1>
                   </div>
                   <div className="w-full sm:w-auto">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                         <input 
                           type="text" 
                           placeholder="Search identities..." 
                           className="w-full sm:w-80 pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#7F5AF0] transition-all shadow-inner"
                         />
                      </div>
                   </div>
                 </div>

                 {/* USER TABLE WRAPPER */}
                 <div className="bg-[#1A1625] border border-white/5 rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-white/2">
                            <th className="px-6 lg:px-10 py-5 lg:py-7 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">#</th>
                            <th className="px-6 lg:px-10 py-5 lg:py-7 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identity</th>
                            <th className="px-6 lg:px-10 py-5 lg:py-7 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">User Details</th>
                            <th className="px-6 lg:px-10 py-5 lg:py-7 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Clearance</th>
                            <th className="px-6 lg:px-10 py-5 lg:py-7 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Operations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-white/2 transition-colors">
                              <td className="px-6 lg:px-10 py-5 lg:py-6 text-xs font-black text-gray-500">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="px-6 lg:px-10 py-5 lg:py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-indigo-400 text-sm">
                                       {user.name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-black text-white text-sm">{user.name}</p>
                                       <p className="text-[10px] font-bold text-gray-500 tracking-wider">@{user.username}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 lg:px-10 py-5 lg:py-6">
                                 <p className="text-xs lg:text-sm font-bold text-gray-300">{user.email}</p>
                                 <p className="text-[10px] font-medium text-gray-500 mt-1 uppercase">Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 lg:px-10 py-5 lg:py-6">
                                 <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 ${
                                     user.role === 'super admin' ? 'text-[#C77DFF] bg-[#C77DFF]/5' : 
                                     user.role === 'admin' ? 'text-indigo-400 bg-indigo-400/5' : 'text-blue-400 bg-blue-400/5'
                                   }`}>
                                    {user.role}
                                 </span>
                              </td>
                               <td className="px-6 lg:px-10 py-5 lg:py-6">
                                  <div className="flex items-center gap-2 lg:gap-3">
                                     <button 
                                       onClick={() => handleEditClick(user)}
                                       className="p-2.5 lg:p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-blue-400 hover:text-white shadow-sm"
                                     >
                                        <Edit size={16} />
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteUser(user.id, user.name)}
                                       className="p-2.5 lg:p-3 bg-red-500/10 rounded-xl hover:bg-red-500 transition-colors text-red-500 hover:text-white shadow-sm"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               </motion.section>
             )}
           </AnimatePresence>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#1A1625]/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-around px-4 z-40 shadow-2xl">
         <button 
           onClick={() => setActiveTab("dashboard")} 
           className={`flex flex-col items-center gap-1 transition-all ${activeTab === "dashboard" ? "text-[#7F5AF0]" : "text-gray-500"}`}
         >
            <LayoutDashboard size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Dash</span>
         </button>
         <button 
           onClick={() => setActiveTab("users")} 
           className={`flex flex-col items-center gap-1 transition-all ${activeTab === "users" ? "text-blue-500" : "text-gray-500"}`}
         >
            <Users size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Users</span>
         </button>
      </nav>

      {/* Edit User Modal (Responsive) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#1A1625] border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                 <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-black mb-1 lg:mb-2 text-white">Edit Identity</h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Update User Intelligence</p>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Full Name</label>
                  <input 
                    type="text" 
                    value={editingUser?.name || ""} 
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-white focus:outline-none focus:border-[#7F5AF0] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email Address</label>
                  <input 
                    type="email" 
                    value={editingUser?.email || ""} 
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-white focus:outline-none focus:border-[#7F5AF0] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Access Clearance</label>
                  <select 
                    value={editingUser?.role || "user"} 
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-white focus:outline-none focus:border-[#7F5AF0] transition-all appearance-none cursor-pointer"
                  >
                    <option value="user" className="bg-[#1A1625]">User</option>
                    <option value="admin" className="bg-[#1A1625]">Admin</option>
                    <option value="super admin" className="bg-[#1A1625]">Super Admin</option>
                  </select>
                </div>

                <div className="pt-4 lg:pt-6">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] rounded-2xl font-black text-sm text-white shadow-xl shadow-[#7F5AF0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
