import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Router from "next/router";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [secondSteps, setSecondSteps] = useState(false);
  const [isLoading, setIsLoaDing] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitCode = async (registerData: any) => {
    const codeFetch = await axios.post(
      "http://localhost:6001/api/users/validateRegister",
      {
        email: formData.email,
        code: code,
      }
    );
    if (codeFetch.data.success) {
      Router.push("/login");
    } else {
      setSecondSteps(false);
      setError("");
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  const handleSubmit = async (e: any) => {
    console.log("test");
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Tous les champs sont obligatoires");
    } else if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
    } else {
      setError("");

      try {
        const response = await axios.post(
          "http://localhost:6001/api/users/register",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        if (response.status === 201) {
          setSecondSteps(true);
        } else {
          setError("Votre compte email n'est pas associé à Too Good To Go");
        }
      } catch (error) {
        setError(
          "Une erreur s'est produite lors de la vérification de l'e-mail"
        );
      }
    }
  };

  return (
    <div>
        <h2 className="text-2xl font-bold mb-6 rounded  sm:w-96 rounded">Inscription</h2>
        <form>
          <div className="mb-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : secondSteps ? (
              <div>
                <label
                  className="block text-gray-600 text-sm font-medium mb-2"
                  htmlFor="code"
                >
                  Code de validation
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                  placeholder="Code de validation"
                />
                <button
                  onClick={handleSubmitCode}
                  className="w-full bg-[#70566D] text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-[#42273B] focus:outline-none focus:ring focus:ring-indigo-200"
                >
                  Valider
                </button>
              </div>
            ) : (
              <div>
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
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                  placeholder="example@example.com"
                />

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
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                    placeholder="Mot de passe"
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-600 text-sm font-medium mb-2"
                    htmlFor="confirmPassword"
                  >
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                    placeholder="Confirmez le mot de passe"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#70566D] text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-[#42273B] focus:outline-none focus:ring focus:ring-indigo-200"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </form>
    </div>
  );
}

export default Register;
