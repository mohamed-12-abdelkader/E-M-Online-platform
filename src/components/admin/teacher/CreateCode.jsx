import React, { useState } from "react";
import useCreateCode from "../../../Hooks/teacher/useCreateCode";
import { Button, Input, Select, Spinner } from "@chakra-ui/react";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitTeacherMonth from "../../../Hooks/teacher/GitTeacherMonth";

const CreateCode = () => {
  const [loading, handleAddcode, setm_id, number, setnumber] = useCreateCode();
  const [classesLoading, classes] = GitClasses();
  const [grad_id, setGrade] = useState("");
  const [monthes, monthesLoading, lectureCenterLoading, mergedLectures] =
    GitTeacherMonth({ id: grad_id });
  const handleNChange = (e) => {
    setnumber(e.target.value);
  };
  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-xl ">انشاء اكواد للكورسات </h1>
      </div>
      <h1 className="font-bold my-2"> اختر صف المحاضرة </h1>
      <Select
        className="my-2"
        placeholder={
          classesLoading ? "جار تحميل الصفوف..." : " اختر صف المحاضرة "
        }
        size="lg"
        style={{ direction: "ltr" }}
        onChange={(e) => {
          setGrade(e.target.value);
        }}
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
        onChange={(e) => {
          setm_id(e.target.value);
        }}
        disabled={lectureCenterLoading || monthesLoading}
      >
        {!monthes ? (
          <option disabled>Loading...</option>
        ) : monthes.length > 0 ? (
          monthes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.description}
            </option>
          ))
        ) : (
          <option disabled> لا يوجد شهور دراسية متاحة </option>
        )}
      </Select>
      <Input
        className="my-3 mt-5"
        placeholder="عدد الاكواد "
        size="lg"
        value={number}
        onChange={handleNChange}
      />
      <div className="text-center my-3">
        <Button colorScheme="blue" onClick={handleAddcode}>
          {loading ? <Spinner /> : " انشاء الاكواد "}
        </Button>
      </div>
    </div>
  );
};

export default CreateCode;
