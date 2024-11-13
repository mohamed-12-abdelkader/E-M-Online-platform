import { Button, Select, Input, Spinner } from "@chakra-ui/react";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitTeacherLecture from "../../../Hooks/teacher/GitTeacherLecture";
import { useState } from "react";
import useAddVideo from "../../../Hooks/teacher/AddVideo";
import GitTeacherMonth from "../../../Hooks/teacher/GitTeacherMonth";
import GitLecturMonth from "../../../Hooks/teacher/GitLecturMonth";

const AddVideo = () => {
  const [classesLoading, classes] = GitClasses();
  const [grad, setGrad] = useState("");
  const [m_id, setM_id] = useState("");
  const [
    videoloading,
    handleAddVideo,
    video,
    name,
    setLg_id,
    setLo_id,
    setName,
    setVideo,
  ] = useAddVideo();
  const [monthes, monthesLoading, lectureCenterLoading, mergedLectures] =
    GitTeacherMonth({ id: grad });
  const [months, monthLoading] = GitLecturMonth({ id: m_id });

  return (
    <div className="p-5">
      <div className="text-center">
        <h1 className="font-bold text-xl"> اضافة محاضرة </h1>
      </div>
      <div>
        <h1 className="font-bold my-2"> اختر الصف الدراسى </h1>
        <Select
          className="my-2"
          placeholder={classesLoading ? "جار تحميل الصفوف..." : " اختر  الصف  "}
          size="lg"
          onChange={(e) => setGrad(e.target.value)}
          style={{ direction: "ltr" }}
          disabled={classesLoading}
        >
          {classesLoading ? (
            <option disabled>Loading...</option>
          ) : classes && classes.length > 0 ? (
            classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))
          ) : (
            <option disabled> لا يوجد صفوف دراسية متاحة </option>
          )}
        </Select>

        <h1 className="font-bold my-2"> اختر شهر المحاضرة </h1>
        <Select
          className="my-2"
          placeholder={
            lectureCenterLoading || monthesLoading
              ? "جار تحميل الشهور ..."
              : " اختر شهر المحاضرة "
          }
          size="lg"
          style={{ direction: "ltr" }}
          onChange={(e) => setM_id(e.target.value)}
          disabled={lectureCenterLoading || monthesLoading}
        >
          {mergedLectures && mergedLectures.length > 0 ? (
            mergedLectures.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.description}
              </option>
            ))
          ) : (
            <option disabled> لا يوجد شهور دراسية متاحة </option>
          )}
        </Select>

        <h1 className="font-bold my-2"> اختر المحاضرة </h1>
        <Select
          className="my-2"
          placeholder={
            monthLoading ? "جار تحميل المحاضرات..." : " اختر المحاضرة "
          }
          size="lg"
          style={{ direction: "ltr" }}
          onChange={(e) => setLg_id(e.target.value)}
          disabled={monthLoading}
        >
          {months && months.monthcontent && months.monthcontent.length > 0 ? (
            months.monthcontent.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.description}
              </option>
            ))
          ) : (
            <option disabled> لا يوجد محاضرات متاحة </option>
          )}
        </Select>

        <div className="my-3">
          <h1 className="font-bold my-2">اسم الفيديو </h1>
          <Input
            placeholder="  اسم الفيديو "
            size="lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="my-3">
          <h1 className="font-bold my-2">رابط الفيديو </h1>
          <Input
            placeholder="  ادخل رابط الفيديو "
            size="lg"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center my-3">
        <Button colorScheme="blue" onClick={handleAddVideo}>
          {videoloading ? <Spinner /> : " اضافة فيديو "}
        </Button>
      </div>
    </div>
  );
};

export default AddVideo;
