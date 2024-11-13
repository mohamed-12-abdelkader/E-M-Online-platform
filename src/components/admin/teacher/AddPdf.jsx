import { Button, Select, Input, Spinner } from "@chakra-ui/react";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitTeacherLecture from "../../../Hooks/teacher/GitTeacherLecture";
import { useState } from "react";

import useAddPdf from "../../../Hooks/teacher/AddPdf";
import GitTeacherMonth from "../../../Hooks/teacher/GitTeacherMonth";
import GitLecturMonth from "../../../Hooks/teacher/GitLecturMonth";

const AddPdf = () => {
  const [classesLoading, classes] = GitClasses();
  const [grad, setGrad] = useState("");
  const [m_id, setM_id] = useState("");
  const [
    videoloading,
    handleAddVideo,
    pdfPath,
    pdfname,
    setLg_id,
    setLo_id,
    setName,
    setVideo,
  ] = useAddPdf();
  //const [
  //  mergedLectures,
  //  lecturesCenter,
  //  lecturesOnline,
  //  lectureLoading,
  //  lectureCenterLoading,
  //] = GitTeacherLecture({ id: grad });
  const [monthes, monthesLoading, lectureCenterLoading, mergedLectures] =
    GitTeacherMonth({ id: grad });
  const [months, monthLoading] = GitLecturMonth({ id: m_id });

  return (
    <div className="p-5">
      <div className="text-center">
        <h1 className="font-bold text-xl"> اضافة pdf </h1>
      </div>
      <div>
        <h1 className="font-bold my-2"> اختر الصف الدراسى </h1>
        <Select
          className="my-2"
          placeholder={classesLoading ? "جار تحميل الصفوف..." : " اختر  الصف  "}
          size="lg"
          onChange={(e) => {
            setGrad(e.target.value);
          }}
          style={{ direction: "ltr" }}
          disabled={classesLoading}
        >
          {classesLoading ? (
            <option disabled>Loading...</option>
          ) : classes.length > 0 ? (
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
          <h1 className="font-bold my-2">اسم الملف </h1>
          <Input
            placeholder="  اسم الملف  "
            size="lg"
            value={pdfname}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="my-3">
          <h1 className="font-bold my-2">رابط الملف </h1>
          <Input
            placeholder="  ادخل رابط الملف  "
            size="lg"
            value={pdfPath}
            onChange={(e) => {
              setVideo(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="text-center my-3">
        <Button colorScheme="blue" onClick={handleAddVideo}>
          {videoloading ? <Spinner /> : " اضافة الملف   "}
        </Button>
      </div>
    </div>
  );
};

export default AddPdf;
