import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchPosts = async (token, cursor = "") => {
  let url = "api/posts?limit=500"; // لا يزال يمكننا تحديد limit كبير في حالة إذا كان API يفرضه
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  const response = await baseUrl.get(url, {
    headers: { token: token },
  });
  return response.data;
};

const useGitPosts = () => {
  const token = localStorage.getItem("token");
  const [cursor, setCursor] = useState(""); // لتخزين الـ cursor
  const [allPosts, setAllPosts] = useState([]); // لتخزين جميع البوستات

  const {
    data: postsData,
    isLoading: postsLoading,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useQuery(
    ["posts", cursor], // مفتاح تعريف الكاش يتغير مع الـ cursor
    () => fetchPosts(token, cursor), // الدالة التي تجلب البيانات
    {
      staleTime: 1000 * 60 * 5, // احتفاظ البيانات بالكاش لمدة 5 دقائق قبل إعادة التحميل
      cacheTime: 1000 * 60 * 10, // إبقاء الكاش لمدة 10 دقائق
      refetchOnWindowFocus: false, // يمنع إعادة التحميل عند التركيز على النافذة
      getNextPageParam: (lastPage) => lastPage.nextCursor || false, // استخدام الـ cursor للصفحة التالية
      onSuccess: (data) => {
        // جمع كل البوستات في قائمة واحدة
        setAllPosts((prevPosts) => [...prevPosts, ...data.posts]);
        if (data.nextCursor) {
          // إذا كان هناك المزيد من البوستات، استمر في جلب المزيد
          setCursor(data.nextCursor);
        }
      },
    }
  );

  // إذا كان هناك خطأ
  if (error) {
    console.log("Error fetching data");
  }

  // العودة إلى بيانات البوستات
  return {
    postsLoading,
    posts: allPosts, // استخدام جميع البوستات التي تم جمعها
    nextCursor: postsData?.nextCursor || null, // cursor للصفحة التالية
    fetchNextPage, // دالة لتحميل الصفحة التالية
    isFetchingNextPage, // حالة التحميل للصفحة التالية
  };
};

export default useGitPosts;
