import React, { useEffect, useState } from "react";
import {
  Button,
  Skeleton,
  useDisclosure,
  Spinner,
  Stack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import GitQuistion from "../../Hooks/student/GitQuistion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

import Question from "../../components/exam/Question";
import Pagination from "../../components/exam/Pagination ";
import ExamResult from "../../components/exam/ExamResult ";

const Exam = () => {
  const { examId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [questionsLoading, questions] = GitQuistion({ id: examId });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // استخدم قيمة افتراضية أثناء التحميل (60 دقيقة)
  const [time, setTime] = useState(60 * 60); // 60 دقيقة

  useEffect(() => {
    // عند تحميل questions?.time، قم بتحديث الوقت بالقيمة الحقيقية
    if (questions?.time) {
      setTime(questions.time * 60); // تحويل الدقائق إلى ثواني
    }
  }, [questions?.time]);

  const [warningVisible, setWarningVisible] = useState(false); // لإظهار الرسالة التحذيرية

  useEffect(() => {
    // إعداد العداد التنازلي
    const intervalId = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000); // تحديث كل ثانية

    // تنظيف العداد عند انتهاء المكون
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // عرض رسالة تحذيرية عند بقاء أقل من دقيقة
    if (time <= 60 && time > 0) {
      setWarningVisible(true);
    } else {
      setWarningVisible(false);
    }

    // تنفيذ الامتحان إذا انتهى الوقت
    if (time === 0) {
      handleSendExam();
    }
  }, [time]);

  // حساب الدقائق والثواني
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const token = localStorage.getItem("token");
  const examQuestions = questions?.questions || [];

  const currentQuestion = examQuestions[currentQuestionIndex];

  // وظائف المساعد
  const handleSelectAnswer = (questionId, selectedAnswer) => {
    const existingAnswerIndex = userAnswers.findIndex(
      (answer) => answer.qid === questionId
    );

    if (existingAnswerIndex === -1) {
      setUserAnswers((prevAnswers) => [
        ...prevAnswers,
        { qid: questionId, ans: selectedAnswer },
      ]);
    } else {
      setUserAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex].ans = selectedAnswer;
        return updatedAnswers;
      });
    }
  };

  const handleSendExam = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);

      const response = await baseUrl.post(
        `api/user/getResult`,
        {
          answers: userAnswers,
          exam_id: examId,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setResult(response.data);
      toast.success("تم إنهاء الامتحان بنجاح");
    } catch (error) {
      console.error("Error sending exam:", error);
      toast.error("فشل إرسال الامتحان");
    } finally {
      setLoading(false);
      onOpen();
    }
  };

  // التنقل بين الأسئلة
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handlePageChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  if (questionsLoading) {
    return (
      <div className="flex items-center" style={{ minHeight: "80vh" }}>
        <Stack>
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      </div>
    );
  }

  return (
    <div className="mt-[150px]" style={{ minHeight: "60vh" }}>
      {/* عرض نتيجة الامتحان */}
      <ExamResult
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        result={result}
      />

      {/* عرض رسالة تحذيرية إذا كان الوقت أقل من دقيقة */}
      {warningVisible && (
        <Alert status="warning" className="mb-4">
          <AlertIcon />
          تنبيه: أقل من دقيقة متبقية على انتهاء الامتحان!
        </Alert>
      )}

      {/* عرض عنوان الامتحان */}
      <div className="flex justify-center">
        <div className="ribbon2">
          <h1 className="font-bold mx-4 m-2 text-white">{questions.name}</h1>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="my-5 h-[100px] w-[180px] border shadow p-3 text-center">
          <h1 className="my-2 font-bold">وقت الامتحان </h1>
          <hr />
          <h1 className="font-bold my-3">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </h1>
        </div>
      </div>

      {/* عرض السؤال الحالي */}
      {currentQuestion ? (
        <Question
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          handleSelectAnswer={handleSelectAnswer}
        />
      ) : (
        <div>لا يوجد أسئلة</div>
      )}

      {/* عرض الباجنيشن والتنقل بين الصفحات */}
      <div className="my-5">
        <Pagination
          currentQuestionIndex={currentQuestionIndex}
          examQuestions={examQuestions}
          handlePreviousQuestion={handlePreviousQuestion}
          handleNextQuestion={handleNextQuestion}
          handlePageChange={handlePageChange}
        />
      </div>

      {/* زر إرسال الامتحان */}
      {currentQuestionIndex === examQuestions.length - 1 && (
        <div className="text-center my-3">
          <Button
            isDisabled={loading || userAnswers.length !== examQuestions.length}
            onClick={handleSendExam}
            colorScheme="blue"
            className="mt-4"
          >
            {loading ? <Spinner /> : "انهاء الامتحان"}
          </Button>
        </div>
      )}
      <ScrollToTop />
    </div>
  );
};

export default Exam;
