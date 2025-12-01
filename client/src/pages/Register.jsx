import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", form);
      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-96 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-4">

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg outline-none"
          />

          <button
            onClick={handleRegister}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Register
          </button>

          <p className="text-center text-sm mt-3">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600">Login</a>
          </p>

        </div>
      </div>
    </div>
  );
}
