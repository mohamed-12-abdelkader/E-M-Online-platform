import { Button, Input, Select, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitTeacherLecture from "../../../Hooks/teacher/GitTeacherLecture";
import useAddExam from "../../../Hooks/teacher/AddExam";
import GitTeacherMonth from "../../../Hooks/teacher/GitTeacherMonth";
import GitLecturMonth from "../../../Hooks/teacher/GitLecturMonth";

const AddExam = () => {
  const [
    examloading,
    handleAddExam,
    number,
    name,
    time,
    setTime,
    setLg_id,
    setLo_id,
    setName,
    setNamber,
  ] = useAddExam();
  const [grad, setGrad] = useState("");
  const [m_id, setM_id] = useState("");
  //const [
  //  mergedLectures,
  //  lecturesCenter,
  //  lecturesOnline,
  //  lectureLoading,
  //  lectureCenterLoading,
  //] = GitTeacherLecture({ id: grad });
  const [classesLoading, classes] = GitClasses();
  const [monthes, monthesLoading, lectureCenterLoading, mergedLectures] =
    GitTeacherMonth({ id: grad });
  const [months, monthLoading] = GitLecturMonth({ id: m_id });
  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-xl"> انشاء امتحان </h1>
      </div>
      <div className="my-9">
        <h1 className="my-3 font-bold"> اختر صف الدراسى </h1>
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
        <h1 className="my-3 font-bold"> ادخل اسم الامتحان </h1>
        <Input
          placeholder="  اسم الامتحان    "
          size="lg"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <h1 className="my-3 font-bold"> عدد الاسئلة </h1>
        <Input
          placeholder="   عدد الاسئلة     "
          size="lg"
          value={number}
          onChange={(e) => {
            setNamber(e.target.value);
          }}
        />
        <h1 className="my-3 font-bold"> مدة الامتحان </h1>
        <Input
          placeholder="    مدة الامتحان      "
          size="lg"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
          }}
        />

        <div className="my-3 text-center">
          <Button colorScheme="blue" onClick={handleAddExam}>
            {" "}
            {examloading ? <Spinner /> : " اضافة امتحان  "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExam;
