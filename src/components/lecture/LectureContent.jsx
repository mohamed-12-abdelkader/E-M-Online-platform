import { Zoom } from "react-awesome-reveal";
import VideoItem from "./VideoItem";
import PdfItem from "./PdfItem";
import { FaFileVideo } from "react-icons/fa";
import { FaPhotoVideo } from "react-icons/fa";
import { GoArrowLeft } from "react-icons/go";
import { PiExamFill } from "react-icons/pi";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import { Button, Spinner } from "@chakra-ui/react";

const LectureContent = ({
  videos,
  pdfs,
  isTeacher,
  onDeleteVideo,
  onDeletePdf,
  examName,
  examId,
  lastResult,
  onDeleteExam,
  Loading,
}) => (
  <div
    className="w-[100%] border shadow my-[70px] m-auto p-3"
    style={{ borderRadius: "20px" }}
  >
    <div
      className="flex font-bold text-xl bg-blue-500 w-[230px] p-2"
      style={{ borderRadius: "20px" }}
    >
      <FaFileVideo className="text-red-500 m-2" />
      <h1 className="text-white">محتوى المحاضرة</h1>
    </div>

    {videos.length > 0 ? (
      videos.map((video) => (
        <Zoom key={video.id}>
          <VideoItem
            video={video}
            onDelete={onDeleteVideo}
            isTeacher={isTeacher}
          />
        </Zoom>
      ))
    ) : (
      <div className="text-center flex justify-center items-center my-3 h-[150px] ">
        {isTeacher ? (
          <h1 className="font-bold flex">
            لا يوجد محتوى للمحاضرة
            <GoArrowLeft className="m-1 text-red-500 text-xl" />
            <Link to={`/admin/add_video`}>
              <span className="text-red-500">اضف المحتوى الان</span>
            </Link>
          </h1>
        ) : (
          <h1 className="font-bold flex">
            <FaPhotoVideo className="m-1 text-red-500 text-xl" />
            سوف يتم اضافة محتوى المحاضرة قريبًا
          </h1>
        )}
      </div>
    )}

    {pdfs.length > 0 &&
      pdfs.map((pdf) => (
        <Zoom key={pdf.id}>
          <PdfItem pdf={pdf} onDelete={onDeletePdf} isTeacher={isTeacher} />
        </Zoom>
      ))}

    {examName && (
      <Zoom>
        <div className="w-[100%] border shadow h-[80px] my-5 p-3 flex justify-between items-center">
          <div>
            <h1 className="font-bold my-2 flex">
              <PiExamFill className="m-1 text-red-500 text-xl" />
              {examName}
            </h1>
            {lastResult && (
              <h1 className="font-bold m-2">- درجتك: {lastResult}</h1>
            )}
          </div>
          <div className="flex">
            <Link
              to={isTeacher ? `/teacher_exam/${examId}` : `/exam/${examId}`}
              className="mx-1"
            >
              <Button colorScheme="green" variant="outline">
                <RiLogoutBoxRFill />
              </Button>
            </Link>
            {isTeacher && (
              <Button colorScheme="red" className="mx-1" onClick={onDeleteExam}>
                {Loading ? <Spinner /> : <MdOutlineDeleteOutline />}
              </Button>
            )}
          </div>
        </div>
      </Zoom>
    )}
  </div>
);

export default LectureContent;
