import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck,
  Home,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "users", name: "User Management", icon: Users },
  ];

  const handleExitAdmin = () => {
    navigate("/home");
  };

  const sidebarContent = (
    <div className="w-80 h-full bg-[#1A1625] text-white flex flex-col border-r border-white/5 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] flex items-center justify-center shadow-lg shadow-[#7F5AF0]/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">BitePass <span className="text-[#C77DFF]">Admin</span></h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Management Suite</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-10 space-y-3">
        <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Core Analytics</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full group flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
              ? "bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] text-white shadow-lg shadow-[#7F5AF0]/20" 
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-[#7F5AF0]"} />
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </div>
            {activeTab === item.id && (
              <motion.div layoutId="activeInd" className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5 bg-[#14111E]/50">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExitAdmin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#7F5AF0]/10 text-[#7F5AF0] font-bold text-sm hover:bg-[#7F5AF0] hover:text-white transition-all shadow-sm border border-[#7F5AF0]/20"
        >
          <Home size={18} />
          BitePass Home
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Using Framer Motion for drawer effect) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-full"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
