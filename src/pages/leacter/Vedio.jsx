import { useState, useEffect } from "react";
import { Skeleton, Stack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

const Video = () => {
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

  // استخراج YouTube ID
  const getYoutubeId = (url) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }
    return null;
  };

  // تهيئة Plyr بعد تحميل الفيديو
  useEffect(() => {
    if (videoUrl) {
      const player = new Plyr("#player");

      return () => {
        player.destroy(); // تنظيف عند إلغاء المكون
      };
    }
  }, [videoUrl]);

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

  const youtubeId = getYoutubeId(videoUrl);
  console.log(youtubeId);

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
          {youtubeId && (
            <div className="flex justify-center mt-2 rounded-lg">
              <div className="w-full max-w-4xl">
                <div
                  id="player"
                  data-plyr-provider="youtube"
                  data-plyr-embed-id={youtubeId}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Video;
