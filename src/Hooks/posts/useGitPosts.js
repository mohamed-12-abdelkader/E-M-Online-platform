import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchPosts = async (token) => {
  const response = await baseUrl.get("api/posts", {
    headers: { token: token },
  });
  return response.data;
};

const useGitPosts = () => {
  const token = localStorage.getItem("token");

  const {
    data: posts,
    isLoading: postsLoading,
    error,
  } = useQuery(
    ["posts"], // مفتاح تعريف الكاش
    () => fetchPosts(token), // الدالة التي تجلب البيانات
    {
      staleTime: 1000 * 60 * 5, // احتفاظ البيانات بالكاش لمدة 5 دقائق قبل إعادة التحميل
      cacheTime: 1000 * 60 * 10, // إبقاء الكاش لمدة 10 دقائق
      refetchOnWindowFocus: false, // يمنع إعادة التحميل عند التركيز على النافذة
    }
  );

  if (error) {
    console.log("Error fetching data");
  }

  return [postsLoading, posts];
};

export default useGitPosts;
