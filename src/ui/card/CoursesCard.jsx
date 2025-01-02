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
      className=' card w-[%] mx-2 my-3 md:w-[300px] md:mx-3 m-2'
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
          className='h-[220px] w-[300px]'
          alt='Course'
        />
        <div className='my-2'></div>
        <div className='flex w-[90%] justify-between flex-wrap my-4'>
          {type == "teacher" ? (
            <h1 className='font-bold'>{lectre.subject}</h1>
          ) : null}
          <h1 className='font-bold'>
            {" "}
            {lectre.name || lectre.description || lectre.title}{" "}
          </h1>
          {type == "subject_exam" ? (
            <>
              <h1 className='font-bold'>
                عدد الاسئلة :{lectre.questions_num}{" "}
              </h1>
              <h1 className='font-bold'>
                وقت الامتحان :{lectre.time_minutes}دقيقة{" "}
              </h1>
            </>
          ) : null}
          {type == "lecture" ||
          type == "subject_exam" ||
          type == "monthly_exam" ||
          type === "comp" ||
          type == "teacher" ? null : (
            <h1 className='font-bold'>عدد المحاضرات: {lectre.noflecture}</h1>
          )}

          {lectre.price || lectre.price === 0 ? (
            <div>
              <h1 className='font-bold'>
                السعر: <span className='text-red-500'>{lectre.price} جنية</span>
              </h1>
            </div>
          ) : null}

          {!(
            type === "lecture" ||
            type === "comp" ||
            type === "monthly_exam" ||
            type === "subject_exam" ||
            type == "teacher"
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
        {(isAdmin && type === "comp") ||
        type === "monthly_exam" ||
        type == "subject_exam" ? (
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
        {isTeacher && type == "teacher-course" ? (
          <Button colorScheme='red' onClick={handleDeleate}>
            حذف
          </Button>
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
      {type == "teacher" ? (
        <div>
          <hr />
          <div className='p-3' dir='rtl'>
            <h1 className='font-bold'>
              {" "}
              مدرس ال{lectre.subject} للثانوية العامة{" "}
            </h1>
          </div>
        </div>
      ) : (
        <div>
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
                  <Button
                    colorScheme='blue'
                    variant='outline'
                    className='w-full'
                  >
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
                  <Button
                    colorScheme='blue'
                    variant='outline'
                    className='w-full'
                  >
                    دخول للمحاضرة
                  </Button>
                </Link>
              </div>
            ) : type === "my_courses" ? (
              <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
                <Link to={href} className='w-[90%]'>
                  <Button
                    colorScheme='blue'
                    variant='outline'
                    className='w-full'
                  >
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
                    <Button
                      colorScheme='blue'
                      variant='outline'
                      className='w-full'
                    >
                      {type === "monthly_exam" || type === "subject_exam"
                        ? "دخول للامتحان"
                        : "دخول للكورس"}
                    </Button>
                  </Link>
                </div>
              )
            ) : type === "teacher_courses" ? (
              lectre.open ? (
                <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
                  <Link to={href} className='w-[90%]'>
                    <Button
                      colorScheme='blue'
                      variant='outline'
                      className='w-full'
                    >
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
            ) : lectre.open || isTeacher ? (
              <div className='flex justify-center items-center gap-2 w-[95%] m-auto'>
                <Link to={href} className='w-[90%]'>
                  <Button
                    colorScheme='blue'
                    variant='outline'
                    className='w-full'
                  >
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
                {type === "monthly_exam" ? "تفعيل الامتحان " : " تفعيل الكورس"}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
