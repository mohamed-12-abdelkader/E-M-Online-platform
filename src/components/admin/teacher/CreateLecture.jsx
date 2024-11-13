import { Select, Input, Button, Spinner } from "@chakra-ui/react";
import useAddLecture from "../../../Hooks/teacher/AddLecture";
import { useState } from "react";
import GitClasses from "../../../Hooks/teacher/GitClasses";

const CreateLecture = () => {
  const [type, setType] = useState("");
  const [classesLoading, classes] = GitClasses();
  const {
    image,

    description,
    setDescription,
    grad_id,
    setGrade,
    price,
    setPrice,
    loading,

    handleSubmit,
    onImageChange,
    img,
  } = useAddLecture();
  return (
    <div className="p-5 ">
      <div className="text-center">
        <h1 className="font-bold text-xl"> اضافة محاضرة </h1>
      </div>
      <div>
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
              اختر صورة <span style={{ color: "red" }}> المحاضرة</span>
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
        <h1 className="font-bold my-2"> اختر نوع المحاضرة </h1>
        <Select
          className="my-2"
          placeholder=" اختر نوع المحاضرة  "
          size="lg"
          style={{ direction: "ltr" }}
          onChange={(e) => {
            setType(e.target.value);
          }}
        >
          <option value={"center"}> محاضرة سنتر </option>
          <option value={"online"}> محاضرة اونلاين </option>
        </Select>
        <div className="my-3">
          <h1 className="font-bold my-2">اسم المحاضرة</h1>
          <Input
            placeholder="  اسم المحاضرة "
            size="lg"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </div>
        {type == "online" ? (
          <div className="my-3">
            <h1 className="font-bold my-2">سعر المحاضرة</h1>
            <Input
              placeholder="  سعر  المحاضرة "
              size="lg"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
            />
          </div>
        ) : null}

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
      </div>
      <div className="text-center my-3">
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={loading || !image || !description || !grad_id}
        >
          {loading ? <Spinner /> : " انشاء المحاضرة"}
        </Button>
      </div>
    </div>
  );
};

export default CreateLecture;
