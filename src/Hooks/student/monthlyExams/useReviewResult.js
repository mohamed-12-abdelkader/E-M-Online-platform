import React from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../../../api/baseUrl";

// الدالة التي تجلب البيانات باستخدام id
const fetchReviewData = async (token, id) => {
  const response = await baseUrl.get(`api/exams/${id}/review`, {
    headers: { token: token },
  });
  return response.data;
};
const useReviewResult = (id) => {
  const queryClient = useQueryClient(); // للحصول على queryClient
  const token = localStorage.getItem("token");

  const {
    data: review,
    isLoading: reviewLoading,
    error,
  } = useQuery({
    queryKey: ["review", id], // Cache key يشمل id
    queryFn: () => fetchReviewData(token, id), // Fetch function تأخذ id
    enabled: !!id, // يتم التحقق من أن id موجود لتجنب الأخطاء
    staleTime: 1000 * 60 * 5, // Keep data cached for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const refetchStudenExam = (id) => {
    queryClient.invalidateQueries(["review", id]); // تحديث الكاش وجلب البيانات بناءً على id
  };

  return [reviewLoading, review, refetchStudenExam, error];
};

export default useReviewResult;
