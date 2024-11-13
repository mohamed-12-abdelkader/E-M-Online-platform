import GitClasses from "../../Hooks/teacher/GitClasses";
import { Box, Skeleton, Stack } from "@chakra-ui/react";
import { Link, Outlet } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { useState } from "react";

const MyGroups = () => {
  const [classesLoading, classes] = GitClasses();
  const [selectedClassId, setSelectedClassId] = useState(null);

  if (classesLoading) {
    return (
      <Stack className="w-[90%] m-auto" style={{ minHeight: "75vh" }}>
        <div className="flex justify-center">
          <div className="ribbon">
            <h1 className="font-bold m-4 text-xl text-center">مجموعاتى</h1>
          </div>
        </div>
        <Skeleton height="20px" className="mt-5" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handleClassClick = (classId) => {
    // تحديث حالة الصف المختار
    setSelectedClassId(classId);
  };

  return (
    <div className="mt-[150px]" style={{ minHeight: "60vh" }}>
      <div className="border shadow w-[90%] m-auto">
        <div className="flex justify-center my-5">
          <div className="ribbon">
            <h1 className="font-bold m-4 mx-9 text-xl text-center">مجموعاتى</h1>
          </div>
        </div>
        <div>
          {classes ? (
            <div className="grid justify-center md:flex">
              {classes.map((classe) => {
                const isSelected = selectedClassId === classe.id;

                return (
                  <Link
                    key={classe.id}
                    to={`group/${classe.id}`}
                    onClick={() => handleClassClick(classe.id)}
                  >
                    <Box
                      cursor="pointer"
                      borderWidth="1px"
                      borderRadius="md"
                      boxShadow="md"
                      px={5}
                      py={3}
                      className="m-2"
                      bg={isSelected ? "#00204a" : "white"} // تغيير لون الخلفية إذا كان الصف مختارًا
                      color={isSelected ? "white" : "black"} // تغيير لون النص إذا كان الصف مختارًا
                      borderColor={isSelected ? "#00204a" : "gray.300"}
                    >
                      مجموعات الصف {classe.name}
                    </Box>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <Outlet />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default MyGroups;
