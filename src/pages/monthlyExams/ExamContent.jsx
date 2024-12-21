import React from "react";
import {
  Box,
  Image,
  Text,
  Button,
  Stack,
  Card,
  CardBody,
  CardFooter,
  Flex,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdCheck, MdVisibility } from "react-icons/md";
import { Link } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
const ExamContent = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  // بيانات الامتحانات
  const exams = [
    {
      id: 1,
      name: "امتحان  اللغة العربية  ",
      image: "https://via.placeholder.com/150",
      pay: false,
    },
    {
      id: 2,
      name: "امتحان  اللغة الانجليزية ",
      image: "https://via.placeholder.com/150",
      pay: false,
    },
    {
      id: 3,
      name: "امتحان  الكيمياء ",
      image: "https://via.placeholder.com/150",
      pay: true,
    },
  ];

  // التعامل مع الايقونات مثل التعديل والحذف
  const handleEdit = (id) => {
    alert(`تعديل الامتحان رقم ${id}`);
  };

  const handleDelete = (id) => {
    alert(`حذف الامتحان رقم ${id}`);
  };

  const handleActivate = (id) => {
    alert(`تفعيل الامتحان رقم ${id}`);
  };

  const handleEnter = (id) => {
    alert(`دخول الامتحان رقم ${id}`);
  };

  return (
    <div className='w-[90%] m-auto'>
      <Box p={5}>
        <h1 className='font-bold my-3'> الامتحانات المتاحة </h1>
        <Flex wrap='wrap' gap={5}>
          {exams.map((exam) => (
            <Card
              key={exam.id}
              boxShadow='md'
              borderRadius='md'
              className='w-[270px] '
            >
              <div style={{}}>
                <Image
                  src={exam.image}
                  alt={exam.name}
                  borderRadius='md'
                  mb={4}
                  maxHeight='250px'
                  objectFit='cover'
                  width={"100%"}
                />
                <div className=' w-[90%] m-auto'>
                  <h1 className='font-bold'>{exam.name}</h1>
                </div>
              </div>

              {isAdmin ? (
                <div className='w-[85%] m-auto mt-3'>
                  <Flex gap={3} justifyContent='space-between' w='100%'>
                    <IconButton
                      icon={<MdEdit />}
                      onClick={() => handleEdit(exam.id)}
                      aria-label='تعديل'
                      colorScheme='blue'
                    />
                    <IconButton
                      icon={<MdDelete />}
                      onClick={() => handleDelete(exam.id)}
                      aria-label='حذف'
                      colorScheme='red'
                    />
                    <IconButton
                      icon={<MdCheck />}
                      onClick={() => handleActivate(exam.id)}
                      aria-label='تفعيل'
                      colorScheme='green'
                    />
                  </Flex>
                </div>
              ) : null}
              {exam.pay || isAdmin ? (
                <div className='flex justify-center my-2'>
                  <Link
                    className='w-[90%] m-auto'
                    to={`/exam_details/${exam.id}`}
                  >
                    <Button
                      type='submit'
                      colorScheme='blue'
                      className='w-[100%] m-auto'
                      mt={4}
                    >
                      دخول
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='flex justify-center my-2'>
                  <Button
                    type='submit'
                    colorScheme='red'
                    className='w-[90%] m-auto'
                    mt={4}
                  >
                    انتهى الوقت
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </Flex>
      </Box>
    </div>
  );
};

export default ExamContent;
