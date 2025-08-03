import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchmyMonthData = async (token) => {
  const response = await baseUrl.get("api/course/my-enrollments", {
    headers: { Authorization: `bearer ${token}` },
  });
  return response.data;
};

const GitMyMonthes = () => {
  const token = localStorage.getItem("token");

  const {
    data: myMonth,
    isLoading: myMonthLoading,
    error,
  } = useQuery({
    queryKey: ["myMonth"], // Cache key
    queryFn: () => fetchmyMonthData(token), // Fetch function
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (error) {
    console.error("Error fetching teacher data:", error);
  }

  return [myMonth, myMonthLoading];
};

export default GitMyMonthes;
