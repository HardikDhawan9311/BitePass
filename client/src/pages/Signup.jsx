// import { useState } from "react";
// import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { saveToken } from "../../utils/auth";


// const SignUp = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const navigate = useNavigate();


//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Limit name input to 20 characters
//     if (name === "name" && value.length > 20) return;

//     setFormData({ ...formData, [name]: value });
//   };

//    const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError(null);
//   setSuccess(null);

//   try {
//     const response = await fetch("http://localhost:8000/auth/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Something went wrong");
//     }

//     // ✅ Save the token from backend
//     if (data.token) {
//       saveToken(data.token);
//     }

//     setSuccess(data.message);
//     alert("Signup successful! 🎉");
//     navigate("/home");
//   } catch (err) {
//     setError(err.message);
//     alert(`Error: ${err.message}`);
//   }
// };


//   const handleGoogleSignup = () => {
//     alert("Google signup logic goes here!");
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 px-4">
//       <div className="bg-white/30 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-sm border border-white/40">
//         <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-900 drop-shadow">
//           Create Account
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Name */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaUser className="text-gray-500 mr-2" />
//             <input
//               type="text"
//               name="name"
//               placeholder="Full Name"
//               maxLength="20"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//               required
//             />
//           </div>

//           {/* Username */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaUser className="text-gray-500 mr-2" />
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               value={formData.username}
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//               required
//             />
//           </div>

//           {/* Email */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaEnvelope className="text-gray-500 mr-2" />
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white/60">
//             <FaLock className="text-gray-500 mr-2" />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full bg-transparent focus:outline-none text-sm"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow-lg"
//           >
//             Sign Up
//           </button>
//         </form>

//         <div className="mt-5">
//           <button
//             onClick={handleGoogleSignup}
//             className="w-full bg-white hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-gray-300 shadow-md"
//           >
//             <img
//               src="https://www.svgrepo.com/show/475656/google-color.svg"
//               alt="Google"
//               className="w-5 h-5"
//             />
//             Sign Up with Google
//           </button>
//         </div>

//         <p className="mt-5 text-center text-xs text-gray-700">
//           Already have an account?{" "}
//           <a href="/signin" className="text-indigo-600 font-semibold hover:underline">
//             Log in
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignUp;


import { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", formData);
      toast.success("Account created! Please ask an administrator to activate your account. 🚀", { duration: 6000 });
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0F0C29] dark:via-[#302B63] dark:to-[#24243E] transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-100 dark:border-white/20 shadow-2xl">

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Create Account 🚀
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-center mb-6">
          Join us today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { icon: FaUser, name: "name", placeholder: "Full Name" },
            { icon: FaUser, name: "username", placeholder: "Username" },
            { icon: FaEnvelope, name: "email", placeholder: "Email" },
            { icon: FaLock, name: "password", placeholder: "Password", type: "password" },
          ].map((field, i) => (
            <div key={i} className="relative">
              <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                onChange={handleChange}
                className="w-full pl-12 py-3 rounded-xl bg-gray-100 dark:bg-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#7F5AF0]"
              />
            </div>
          ))}

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] text-white font-semibold hover:scale-[1.02] transition">
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-300 mt-6">
          Already have an account?{" "}
          <a href="/signin" className="text-[#C77DFF] font-semibold">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
