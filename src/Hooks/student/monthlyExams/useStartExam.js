import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../../api/baseUrl";

const useStartExam = ({ id }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null); // State to store errors

  // useStartExam.js
  const handleStart = async () => {
    try {
      setLoading(true);
      const response = await baseUrl.post(
        `api/exams/start`,
        { exam_id: id },
        {
          headers: {
            token: token,
          },
        }
      );
      setResponseData(response.data); // Store the response data
      setError(null); // Reset error in case the request is successful
      return response; // Return the response directly
    } catch (error) {
      setError(error); // Set the error in the state
      toast.error("Failed to start the exam"); // Optionally show an error toast
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Return loading, responseData, error, and the handleStart function
  return [loading, responseData, error, handleStart];
};

export default useStartExam;
