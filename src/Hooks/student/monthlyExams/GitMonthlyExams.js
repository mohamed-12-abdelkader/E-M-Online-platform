import React from "react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../../api/baseUrl";

const fetchExamsData = async (token) => {
  const response = await baseUrl.get("api/exams/collections", {
    headers: { token: token },
  });
  return response.data;
};

const GitMonthlyExams = () => {
  const token = localStorage.getItem("token");

  const {
    data: exams_S,
    isLoading: exams_S_Loading,
    error,
  } = useQuery({
    queryKey: ["exams_S"], // Cache key
    queryFn: () => fetchExamsData(token), // Fetch function
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (error) {
    console.error("Error fetching teacher data:", error);
  }

  return [exams_S_Loading, exams_S];
};

export default GitMonthlyExams;
