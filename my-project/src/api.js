// src/api.js
import axios from "axios";

const API_URL = "http://localhost:3001"; // Replace this with your actual backend URL

export const submitRegistrationData = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error("Error submitting data:", error);
    throw error;
  }
};
