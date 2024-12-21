import { Badge, Button, Card, CardBody } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
import { MdDelete } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";

export const CoursesCard = ({
  lectre,
  type,
  href,
  onClick,
  handleDeleate,
  img,
  handleactive,
}) => {
  const [userData, isAdmin, isTeacher, student] = UserType();

  return (
    <Card
      key={lectre.id}
      className='w-[90%] mx-auto my-3 md:w-[320px] md:mx-3 m-2'
      style={{ border: "1px solid #ccc" }}
    >
      <CardBody>
        <img
          src={
            lectre.image ||
            lectre.assets?.[0]?.path ||
            img ||
            "default-image-path.jpg"
          }
          className='h-[220px] w-[100%]'
          alt='Course'
        />
        <div className='my-2'></div>
        <div className='flex justify-between flex-wrap my-4'>
          <h1 className='font-bold'> {lectre.description || lectre.name} </h1>

          <h1 className='font-bold'>عدد المحاضرات: {lectre.noflecture}</h1>

          {lectre.price || lectre.price === 0 ? (
            <div>
              <h1 className='font-bold'>
                السعر: <span className='text-red-500'>{lectre.price} جنية</span>
              </h1>
            </div>
          ) : null}
          {isAdmin && type === "subject_exam" ? (
            <div className='flex justify-center gap-2 -3'>
              <Button colorScheme='red' variant='solid' onClick={handleDeleate}>
                <MdDelete />
              </Button>

              <Button
                colorScheme='green'
                variant='solid'
                onClick={() => handleactive(lectre)}
              >
                <MdCheckCircle />
              </Button>
            </div>
          ) : (
            <div></div>
          )}

          {!(
            type === "lecture" ||
            type === "comp" ||
            type === "monthly_exam" ||
            type === "subject_exam"
          ) && (
            <div>
              {lectre.price || lectre.price === 0 ? (
                <h1 className='font-bold text-blue-500'>كورس اونلاين</h1>
              ) : (
                <h1 className='font-bold text-red-500'>كورس سنتر</h1>
              )}
            </div>
          )}
        </div>
        {(isAdmin && type === "comp") || type === "monthly_exam" ? (
          <div fontSize='sm' className='flex justify-between'>
            <div>
              <Badge
                colorScheme={
                  lectre.is_ready || lectre.is_available ? "green" : "red"
                }
              >
                {lectre.is_ready || lectre.is_available ? "جاهز" : "غير جاهز"}
              </Badge>
            </div>
            {isAdmin && (
              <div>
                <Button
                  className='mx-2'
                  colorScheme={lectre.is_ready ? "gray" : "green"}
                  onClick={() => handleactive(lectre)}
                >
                  {lectre.is_ready ? "تعطيل" : "تفعيل"}
                </Button>
                <Button colorScheme='red' onClick={handleDeleate}>
                  حذف
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {type === "comp" && (
          <div className='flex justify-between w-[100%] mt-2'>
            <h1>
              <strong>من:</strong>{" "}
              {new Date(lectre.start_at).toLocaleDateString("ar-EG")}
            </h1>
            <h1>
              <strong>إلى:</strong>{" "}
              {new Date(lectre.end_at).toLocaleDateString("ar-EG")}
            </h1>
          </div>
        )}
      </CardBody>
      <hr />
      <div className='my-3 text-center'>
        {type === "subject_exam" && lectre.completed ? (
          <Button
            colorScheme='red'
            variant='outline'
            className='w-[90%] m-auto'
            disabled
          >
            هذا الامتحان مكتمل
          </Button>
        ) : isAdmin ? (
          <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
            <Link to={href} className='w-[90%]'>
              <Button colorScheme='blue' variant='outline' className='w-full'>
                {type === "lecture"
                  ? "دخول للمحاضرة"
                  : type === "comp"
                  ? "دخول للمسابقة"
                  : type === "monthly_exam" || type === "subject_exam"
                  ? "دخول للامتحان"
                  : "دخول للكورس"}
              </Button>
            </Link>
          </div>
        ) : type === "lecture" ? (
          <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
            <Link to={href} className='w-[90%]'>
              <Button colorScheme='blue' variant='outline' className='w-full'>
                دخول للمحاضرة
              </Button>
            </Link>
          </div>
        ) : type === "my_courses" ? (
          <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
            <Link to={href} className='w-[90%]'>
              <Button colorScheme='blue' variant='outline' className='w-full'>
                دخول للكورس
              </Button>
            </Link>
          </div>
        ) : lectre.purchased || type === "subject_exam" ? (
          type === "subject_exam" && !lectre.is_ready ? (
            <Button colorScheme='red' variant='outline' className='w-[90%]'>
              الامتحان غير مفعل
            </Button>
          ) : (
            <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
              <Link to={href} className='w-[90%]'>
                <Button colorScheme='blue' variant='outline' className='w-full'>
                  {type === "monthly_exam" || type === "subject_exam"
                    ? "دخول للامتحان"
                    : "دخول للكورس"}
                </Button>
              </Link>
            </div>
          )
        ) : type === "teacher_courses" ? (
          lectre.purchased ? (
            <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
              <Link to={href} className='w-[90%]'>
                <Button colorScheme='blue' variant='outline' className='w-full'>
                  دخول للكورس
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              colorScheme='blue'
              variant='solid'
              className='w-[90%] m-auto'
              onClick={onClick}
            >
              شراء الكورس
            </Button>
          )
        ) : type === "teacher_courses" ||
          isTeacher ||
          (type == "freeCourses" && lectre.open) ? (
          <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
            <Link to={href} className='w-[90%]'>
              <Button colorScheme='blue' variant='outline' className='w-full'>
                دخول للكورس
              </Button>
            </Link>
          </div>
        ) : (
          <Button
            colorScheme='blue'
            variant='solid'
            className='w-[90%] m-auto'
            onClick={onClick}
          >
            {type === "monthly_exam" || type === "subject_exam"
              ? "تفعيل الامتحان"
              : "تفعيل الكورس"}
          </Button>
        )}
      </div>
    </Card>
  );
};
