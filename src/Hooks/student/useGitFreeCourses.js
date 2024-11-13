import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchfreeMonthData = async (token) => {
  const response = await baseUrl.get("api/month/free", {
    headers: { token: token },
  });
  return response.data;
};

const useGitFreeCourses = () => {
  const token = localStorage.getItem("token");

  const {
    data: freeMonth,
    isLoading: freeMonthLoading,
    error,
  } = useQuery({
    queryKey: ["freeMonth"], // Cache key
    queryFn: () => fetchfreeMonthData(token), // Fetch function
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (error) {
    console.error("Error fetching teacher data:", error);
  }

  return [freeMonth, freeMonthLoading];
};

export default useGitFreeCourses;
