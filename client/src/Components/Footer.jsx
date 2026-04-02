import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-[#0b0b1a]/80 backdrop-blur-md border-t border-gray-200 dark:border-white/10 py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-6 h-6 bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] rounded flex items-center justify-center group-hover:shadow-[0_0_8px_#C77DFF] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12 group-hover:rotate-0 transition-transform"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path></svg>
          </div>
          <span className="text-gray-900 dark:text-white font-black tracking-wide">
            Bite<span className="text-[#C77DFF]">Pass</span>
          </span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          © {new Date().getFullYear()} BitePass Management System. All rights reserved.
        </p>

        <div className="flex gap-6">
          <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#C77DFF] transition-colors text-sm">Privacy Policy</a>
          <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#C77DFF] transition-colors text-sm">Terms of Service</a>
          <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#C77DFF] transition-colors text-sm">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
