import { Link } from "react-router-dom";
import { Button, Card, CardBody } from "@chakra-ui/react";
import { MdOutlineDeleteOutline } from "react-icons/md";

const LectureCard = ({ lecture, isTeacher, onOpen, setSelectedLecture }) => (
  <Card className="w-[300px] my-3 md:mx-3 w-[320px] m-2">
    <CardBody>
      <img
        src={lecture.image}
        className="h-[220px] w-[100%]"
        alt={lecture.description || lecture.group_description}
      />
      <div className="my-2"></div>
      <div className="flex justify-between mt-4">
        <div>
          <h1 className="font-bold">
            {lecture.description || lecture.group_description}
          </h1>
        </div>
        {lecture.group_description && (
          <h1 className="font-bold text-red-500">محاضرة سنتر</h1>
        )}
      </div>
    </CardBody>
    <hr />
    <div className="w-[100%]">
      {isTeacher ? (
        <div className="my-3 text-center flex">
          <Link to={`/lecture/${lecture.id}`} className="w-[50%] mx-1 m-auto">
            <Button
              colorScheme="blue"
              variant="outline"
              className="m-auto mx-1"
            >
              دخول للمحاضرة
            </Button>
          </Link>
          <Button
            colorScheme="red"
            variant="outline"
            className="w-[50%] mx-1 m-auto"
            onClick={() => {
              setSelectedLecture(lecture);
              onOpen();
            }}
          >
            <MdOutlineDeleteOutline />
          </Button>
        </div>
      ) : (
        <div className="my-3 text-center flex w-[100%]">
          {lecture.open ? (
            <Link to={`/lecture/${lecture.id}`} className="w-[100%] m-auto">
              <Button
                colorScheme="blue"
                variant="outline"
                className="w-[90%] m-auto"
              >
                دخول للمحاضرة
              </Button>
            </Link>
          ) : (
            <Button colorScheme="red" className="w-[90%] m-auto">
              يجب حل امتحان المحاضرة السابقة
            </Button>
          )}
        </div>
      )}
    </div>
  </Card>
);

export default LectureCard;
