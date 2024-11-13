import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { FaFilePdf } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";

const PdfItem = ({ pdf, onDelete, isTeacher }) => (
  <div className="w-[100%] border shadow my-5 p-3 flex justify-between items-center">
    <h1 className="font-bold flex">
      <FaFilePdf className="text-red-500 m-1 mx-2" />
      {pdf.pdf_name}
    </h1>
    <div className="flex">
      <Link to={pdf.pdf_path}>
        <Button colorScheme="red" variant="outline" className="m-2">
          <FaFilePdf className="text-red-500" />
        </Button>
      </Link>
      {isTeacher && (
        <Button colorScheme="red" onClick={() => onDelete(pdf)} className="m-2">
          <MdOutlineDeleteOutline />
        </Button>
      )}
    </div>
  </div>
);

export default PdfItem;
