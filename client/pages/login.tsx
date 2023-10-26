import React, { useState } from "react";
import Link from "next/link";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Tous les champs sont obligatoires");
    } else {
      setError("");
      setFormData({
        email: "",
        password: "",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full sm:w-96">
        <h2 className="text-2xl font-bold mb-6">Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-600 text-sm font-medium mb-2"
              htmlFor="email"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full py-2 px-3 border ${
                !formData.email && error ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:border-indigo-500`}
              placeholder="example@example.com"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-600 text-sm font-medium mb-2"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full py-2 px-3 border ${
                !formData.password && error
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:border-indigo-500`}
              placeholder="Mot de passe"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="text-right">
            <Link href="/register" className="text-indigo-600 hover:underline">
              Vous n'avez pas de compte ? S'inscrire
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#70566D] text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-[#42273B] focus:outline-none focus:ring focus:ring-indigo-200"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
