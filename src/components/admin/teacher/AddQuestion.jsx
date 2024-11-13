import { Button, Input, Select, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import avatar from "../../../img/th.jpeg";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitExam from "../../../Hooks/teacher/GitExam";
import useAddQuestion from "../../../Hooks/teacher/AddQuestion";
const AddQuestion = () => {
  const [classesLoading, classes] = GitClasses();
  const [grad, setGrad] = useState("");
  const [exams, examsLoading] = GitExam({ id: grad });

  const [
    onImageChange,
    image,
    setExam,
    question,
    setQuestion,
    answer1,
    setAnswer1,
    answer2,
    setAnswer2,
    answer3,
    setAnswer3,
    answer4,
    setAnswer4,
    degree,
    setDegree,
    correctAnswer,
    setCorrect,
    loading,
    img,
    handleSubmit,
  ] = useAddQuestion();
  console.log(exams);
  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-xl"> اضافة سؤال </h1>
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

        <h1 className="my-3 font-bold"> اختر الامتحان </h1>
        <Select
          className="my-2"
          placeholder={
            examsLoading ? "جار تحميل الامتحانات ..." : " اختر  الامتحان   "
          }
          size="lg"
          onChange={(e) => {
            setExam(e.target.value);
          }}
          style={{ direction: "ltr" }}
          disabled={examsLoading}
        >
          {examsLoading ? (
            <option disabled>Loading...</option>
          ) : exams.length > 0 ? (
            exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))
          ) : (
            <option disabled> لا يوجد امتحانات متاحة </option>
          )}
        </Select>
        <div style={{ margin: "10px 0", width: "100%" }}>
          <label
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            htmlFor="upload-photo"
          >
            <h5 className="font-bold">
              {" "}
              اختر صورة <span style={{ color: "red" }}> للسؤال </span> (اختيارى
              )
            </h5>
            <img
              src={img}
              style={{ height: "150px", width: "150px", cursor: "pointer" }}
            />
          </label>
          <input
            type="file"
            name="photo"
            id="upload-photo"
            style={{ display: "none" }}
            onChange={onImageChange}
          />
        </div>
        <h1 className="my-3 font-bold"> ادخل السؤال </h1>
        <Input
          placeholder="   ادخل السؤال     "
          size="lg"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <div>
          <h1 className="my-3 font-bold"> ادخل الاجابات </h1>
          <div className=" md:flex ">
            <Input
              className="w-[25%] m-2"
              placeholder=" الاجابة الاولى        "
              size="lg"
              value={answer1}
              onChange={(e) => {
                setAnswer1(e.target.value);
              }}
            />
            <Input
              className="w-[25%] m-2"
              placeholder=" الاجابة الثانية    "
              size="lg"
              value={answer2}
              onChange={(e) => {
                setAnswer2(e.target.value);
              }}
            />
            <Input
              className="w-[25%] m-2"
              placeholder=" الاجابة الثالثة    "
              size="lg"
              value={answer3}
              onChange={(e) => {
                setAnswer3(e.target.value);
              }}
            />
            <Input
              className="w-[25%] m-2"
              placeholder=" الاجابة الرابعة     "
              size="lg"
              value={answer4}
              onChange={(e) => {
                setAnswer4(e.target.value);
              }}
            />
          </div>
        </div>
        <h1 className="my-3 font-bold"> رقم الاجابة الصحيحة </h1>
        <Input
          className="w-[25%] m-2"
          placeholder="  رقم الاجابة الصحيحة         "
          size="lg"
          value={correctAnswer}
          onChange={(e) => {
            setCorrect(e.target.value);
          }}
        />

        <div className="my-3 text-center">
          <Button colorScheme="blue" onClick={handleSubmit}>
            {" "}
            {loading ? <Spinner /> : "اضافة سؤال  "}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
