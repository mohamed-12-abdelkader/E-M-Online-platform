import { Button, Input, Select, Spinner } from "@chakra-ui/react";

import GitClasses from "../../../Hooks/teacher/GitClasses";

import useCreateGroup from "../../../Hooks/teacher/CreateGroup";

const CreateGroup = () => {
  const [
    loading,
    grad_id,
    setGrad,
    group_name,
    setGroupName,
    handleCreateGroup,
  ] = useCreateGroup();

  const [classesLoading, classes] = GitClasses();

  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-xl">انشاء مجموعة جديدة </h1>
      </div>
      <div className="my-9">
        <h1 className="my-3 font-bold"> ادخل اسم المجموعة </h1>
        <Input
          placeholder="اسم المجموعة  "
          size="lg"
          value={group_name}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
        <h1 className="my-3 font-bold"> اختر صف المجموعة </h1>
        <Select
          className="my-2"
          placeholder={
            classesLoading ? "جار تحميل الصفوف..." : " اختر صف المحاضرة "
          }
          size="lg"
          style={{ direction: "ltr" }}
          onChange={(e) => {
            setGrad(e.target.value);
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
        <div className="my-3 text-center">
          <Button
            colorScheme="blue"
            onClick={handleCreateGroup}
            isDisabled={!grad_id || !group_name || loading}
          >
            {" "}
            {loading ? <Spinner /> : "انشاء مجموعة "}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
