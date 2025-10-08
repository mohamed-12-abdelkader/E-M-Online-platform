import { useState, useEffect, useRef } from "react";
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
  const [blocked, setBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("تم تعطيل العرض لأسباب أمنية");
  const playerRef = useRef(null);
  const devtoolsOpenRef = useRef(false);

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

  // تهيئة Plyr + منع الكليك يمين داخل المشغل
  useEffect(() => {
    if (videoUrl) {
      const player = new Plyr("#player", { disableContextMenu: true });
      playerRef.current = player;

      return () => {
        try { player.destroy(); } catch (e) {}
        playerRef.current = null; // تنظيف عند إلغاء المكون
      };
    }
  }, [videoUrl]);

  // حظر سياق الكليك يمين + اختصارات فحص العناصر والحفظ والطباعة وما إلى ذلك
  useEffect(() => {
    const preventContext = (e) => e.preventDefault();
    const preventKeys = (e) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (
        key === "f12" ||
        (ctrl && shift && ["i", "j", "c"].includes(key)) ||
        (ctrl && ["u", "s", "p", "c", "x"].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const preventSelect = (e) => e.preventDefault();

    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys, true);
    document.addEventListener("selectstart", preventSelect);
    document.addEventListener("dragstart", preventSelect);

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys, true);
      document.removeEventListener("selectstart", preventSelect);
      document.removeEventListener("dragstart", preventSelect);
    };
  }, []);

  // كشف فتح أدوات المطور (تقريبي)


  
  // دالة فحص لاستئناف العرض فقط عند الأمان


 

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
    <div
      className="min-h-screen mt-[100px] bg-gray-50 pt-20 px-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
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

          {/* طبقة حجب كاملة */}
        
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Video;
