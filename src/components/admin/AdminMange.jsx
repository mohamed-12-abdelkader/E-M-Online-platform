import {
  Button,
  Card,
  CardBody,
  Skeleton,
  Spinner,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import GitAllTeacher from "../../Hooks/teacher/GitAllTeacher";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";

import DeleateTeacher from "../../Hooks/admin/DeleateTeacher";

const AdminMange = () => {
  const [deleteLoading, deleteTeacher] = DeleateTeacher();

  const [loading, teachers] = GitAllTeacher();
  const cancelRef = React.useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  if (loading) {
    return (
      <Stack className="w-[90%] m-auto">
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }
  console.log(teachers);
  return (
    <div>
      {teachers.length === 0 ? (
        <div>
          <div className="w-[90%] border shadow h-[250px] m-auto my-8 flex justify-center items-center">
            <div className="ribbon">
              <h1 className="font-bold text-xl m-2">لا يوجد مدرسين الان !!!</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap w-[90%] m-auto my-5">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="w-[300px] border m-2">
              <CardBody>
                <img
                  src={teacher.image}
                  alt="Green double couch with wooden legs"
                  className="h-[220px] w-[100%]"
                />
                <div className="flex justify-between ">
                  <h1 color="blue.600" className="font-bold mt-2">
                    {teacher.name}
                  </h1>
                  <h1 color="blue.600" className="font-bold mt-2">
                    {teacher.subject}
                  </h1>
                </div>
              </CardBody>
              <hr className="w-[90%] m-auto" />
              <div className="flex justify-center  my-3">
                <Button
                  colorScheme="red"
                  variant="outline"
                  className="w-[90%] m-auto"
                  onClick={() => {
                    setSelectedTeacher(teacher); // Pass the ID of the selected teacher
                    onOpen();
                  }}
                >
                  حذف المدرس
                </Button>
                <AlertDialog
                  isOpen={isOpen}
                  leastDestructiveRef={cancelRef}
                  onClose={() => {
                    onClose();
                  }}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent className="p-3">
                      <h1 className="font-bold">حذف المدرس</h1>

                      {selectedTeacher && (
                        <>
                          <h1 className="font-bold m-3 text-xl">
                            - هل بالتأكيد تريد حذف {selectedTeacher.name}؟
                          </h1>

                          <div style={{ direction: "ltr" }}>
                            <Button
                              ref={cancelRef}
                              onClick={onClose}
                              className="m-1"
                            >
                              الغاء
                            </Button>
                            <Button
                              colorScheme="red"
                              ml={3}
                              className="m-1"
                              onClick={() => {
                                deleteTeacher(selectedTeacher.id);
                              }}
                            >
                              {deleteLoading ? <Spinner /> : "نعم حذف "}
                            </Button>
                          </div>
                        </>
                      )}
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMange;
