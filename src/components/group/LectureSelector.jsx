import { Select, Button, Spinner } from "@chakra-ui/react";

const LectureSelector = ({
  classesLoading,
  classes,
  setGrad,
  lectureCenterLoading,
  monthesCenter,
  setm_id,
  handleOpenLecture,
  loadingOpen,
  g_id,
  m_id,
}) => (
  <div>
    <Select
      className="my-2"
      placeholder={classesLoading ? "جار تحميل الصفوف..." : "اختر صف الكورس"}
      size="lg"
      style={{ direction: "ltr" }}
      disabled={classesLoading}
      onChange={(e) => setGrad(e.target.value)}
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
    <Select
      className="my-2"
      placeholder={
        lectureCenterLoading ? "جار تحميل الكورسات..." : "اختر الكورس"
      }
      size="lg"
      style={{ direction: "ltr" }}
      onChange={(e) => setm_id(e.target.value)}
      disabled={lectureCenterLoading}
    >
      {lectureCenterLoading ? (
        <option disabled>Loading...</option>
      ) : monthesCenter.length > 0 ? (
        monthesCenter.map((lecture) => (
          <option key={lecture.id} value={lecture.id}>
            {lecture.description}
          </option>
        ))
      ) : (
        <option disabled> لا يوجد كورسات متاحة </option>
      )}
    </Select>
    <div className="text-center">
      <Button
        colorScheme="blue"
        onClick={handleOpenLecture}
        isDisabled={!g_id || !m_id}
      >
        {loadingOpen ? <Spinner /> : "فتح المحاضرة"}
      </Button>
    </div>
  </div>
);

export default LectureSelector;
