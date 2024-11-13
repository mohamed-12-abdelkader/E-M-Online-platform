import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchTeacherData = async (token) => {
  const response = await baseUrl.get("api/posts/status/bookmarks", {
    headers: { token: token },
  });
  return response.data;
};

const useGitSavePosts = () => {
  const token = localStorage.getItem("token");

  const {
    data: posts,
    isLoading: postsLoading,
    error,
  } = useQuery({
    queryKey: ["posts"], // Cache key
    queryFn: () => fetchTeacherData(token), // Fetch function
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (error) {
    console.error("Error fetching teacher data:", error);
  }

  return [postsLoading, posts];
};

export default useGitSavePosts;
