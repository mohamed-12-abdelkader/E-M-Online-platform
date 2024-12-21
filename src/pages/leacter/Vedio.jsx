import { useState, useEffect, useRef } from "react";
import { Skeleton, Stack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import GitVedio from "../../Hooks/student/GitVedio";
import "react-html5video/dist/styles.css";
import GitVediot from "../../Hooks/teacher/GitVediot";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import ReactPlayer from "react-player";

const Vedio = () => {
  const { videoId } = useParams();
  const [vedioLoading, vdiourl] = GitVedio({ id: videoId });
  const [vedioLoadingt, vdiourlt] = GitVediot({ id: videoId });
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRecording && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRecording]);

  useEffect(() => {
    setIsRecording(true);
  }, []);

  if (vedioLoading || vedioLoadingt) {
    return (
      <div style={{ minHeight: "70vh" }} className='flex items-center'>
        <Stack className='w-[90%] m-auto '>
          <Skeleton height='20px' className='mt-5' />
          <Skeleton height='20px' />
          <Skeleton height='20px' />
          <Skeleton height='20px' />
          <Skeleton height='20px' />
          <ScrollToTop />
        </Stack>
      </div>
    );
  }

  const videoUrl = vdiourl.video || vdiourlt.video;
  const isYoutubeLink = videoUrl && videoUrl.startsWith("https://youtu");
  console.log("vdiourl", vdiourlt.video);
  return (
    <div className='w-100% mt-[50px]'>
      {isYoutubeLink ? (
        <div
          className='mt-[120px] flex justify-center items-center'
          style={{ height: "80vh" }}
        >
          <ReactPlayer
            url={vdiourl.video || vdiourlt.video}
            style={{ height: "600px ", width: "500px" }}
          />
        </div>
      ) : (
        <iframe
          src={vdiourl.video || vdiourlt.video}
          loading='lazy'
          className='w-[100%] h-[120vh] m-auto border'
          allow='accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;'
          allowFullScreen
        ></iframe>
      )}
      <ScrollToTop />
      <input ref={inputRef} className='input-vedio' type='password' />
    </div>
  );
};

export default Vedio;
