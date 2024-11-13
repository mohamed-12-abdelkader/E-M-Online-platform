import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { FaFileVideo } from "react-icons/fa";
import { GoVideo } from "react-icons/go";
import { MdDelete } from "react-icons/md";

const VideoItem = ({ video, onDelete, isTeacher }) => (
  <div className="w-[100%] border shadow my-5 p-3 flex justify-between items-center">
    <h1 className="font-bold flex">
      <FaFileVideo className="m-1 mx-2 text-blue-500" />
      {video.v_name}
    </h1>
    <div className="flex">
      <Link to={`/video/${video.id}`}>
        <Button colorScheme="blue" className="m-2">
          <GoVideo />
        </Button>
      </Link>
      {isTeacher && (
        <Button
          colorScheme="red"
          onClick={() => onDelete(video)}
          className="m-2"
        >
          <MdDelete />
        </Button>
      )}
    </div>
  </div>
);

export default VideoItem;
