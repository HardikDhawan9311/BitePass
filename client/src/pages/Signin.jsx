// import { useState } from "react";
// import { FaUser, FaLock } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { saveToken } from "../../utils/auth";



// const SignIn = () => {
//   // Step 1: State for form data
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });

//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); 
//   const navigate = useNavigate();


//   // Step 2: Update input values
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Step 3: Handle form submission
//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await fetch("http://localhost:8000/auth/signin", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Invalid credentials");
//     }

//     // ✅ Save JWT token
//     if (data.token) {
//       saveToken(data.token);
//     }



    
//       setMessageType("success");
//       setMessage("✅ Login successful! Redirecting to your home page...");

//       // Wait 2 seconds before redirect
//       setTimeout(() => navigate("/home"), 2000);
//   } catch (err) {
//     alert(`Login failed: ${err.message}`);
//   }
// };



//   // Step 4: Handle Google login
//   const handleGoogleLogin = () => {
//     alert("Google login logic goes here!");
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 px-4">
//       <div className="bg-white/30 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-sm border border-white/40">
//         {/* Title */}
//         <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-900 drop-shadow">
//           Welcome Back
//         </h2>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Username */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaUser className="text-gray-500 mr-2" />
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//             />
//           </div>

//           {/* Password */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaLock className="text-gray-500 mr-2" />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//             />
//           </div>

//           {/* Login Button */}
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow-lg"
//           >
//             Log In
//           </button>
//         </form>

//         {/* Google Login */}
//         <div className="mt-5">
//           <button
//             onClick={handleGoogleLogin}
//             className="w-full bg-white hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-gray-300 shadow-md"
//           >
//             <img
//               src="https://www.svgrepo.com/show/475656/google-color.svg"
//               alt="Google"
//               className="w-5 h-5"
//             />
//             Log In with Google
//           </button>
//         </div>

//         {/* Footer */}
//         <p className="mt-5 text-center text-xs text-gray-700">
//           Don’t have an account?{" "}
//           <a
//             href="/"
//             className="text-indigo-600 font-semibold hover:underline"
//           >
//             Sign Up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignIn;


import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { saveToken, decodeToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { username: formData.username });
      toast.success("If an account with that username exists, a temporary password has been sent to your email.");
      setIsForgotPassword(false);
      setFormData({ ...formData, password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/signin", formData);
      saveToken(res.data.token);
      toast.success("Login successful! 🎉");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] transition-colors duration-300">
        <div className="w-full max-w-md animate-slide-up bg-white dark:bg-[#1A1625]/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-white/5 relative z-10 mx-4 shadow-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">
              {isForgotPassword ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isForgotPassword ? "Enter your username to receive a temporary password." : "Admin Gateway"}
            </p>
          </div>

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-12 py-3 rounded-xl bg-gray-100 dark:bg-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#7F5AF0]"
            />
          </div>

          {!isForgotPassword && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#7F5AF0] transition-colors">
                    <FaLock size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-[#0D0B14] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#7F5AF0] focus:ring-1 focus:ring-[#7F5AF0] transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(true); setFormData({ username: formData.username, password: "" }); }} 
                  className="text-sm font-medium text-[#C77DFF] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#7F5AF0]/20"
          >
            {loading ? "Processing..." : isForgotPassword ? "Send Reset Email" : "Sign In"}
          </button>
          
          {isForgotPassword && (
            <div className="text-center mt-4">
               <button 
                 type="button" 
                 onClick={() => setIsForgotPassword(false)} 
                 className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
               >
                 Back to Sign In
               </button>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
          Don’t have an account?{" "}
          <a href="/" className="text-[#C77DFF] font-semibold">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
