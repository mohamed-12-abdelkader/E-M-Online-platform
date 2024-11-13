import { Button, Input, Select, Spinner } from "@chakra-ui/react";

import GitClasses from "../../../Hooks/teacher/GitClasses";
import GitGroup from "../../../Hooks/groups/GitGroup";
import JoinStudent from "../../../Hooks/teacher/JoinStudent";

const AddStudent = () => {
  const [classesLoading, classes] = GitClasses();

  const [loading, id, setMail, grad_id, setGrad, setGroup, handleAddStudent] =
    JoinStudent();

  const [groupsLoading, groups] = GitGroup({ id: grad_id });

  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-xl"> اضافة طالب للمجموعة </h1>
      </div>
      <div className="my-9">
        <h1 className="my-3 font-bold"> ادخل كود الطالب </h1>
        <Input
          type="number"
          placeholder=" كود  الطالب   "
          size="lg"
          value={id}
          onChange={(e) => {
            setMail(e.target.value);
          }}
        />
        <h1 className="my-3 font-bold"> اختر صف المجموعة </h1>
        <Select
          className="my-2"
          placeholder={
            classesLoading ? "جار تحميل المجموعات ..." : " اختر صف المجموعة  "
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
        <h1 className="my-3 font-bold"> اختر المجموعة </h1>
        <Select
          className="my-2"
          placeholder={
            classesLoading ? "جار تحميل المجموعات ..." : " اختر  المجموعة  "
          }
          size="lg"
          style={{ direction: "ltr" }}
          onChange={(e) => {
            setGroup(e.target.value);
          }}
          disabled={groupsLoading}
        >
          {groupsLoading ? (
            <option disabled>Loading...</option>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.group_name}
              </option>
            ))
          ) : (
            <option disabled> لا يوجد مجموعات متاحة </option>
          )}
        </Select>
        <div className="my-3 text-center">
          <Button colorScheme="blue" onClick={handleAddStudent}>
            {" "}
            {loading ? <Spinner /> : " اضافة الطالب "}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
