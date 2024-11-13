import React from "react";
import { Zoom } from "react-awesome-reveal";
import { Card, CardBody, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const LectureCard = ({ lecture, onOpen, setSelectedLecture }) => (
  <Zoom key={lecture.id}>
    <Card
      className="w-[330px] my-3 md:mx-5 m-2"
      style={{ border: "solid 2px #ccc" }}
    >
      <CardBody>
        <img
          src={lecture.image}
          className="h-[220px] w-[100%]"
          alt="Lecture image"
        />
        <div className="my-2 flex justify-between">
          <h1 className="font-bold text-blue-500">{lecture.description}</h1>
        </div>
        <div className="flex justify-between mt-4">
          <h1 className="font-bold">عدد المحاضرات :{lecture.noflecture}</h1>
          <h1 className="font-bold">{lecture.price} جنية</h1>
        </div>
      </CardBody>
      <hr />
      <div className="my-3 text-center">
        {lecture.open ? (
          <Link to={`/month/${lecture.id}`}>
            <Button
              colorScheme="blue"
              variant="outline"
              className="w-[90%] m-auto"
            >
              دخول للكورس
            </Button>
          </Link>
        ) : (
          <Button
            variant="solid"
            colorScheme="blue"
            className="w-[90%] m-auto"
            onClick={() => {
              setSelectedLecture(lecture);
              onOpen();
            }}
          >
            شراء الكورس
          </Button>
        )}
      </div>
    </Card>
  </Zoom>
);

export default LectureCard;
