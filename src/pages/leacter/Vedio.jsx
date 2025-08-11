import { useState, useEffect } from "react";
import { Skeleton, Stack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import ReactPlayer from "react-player";

const Vedio = () => {
  const { videoId } = useParams();
  
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // استرجاع رابط الفيديو من API
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await baseUrl.get(`/api/course/video/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideoUrl(response.data.video_url);
        setError("");
      } catch (err) {
        console.error("خطأ في جلب رابط الفيديو:", err);
        setError("حدث خطأ في جلب رابط الفيديو");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoUrl();
    }
  }, [videoId]);

  // تحديد نوع الفيديو
  const isYoutubeLink = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const isBunnyLink = videoUrl && videoUrl.includes("bunny.net");

  // تحويل رابط YouTube إلى embed
  const getYoutubeEmbedUrl = (url) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1&controls=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1&controls=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Stack spacing={4}>
              <Skeleton height="400px" width="100%" />
            </Stack>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-xl font-semibold">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-[100px] bg-gray-50 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* عنوان الفيديو */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-white text-xl font-bold text-center">
              مشاهدة الفيديو
            </h1>
          </div>
          
          {/* مشغل الفيديو */}
          <div className="p-6">
            {isYoutubeLink ? (
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <iframe
                    src={getYoutubeEmbedUrl(videoUrl)}
                    width="100%"
                    height="400px"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={false}
                    className="rounded-lg shadow-lg"
                    style={{ borderRadius: "12px" }}
                  />
                </div>
              </div>
            ) : isBunnyLink ? (
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-[400px] rounded-lg shadow-lg"
                    style={{ objectFit: "cover" }}
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <iframe
                    src={videoUrl}
                    loading="lazy"
                    className="w-full h-[400px] rounded-lg shadow-lg border-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Vedio;
