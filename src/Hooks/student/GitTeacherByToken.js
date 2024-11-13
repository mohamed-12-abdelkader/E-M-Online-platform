import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchTeacherData = async (token) => {
  const response = await baseUrl.get("api/user/myteacher", {
    headers: { token: token },
  });
  return response.data;
};

const useGitTeacherByToken = () => {
  const token = localStorage.getItem("token");

  const {
    data: teachers,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["teachers"], // Cache key
    queryFn: () => fetchTeacherData(token), // Fetch function
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (error) {
    console.error("Error fetching teacher data:", error);
  }

  return [loading, teachers];
};

export default useGitTeacherByToken;
