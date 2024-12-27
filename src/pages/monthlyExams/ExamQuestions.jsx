import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";

const ExamQuestions = () => {
  const { id } = useParams();
  const [loading, responseData, error, handleStart] = useStartExam({ id: id });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    handleStart();
    // Set isDataLoaded to true once data is fetched
    if (responseData) {
      setIsDataLoaded(true);
    }
    console.log("Response Data:", responseData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseData]);
  console.log(id);
  {
    isDataLoaded ? console.log("loading") : console.log(responseData);
  }
  return <div>ExamQuestions</div>;
};

export default ExamQuestions;
