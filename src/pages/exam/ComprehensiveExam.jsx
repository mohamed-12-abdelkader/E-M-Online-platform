import React, { useEffect, useState, useRef } from "react";
import {
  Box, VStack, Heading, Text, Spinner, Center, RadioGroup, Radio, Stack,
  Alert, AlertIcon, Badge, IconButton, HStack, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Divider, Checkbox, CheckboxGroup, Image, FormControl, FormLabel,
  Icon
} from "@chakra-ui/react";
// استبدال أيقونات chakra-ui بأيقونات react-icons
import { AiFillEdit, AiFillDelete, AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineCloseCircle, AiFillStar, AiFillPicture } from "react-icons/ai";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import baseUrl from "../../api/baseUrl";
import { useParams } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";

const ComprehensiveExam = () => {
  const { id } = useParams();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, question: null });
  const [editForm, setEditForm] = useState({ text: "", choices: [], image: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, qid: null });
  const toast = useToast();
  const [studentAnswers, setStudentAnswers] = useState({}); // { [questionId]: choiceId }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  // State لعرض درجات الطلاب
  const [showGrades, setShowGrades] = useState(false);
  const [gradesData, setGradesData] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  // State للتنقل بين الأسئلة 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State لعرض/إخفاء الباجنيشن
  const [showPagination, setShowPagination] = useState(false);
  // States للامتحان الجديد
  const [examData, setExamData] = useState(null);
  const [examStatus, setExamStatus] = useState(null); // hidden, not_open_yet, closed, already_submitted, ready
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [startingAttempt, setStartingAttempt] = useState(false);
  // State لإضافة الأسئلة كصور
  const [addImageModal, setAddImageModal] = useState({ open: false });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  // State لإضافة صورة لسؤال محدد
  const [addQuestionImageModal, setAddQuestionImageModal] = useState({ open: false, questionId: null });
  const [selectedQuestionImage, setSelectedQuestionImage] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState('');
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);
  // State لتقارير الامتحان
  const [examReport, setExamReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // جلب درجات الطلاب
  const fetchGrades = async () => {
    setGradesLoading(true);
    setGradesError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/course/lecture-exam/${id}/submissions`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setGradesData(res.data.submissions || []);
      setShowGrades(true);
    } catch (err) {
      setGradesError("حدث خطأ أثناء تحميل الدرجات");
    } finally {
      setGradesLoading(false);
    }
  };

  // جلب تقرير الامتحان
  const fetchExamReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/exams/${id}/report`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setExamReport(res.data);
      setShowReportModal(true);
    } catch (err) {
      console.error('Error fetching exam report:', err);
      setReportError(err.response?.data?.message || "حدث خطأ أثناء تحميل التقرير");
      toast({
        title: "خطأ في تحميل التقرير",
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setReportLoading(false);
    }
  };

  // استخدام useRef لتتبع الـ ID السابق
  const prevExamIdRef = useRef(null);

  useEffect(() => {
    if (id) {
      // التحقق من أن الـ ID تغير فعلياً
      if (prevExamIdRef.current !== null && prevExamIdRef.current !== id) {
        // إعادة تعيين جميع الـ states عند تغيير الامتحان
        setQuestions([]);
        setExamData(null);
        setExamStatus(null);
        setCurrentAttempt(null);
        setRemainingSeconds(null);
        setAttemptHistory([]);
        setFeedback(null);
        setError(null);
        setStudentAnswers({});
        setSubmitResult(null);
        setCurrentQuestionIndex(0);
      }
      
      // تحديث الـ ref
      prevExamIdRef.current = id;
      
      // الانتظار حتى يكون isTeacher و isAdmin جاهزين
      if (isTeacher !== undefined && isAdmin !== undefined) {
        fetchExamData();
      }
    }
    // eslint-disable-next-line
  }, [id, isTeacher, isAdmin]);

  // عداد الوقت للمحاولة النشطة
  useEffect(() => {
    if (currentAttempt && currentAttempt.remainingSeconds > 0 && student && !isTeacher && !isAdmin) {
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // عند انتهاء الوقت، تحديث البيانات
            fetchExamData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentAttempt, student, isTeacher, isAdmin]);

  // دالة لترتيب الأسئلة عشوائياً
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // جلب بيانات الامتحان
  const fetchExamData = async () => {
    if (!id) {
      return;
    }

    const currentExamId = id; // حفظ الـ ID الحالي للتحقق من race conditions
    
    try {
      setLoading(true);
      setError(null);
      // إعادة تعيين الأسئلة فقط إذا تغير الـ ID
      if (prevExamIdRef.current !== null && prevExamIdRef.current !== currentExamId) {
        setQuestions([]);
      }
      
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/exams/${currentExamId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      // التحقق من أن الـ ID لم يتغير أثناء الطلب
      if (currentExamId !== id) {
        return;
      }
      
      const data = res.data;
      setExamData(data.exam);
      setExamStatus(data.status);
      setCurrentAttempt(data.attempt || null);
      setRemainingSeconds(data.attempt?.remainingSeconds || null);
      setAttemptHistory(data.attemptHistory || []);
      setFeedback(data.feedback || null);
      
      // للمدرسين والإداريين: جلب الأسئلة من نفس API response
      if (isTeacher || isAdmin) {
        let questionsFound = false;
        
        // أولاً: التحقق من data.questions (المستوى العلوي) - هذا هو المكان الصحيح
        if (data.questions && Array.isArray(data.questions)) {
          // تنظيف وتنسيق الأسئلة
          const formattedQuestions = data.questions.map(q => ({
            id: q.id,
            text: q.text || null,
            image: q.image || null,
            grade: q.grade || 1,
            choices: Array.isArray(q.choices) ? q.choices.map(c => ({
              id: c.id,
              text: c.text || '',
              is_correct: c.is_correct || false
            })) : []
          }));
          
          if (formattedQuestions.length > 0) {
            setQuestions(formattedQuestions);
            questionsFound = true;
          }
        } 
        // ثانياً: التحقق من exam.questions
        else if (data.exam && data.exam.questions && Array.isArray(data.exam.questions)) {
          const formattedQuestions = data.exam.questions.map(q => ({
            id: q.id,
            text: q.text || null,
            image: q.image || null,
            grade: q.grade || 1,
            choices: Array.isArray(q.choices) ? q.choices.map(c => ({
              id: c.id,
              text: c.text || '',
              is_correct: c.is_correct || false
            })) : []
          }));
          
          if (formattedQuestions.length > 0) {
            setQuestions(formattedQuestions);
            questionsFound = true;
          }
        } 
        // ثالثاً: التحقق من feedback.wrongQuestions
        else if (data.feedback && data.feedback.wrongQuestions && Array.isArray(data.feedback.wrongQuestions)) {
          const questionsFromFeedback = data.feedback.wrongQuestions.map(wq => ({
            id: wq.questionId,
            text: wq.questionText || null,
            image: wq.questionImage || null,
            choices: Array.isArray(wq.choices) ? wq.choices : [],
            correctChoice: wq.correctChoice,
            yourChoice: wq.yourChoice
          }));
          
          if (questionsFromFeedback.length > 0) {
            setQuestions(questionsFromFeedback);
            questionsFound = true;
          }
        }
        
        // إذا لم تكن موجودة، استخدم endpoint منفصل كبديل
        if (!questionsFound) {
          await fetchQuestionsForTeacher();
        }
      } else {
        // للطلاب: الأسئلة تأتي مع المحاولة أو من feedback
        if (data.status === 'ready' && data.attempt) {
          // إذا كانت هناك محاولة نشطة، الأسئلة يجب أن تأتي من endpoint منفصل
          await fetchQuestionsForStudent();
        } else if (data.feedback && data.feedback.wrongQuestions) {
          // إذا كان هناك feedback، نستخدم الأسئلة من هناك
          const questionsFromFeedback = data.feedback.wrongQuestions.map(wq => ({
            id: wq.questionId,
            text: wq.questionText,
            image: wq.questionImage || null,
            choices: [] // سيتم ملؤها لاحقاً
          }));
          setQuestions(questionsFromFeedback);
        }
      }
      
      // عرض رسالة حسب الحالة
      if (data.message) {
        toast({
          title: data.message,
          status: data.status === 'ready' ? 'info' : 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      // التحقق من أن الـ ID لم يتغير أثناء الطلب
      if (currentExamId !== id) {
        return;
      }
      
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات الامتحان";
      setError(errorMessage);
      setQuestions([]); // إعادة تعيين الأسئلة في حالة الخطأ
      
      toast({
        title: "خطأ في تحميل الامتحان",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // التحقق من أن الـ ID لم يتغير قبل إيقاف الـ loading
      if (currentExamId === id) {
        setLoading(false);
      }
    }
  };

  // جلب الأسئلة للمدرس
  const fetchQuestionsForTeacher = async () => {
    if (!id) {
      return;
    }

    const currentExamId = id; // حفظ الـ ID الحالي للتحقق من race conditions
    
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/questions/lecture-exam/${currentExamId}/details`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      // التحقق من أن الـ ID لم يتغير أثناء الطلب
      if (currentExamId !== id) {
        return;
      }
      
      const questionsData = res.data.questions || [];
      
      // تنظيف وتنسيق الأسئلة
      const formattedQuestions = questionsData.map(q => ({
        id: q.id,
        text: q.text || null,
        image: q.image || null,
        grade: q.grade || 1,
        choices: Array.isArray(q.choices) ? q.choices.map(c => ({
          id: c.id,
          text: c.text || '',
          is_correct: c.is_correct || false
        })) : []
      }));
      
      setQuestions(formattedQuestions);
    } catch (err) {
      // التحقق من أن الـ ID لم يتغير أثناء الطلب
      if (currentExamId !== id) {
        return;
      }
      
      toast({
        title: "خطأ في جلب الأسئلة",
        description: err.response?.data?.message || "حدث خطأ أثناء تحميل الأسئلة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setQuestions([]); // إعادة تعيين الأسئلة في حالة الخطأ
    }
  };

  // جلب الأسئلة للطالب
  const fetchQuestionsForStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/questions/lecture-exam/${id}/details`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      const questionsData = res.data.questions || [];
      // ترتيب الأسئلة عشوائياً للطلاب
      setQuestions(shuffleArray(questionsData));
    } catch (err) {
      console.error('Error fetching questions for student:', err);
    }
  };

  // بدء محاولة جديدة
  const startAttempt = async () => {
    setStartingAttempt(true);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.post(
        `/api/exams/${id}/start`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      const attemptData = res.data;
      setCurrentAttempt(attemptData);
      setRemainingSeconds(attemptData.remainingSeconds);
      setExamStatus('ready');
      
      // جلب الأسئلة بعد بدء المحاولة
      await fetchQuestionsForStudent();
      
      toast({
        title: "تم بدء المحاولة بنجاح",
        description: attemptData.timeLimitMinutes ? `المدة: ${attemptData.timeLimitMinutes} دقيقة` : "بدون مدة محددة",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error starting attempt:', err);
      toast({
        title: "فشل بدء المحاولة",
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStartingAttempt(false);
    }
  };

  // Delete question
  const handleDelete = async () => {
    if (!deleteModal.qid) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/questions/lecture-exam-question/${deleteModal.qid}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      // حذف السؤال محلياً
      setQuestions((prev) => prev.filter((q) => q.id !== deleteModal.qid));
      toast({ title: "تم حذف السؤال", status: "success" });
      setDeleteModal({ open: false, qid: null });
    } catch {
      toast({ title: "فشل الحذف", status: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const openEditModal = (q) => {
    setEditForm({
      text: q.text,
      choices: q.choices.map((c) => ({ ...c })),
      image: q.image || ""
    });
    setImagePreview(q.image || '');
    setSelectedFile(null);
    setEditModal({ open: true, question: q });
  };

  // Handle edit form change
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file change for question image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChoiceChange = (idx, value) => {
    setEditForm((prev) => {
      const choices = [...prev.choices];
      choices[idx].text = value;
      return { ...prev, choices };
    });
  };

  // Save edit
  const handleEditSave = async () => {
    const { question } = editModal;
    try {
      const token = localStorage.getItem("token");
      
      let requestData;
      let config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // إنشاء FormData إذا كان هناك ملف محدد
      if (selectedFile) {
        // تحويل الصورة إلى base64 وإرسالها كـ JSON
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(selectedFile);
        });
        
        requestData = {
          text: editForm.text,
          choices: editForm.choices.map((c) => ({ id: c.id, text: c.text })),
          image: base64Image
        };
        config.headers['Content-Type'] = 'application/json';
        console.log("Sending JSON with base64 image");
      } else {
        requestData = { 
          text: editForm.text, 
          choices: editForm.choices.map((c) => ({ id: c.id, text: c.text })),
          image: editForm.image // إرسال رابط الصورة إذا كان موجوداً
        };
        config.headers['Content-Type'] = 'application/json';
        console.log("Sending JSON with URL image");
      }
      
      console.log("API Endpoint:", `/api/questions/lecture-exam-question/${question.id}`);
      console.log("Request Data:", requestData);
      
      let response;
      
      // إذا كان هناك ملف جديد، جرب رفعه أولاً
      if (selectedFile) {
        try {
          // محاولة رفع الصورة إلى endpoint منفصل
          const imageFormData = new FormData();
          imageFormData.append('image', selectedFile);
          
          const imageResponse = await baseUrl.post(
            '/api/upload/image', // أو أي endpoint مناسب لرفع الصور
            imageFormData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                // لا نضيف Content-Type للـ FormData
              } 
            }
          );
          
          console.log("Image upload response:", imageResponse.data);
          
          // إذا نجح رفع الصورة، استخدم الرابط في تحديث السؤال
          if (imageResponse.data.image_url) {
            requestData.image = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.log("Image upload failed, using base64:", imageError);
          // إذا فشل رفع الصورة، استخدم base64
        }
      }
      
      response = await baseUrl.patch(
        `/api/questions/lecture-exam-question/${question.id}`,
        requestData,
        config
      );
      
      console.log("Response:", response.data);
      
      // عدل السؤال محلياً
      setQuestions((prev) => prev.map((q) =>
        q.id === question.id
          ? { 
              ...q, 
              text: editForm.text, 
              choices: editForm.choices.map((c) => ({ ...c })),
              image: response.data.image || imagePreview || editForm.image
            }
          : q
      ));
      
      toast({ title: "تم التعديل بنجاح", status: "success" });
      setEditModal({ open: false, question: null });
      setSelectedFile(null);
      setImagePreview('');
    } catch (error) {
      console.error("Error updating question:", error);
      console.error("Error response:", error.response?.data);
      toast({ 
        title: "فشل التعديل", 
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
    }
  };

  // Set correct answer
  const [pendingCorrect, setPendingCorrect] = useState({}); // { [qid]: cid }
  const handleSetCorrect = async (qid, cid) => {
    // أظهر مباشرةً أن هذا هو الاختيار الحالي
    setPendingCorrect((prev) => ({ ...prev, [qid]: cid }));
    // عدل محلياً
    setQuestions((prev) => prev.map((q) =>
      q.id === qid
        ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: c.id === cid })) }
        : q
    ));
    try {
      const token = localStorage.getItem("token");
      await baseUrl.patch(
        `/api/questions/lecture-exam-question/${qid}/answer`,
        { correct_answer: cid },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      toast({ title: "تم تحديد الإجابة الصحيحة", status: "success" });
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    } catch (error) {
      console.error("Error setting correct answer:", error);
      toast({ 
        title: "فشل تحديد الإجابة", 
        description: error.response?.data?.message || "حدث خطأ أثناء تحديد الإجابة الصحيحة",
        status: "error" 
      });
      // أعد الحالة كما كانت
      setQuestions((prev) => prev.map((q) =>
        q.id === qid
          ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: false })) }
          : q
      ));
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    }
  };

  // للطالب: عند اختيار إجابة
  const handleStudentChoice = (qid, cid) => {
    setStudentAnswers((prev) => ({ ...prev, [qid]: cid }));
  };

  // دوال التنقل بين الأسئلة
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // للطالب: تسليم الامتحان
  const handleSubmitExam = async () => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const answersArr = Object.entries(studentAnswers).map(([questionId, choiceId]) => ({
        questionId: Number(questionId),
        choiceId: Number(choiceId),
      }));
      const res = await baseUrl.post(
        `/api/exams/${id}/submit`,
        { answers: answersArr },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      const result = res.data;
      setSubmitResult({
        attemptId: result.attemptId,
        status: result.status,
        totalGrade: result.totalGrade,
        maxGrade: result.maxGrade,
        passed: result.passed,
        wrongQuestions: result.wrongQuestions || [],
        releaseReason: result.releaseReason,
        showAnswers: result.showAnswers
      });
      
      // تحديث حالة الامتحان
      setExamStatus(result.status === 'submitted' || result.status === 'late' ? 'already_submitted' : examStatus);
      setCurrentAttempt(null);
      setRemainingSeconds(null);
      
      // إذا كان هناك feedback، تحديثه
      if (result.wrongQuestions && result.wrongQuestions.length > 0) {
        setFeedback({
          wrongQuestions: result.wrongQuestions,
          releaseReason: result.releaseReason || 'immediate'
        });
      }
      
      toast({ 
        title: "تم تسليم الامتحان!", 
        description: `الدرجة: ${result.totalGrade}/${result.maxGrade}`,
        status: "success",
        duration: 4000,
        isClosable: true
      });
      
      // إعادة جلب بيانات الامتحان لتحديث الحالة
      await fetchExamData();
    } catch (err) {
      console.error('Error submitting exam:', err);
      toast({ 
        title: "فشل تسليم الامتحان", 
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // فتح مودال إضافة الصور
  const openAddImageModal = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setAddImageModal({ open: true });
  };

  // إغلاق مودال إضافة الصور
  const closeAddImageModal = () => {
    setAddImageModal({ open: false });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  // التعامل مع اختيار الصور
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    
    // التحقق من عدد الصور (حد أقصى 10)
    if (files.length > 10) {
      toast({
        title: "خطأ",
        description: "يمكن رفع حتى 10 صور فقط",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // التحقق من نوع الملفات
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملفات صورة صالحة (JPG, PNG, GIF)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // التحقق من حجم الملفات (حد أقصى 5MB لكل صورة)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "خطأ",
        description: "حجم كل صورة يجب أن يكون أقل من 5MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedImages(files);
    
    // إنشاء معاينة للصور
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // إزالة صورة من القائمة
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // تحرير الذاكرة
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // رفع الصور كأسئلة
  const uploadImagesAsQuestions = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صور أولاً",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploadingImages(true);
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append('exam_id', id);
      
      // إضافة كل صورة
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await baseUrl.post(
        '/api/questions/lecture-exam-question',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Images uploaded successfully:', response.data);
      
      toast({
        title: "تم رفع الصور بنجاح",
        description: `تم رفع ${selectedImages.length} صورة كأسئلة`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // إعادة تحميل الأسئلة
      if (isTeacher || isAdmin) {
        await fetchQuestionsForTeacher();
      } else {
        await fetchExamData();
      }
      
      // إغلاق المودال
      closeAddImageModal();
      
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "خطأ في رفع الصور",
        description: error.response?.data?.message || "حدث خطأ أثناء رفع الصور",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingImages(false);
    }
  };

  // فتح مودال إضافة صورة لسؤال محدد
  const openAddQuestionImageModal = (questionId) => {
    setAddQuestionImageModal({ open: true, questionId });
    setSelectedQuestionImage(null);
    setQuestionImagePreview('');
  };

  // إغلاق مودال إضافة صورة لسؤال محدد
  const closeAddQuestionImageModal = () => {
    setAddQuestionImageModal({ open: false, questionId: null });
    setSelectedQuestionImage(null);
    setQuestionImagePreview('');
  };

  // التعامل مع اختيار صورة لسؤال محدد
  const handleQuestionImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF)",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // التحقق من حجم الملف (حد أقصى 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "خطأ",
          description: "حجم الصورة يجب أن يكون أقل من 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedQuestionImage(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // رفع صورة لسؤال محدد
  const uploadQuestionImage = async () => {
    if (!selectedQuestionImage || !addQuestionImageModal.questionId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة أولاً",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploadingQuestionImage(true);
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append('image', selectedQuestionImage);

      const response = await baseUrl.patch(
        `/api/questions/lecture-exam-question/${addQuestionImageModal.questionId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Question image uploaded successfully:', response.data);
      
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم إضافة الصورة للسؤال بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // إعادة تحميل الأسئلة
      if (isTeacher || isAdmin) {
        await fetchQuestionsForTeacher();
      } else {
        await fetchExamData();
      }
      
      // إغلاق المودال
      closeAddQuestionImageModal();
      
    } catch (error) {
      console.error('Error uploading question image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.response?.data?.message || "حدث خطأ أثناء رفع الصورة",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingQuestionImage(false);
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>جاري تحميل بيانات الامتحان...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="60vh">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  // عرض الحالات المختلفة للطلاب
  if (student && !isTeacher && !isAdmin) {
    if (examStatus === 'hidden') {
      return (
        <Center minH="60vh">
          <Alert status="warning" borderRadius="md" maxW="md">
            <AlertIcon />
            <VStack spacing={2} align="start">
              <Text fontWeight="bold">الامتحان غير متاح</Text>
              <Text>هذا الامتحان غير مرئي حالياً.</Text>
            </VStack>
          </Alert>
        </Center>
      );
    }

    if (examStatus === 'not_open_yet') {
      return (
        <Center minH="60vh">
          <Alert status="info" borderRadius="md" maxW="md">
            <AlertIcon />
            <VStack spacing={2} align="start">
              <Text fontWeight="bold">الامتحان لم يفتح بعد</Text>
              <Text>سيتم فتح الامتحان في الوقت المحدد.</Text>
              {examData?.startWindow && (
                <Text fontSize="sm" color="gray.600">
                  موعد الفتح: {new Date(examData.startWindow).toLocaleString('ar-EG')}
                </Text>
              )}
            </VStack>
          </Alert>
        </Center>
      );
    }

    if (examStatus === 'closed') {
      return (
        <Center minH="60vh">
          <Alert status="error" borderRadius="md" maxW="md">
            <AlertIcon />
            <VStack spacing={2} align="start">
              <Text fontWeight="bold">الامتحان مغلق</Text>
              <Text>انتهت فترة الامتحان ولا يمكن بدء محاولات جديدة.</Text>
              {examData?.endWindow && (
                <Text fontSize="sm" color="gray.600">
                  موعد الإغلاق: {new Date(examData.endWindow).toLocaleString('ar-EG')}
                </Text>
              )}
            </VStack>
          </Alert>
        </Center>
      );
    }

    if (examStatus === 'already_submitted' && !feedback) {
      return (
        <Center minH="60vh">
          <Alert status="info" borderRadius="md" maxW="md">
            <AlertIcon />
            <VStack spacing={4} align="start">
              <Text fontWeight="bold">تم إكمال الامتحان</Text>
              <Text>لقد أكملت هذا الامتحان بالفعل.</Text>
              {attemptHistory.length > 0 && (
                <Box w="full">
                  <Text fontWeight="bold" mb={2}>تاريخ المحاولات:</Text>
                  <VStack spacing={2} align="stretch">
                    {attemptHistory.map((attempt, idx) => (
                      <Box key={attempt.attemptId} p={3} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text>المحاولة {idx + 1}</Text>
                          <Badge colorScheme={attempt.status === 'submitted' ? 'green' : attempt.status === 'late' ? 'orange' : 'red'}>
                            {attempt.status === 'submitted' ? 'تم التسليم' : attempt.status === 'late' ? 'متأخر' : 'منتهي'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          الدرجة: {attempt.totalGrade} | التاريخ: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString('ar-EG') : 'غير متاح'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Alert>
        </Center>
      );
    }

    // إذا كان ready ولكن لا توجد محاولة نشطة، عرض زر البدء
    if (examStatus === 'ready' && !currentAttempt && questions.length === 0) {
      return (
        <Center minH="60vh">
          <VStack spacing={6}>
            <Alert status="info" borderRadius="md" maxW="md">
              <AlertIcon />
              <VStack spacing={2} align="start">
                <Text fontWeight="bold">جاهز للبدء</Text>
                <Text>اضغط على الزر أدناه لبدء الامتحان.</Text>
                {examData?.timeLimitEnabled && examData?.timeLimitMinutes && (
                  <Text fontSize="sm" color="gray.600">
                    المدة: {examData.timeLimitMinutes} دقيقة
                  </Text>
                )}
              </VStack>
            </Alert>
            <Button
              colorScheme="green"
              size="lg"
              onClick={startAttempt}
              isLoading={startingAttempt}
              leftIcon={<Icon as={AiFillCheckCircle} boxSize={6} />}
              px={8}
              py={6}
              fontSize="xl"
              fontWeight="bold"
              borderRadius="full"
            >
              {startingAttempt ? "جاري البدء..." : "بدء الامتحان"}
            </Button>
          </VStack>
        </Center>
      );
    }
  }

  // عرض درجات الطلاب
  if (showGrades) {
    return (
      <Box maxW="2xl" mx="auto" py={10} px={4} className="mt-[80px]">
        <Heading mb={8} textAlign="center" color="blue.600">درجات الطلاب في الامتحان</Heading>
        <Button mb={6} colorScheme="blue" onClick={() => setShowGrades(false)}>
          عودة للأسئلة
        </Button>
        {gradesLoading ? (
          <Center minH="40vh"><Spinner size="xl" color="blue.500" /><Text mt={4}>جاري تحميل الدرجات...</Text></Center>
        ) : gradesError ? (
          <Alert status="error" borderRadius="md"><AlertIcon />{gradesError}</Alert>
        ) : gradesData && gradesData.length > 0 ? (
          <VStack spacing={5} align="stretch">
            {gradesData.map((s, idx) => (
              <Box key={s.submission_id} p={5} borderRadius="xl" boxShadow="md" bgGradient={s.passed ? "linear(to-r, green.50, white)" : "linear(to-r, red.50, white)"} border="1px solid #e2e8f0">
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg" color="blue.700">{idx + 1}. {s.name}</Text>
                  <Badge colorScheme={s.passed ? "green" : "red"} fontSize="md">
                    {s.passed ? "ناجح" : "راسب"}
                  </Badge>
                </HStack>
                <HStack spacing={4} mt={2}>
                  <Badge colorScheme="blue">الدرجة: {s.total_grade}</Badge>
                  <Badge colorScheme="gray">ID: {s.student_id}</Badge>
                  {s.phone && <Badge colorScheme="purple">{s.phone}</Badge>}
                </HStack>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  {s.submitted_at ? `تاريخ التسليم: ${new Date(s.submitted_at).toLocaleString('ar-EG')}` : "لم يتم التسليم"}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" textAlign="center">لا يوجد نتائج بعد.</Text>
        )}
      </Box>
    );
  }

  return (
    <Box maxW="90%" mx="auto"  px={{ base: 2, sm: 4, md: 6 }} className="mt-[20px]">
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} mb={{ base: 6, sm: 7, md: 8 }}>
      
        {!isTeacher && !isAdmin && student && (
          <Text color="gray.600" textAlign="center" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} px={{ base: 2, sm: 4 }}>
            أجب على جميع الأسئلة ثم اضغط على "تسليم الامتحان"
          </Text>
        )}
      </VStack>
      {/* أزرار المدرس */}
      {isTeacher && (
        <HStack spacing={4} mb={{ base: 6, sm: 7, md: 8 }} justify="center" flexWrap="wrap">
          <Button 
            colorScheme="green" 
            onClick={fetchGrades}
            size={{ base: 'sm', sm: 'md', md: 'lg' }}
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 2, sm: 3, md: 4 }}
            minW={{ base: '160px', sm: '180px', md: '200px' }}
            h={{ base: '40px', sm: '44px', md: '48px' }}
            borderRadius="full"
          >
            عرض درجات الطلاب
          </Button>
          
          <Button 
            colorScheme="orange" 
            onClick={fetchExamReport}
            isLoading={reportLoading}
            size={{ base: 'sm', sm: 'md', md: 'lg' }}
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 2, sm: 3, md: 4 }}
            minW={{ base: '160px', sm: '180px', md: '200px' }}
            h={{ base: '40px', sm: '44px', md: '48px' }}
            borderRadius="full"
            leftIcon={<Icon as={AiFillStar} boxSize={{ base: 3, sm: 4, md: 5 }} />}
          >
            تقارير الامتحان
          </Button>
          
          <Button 
            colorScheme="purple" 
            onClick={openAddImageModal}
            size={{ base: 'sm', sm: 'md', md: 'lg' }}
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 2, sm: 3, md: 4 }}
            minW={{ base: '160px', sm: '180px', md: '200px' }}
            h={{ base: '40px', sm: '44px', md: '48px' }}
            borderRadius="full"
            leftIcon={<Icon as={AiFillStar} boxSize={{ base: 3, sm: 4, md: 5 }} />}
          >
            إضافة أسئلة كصور
          </Button>
        </HStack>
      )}
              <VStack spacing={{ base: 6, sm: 7, md: 8 }} align="stretch">
        {/* إذا الطالب سلّم الامتحان أو كان هناك feedback، اعرض النتيجة والأخطاء */}
        {((submitResult || (feedback && feedback.wrongQuestions && feedback.wrongQuestions.length > 0)) && !isTeacher && !isAdmin && student) ? (
          <>
            {/* بطاقة النتيجة الرئيسية */}
            <Box 
              p={{ base: 6, sm: 8, md: 10 }} 
              borderRadius="2xl" 
              boxShadow="2xl" 
              bgGradient="linear(135deg, green.50 0%, white 50%, blue.50 100%)" 
              border="2px solid" 
              borderColor="green.200"
              mb={{ base: 6, sm: 8, md: 10 }} 
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              {/* خلفية مزخرفة */}
              <Box
                position="absolute"
                top="-50%"
                left="-50%"
                w="200%"
                h="200%"
                bgGradient="radial(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)"
                animation="pulse 3s ease-in-out infinite"
              />
              
              <VStack spacing={6} position="relative" zIndex={1}>
                {/* أيقونة النجاح */}
               

                {/* العنوان الرئيسي */}
                <VStack spacing={3}>
                  <Heading 
                    size={{ base: 'lg', sm: 'xl', md: 'xl' }} 
                    color="green.700" 
                    fontWeight="bold"
                    textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    نتيجتك النهائية
                  </Heading>
                  
                  {/* شريط التقدم الدائري */}
                  {(submitResult || (feedback && attemptHistory.length > 0)) && (
                    <Box position="relative" mb={4}>
                      <CircularProgress 
                        value={submitResult ? Math.round((submitResult.totalGrade / submitResult.maxGrade) * 100) : attemptHistory[0] ? Math.round((attemptHistory[0].totalGrade / (examData?.totalGrade || 100)) * 100) : 0} 
                        color="green.400" 
                        size={{ base: '120px', sm: '140px', md: '160px' }} 
                        thickness="12px" 
                        trackColor="gray.200"
                      >
                        <CircularProgressLabel 
                          fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }} 
                          fontWeight="bold"
                          color="green.700"
                        >
                          {submitResult ? submitResult.totalGrade : attemptHistory[0]?.totalGrade || 0}
                        </CircularProgressLabel>
                      </CircularProgress>
                      
                      {/* النسبة المئوية */}
                      <Text 
                        fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }} 
                        fontWeight="bold" 
                        color="green.600" 
                        mt={2}
                      >
                        من {submitResult ? submitResult.maxGrade : examData?.totalGrade || 100} ({submitResult ? Math.round((submitResult.totalGrade / submitResult.maxGrade) * 100) : attemptHistory[0] ? Math.round((attemptHistory[0].totalGrade / (examData?.totalGrade || 100)) * 100) : 0}%)
                      </Text>
                    </Box>
                  )}
                  <Text 
                    color="orange.600" 
                    fontSize={{ base: 'md', sm: 'lg' }}
                    textAlign="center"
                  >
                    عدد الأسئلة الخاطئة: {(submitResult?.wrongQuestions?.length || feedback?.wrongQuestions?.length || 0)}
                  </Text>
                  {feedback?.releaseReason && (
                    <Text fontSize="sm" color="blue.600" textAlign="center">
                      {feedback.releaseReason === 'immediate' ? 'تم إظهار الإجابات فوراً' : 
                       feedback.releaseReason === 'scheduled_release' ? 'تم إظهار الإجابات في الموعد المحدد' : 
                       'تم إظهار الإجابات بعد المدة المحددة'}
                    </Text>
                  )}
                  {/* رسالة النتيجة */}
             
                </VStack>
              </VStack>
            </Box>

            {/* تفاصيل الأخطاء */}
            {((submitResult?.wrongQuestions && submitResult.wrongQuestions.length > 0) || (feedback?.wrongQuestions && feedback.wrongQuestions.length > 0)) && (
              <Box 
                p={{ base: 4, sm: 5, md: 6 }} 
                borderRadius="xl" 
                bg="white" 
                boxShadow="lg"
                border="1px solid"
                borderColor="orange.200"
              >
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3} justify="center" mb={4}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg="orange.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <AiOutlineCloseCircle size={20} color="#F59E0B" />
                    </Box>
                    <Heading size="lg" color="orange.700">
                      الأسئلة الخاطئة
                    </Heading>
                    </HStack>
                  
                  <VStack spacing={4} align="stretch">
                    {(submitResult?.wrongQuestions || feedback?.wrongQuestions || []).map((wq, idx) => (
                      <Box 
                        key={wq.questionId} 
                        p={{ base: 4, sm: 5, md: 6 }} 
                        borderRadius="xl" 
                        boxShadow="md" 
                        bgGradient="linear(to-r, orange.50, white)" 
                        border="1px solid" 
                        borderColor="orange.200"
                        position="relative"
                      >
                        {/* رقم السؤال */}
                        <Box
                          position="absolute"
                          top="-10px"
                          right="-10px"
                          w="30px"
                          h="30px"
                          borderRadius="full"
                          bg="orange.500"
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {idx + 1}
                        </Box>

                        <VStack spacing={4} align="stretch">
                          {/* نص السؤال */}
                          {wq.questionText && (
                            <Text 
                              fontWeight="bold" 
                              color="orange.800" 
                              fontSize={{ base: 'md', sm: 'lg' }}
                              lineHeight="1.5"
                            >
                              {wq.questionText}
                            </Text>
                          )}

                          {/* صورة السؤال */}
                          {wq.questionImage && (
                            <Box 
                              w="full" 
                              display="flex" 
                              justifyContent="center"
                              alignItems="center"
                              mt={wq.questionText ? 2 : 0}
                            >
                              <Box
                                maxW="100%"
                                borderRadius="xl"
                                overflow="hidden"
                                boxShadow="xl"
                                border="3px solid"
                                borderColor="orange.300"
                                bg="white"
                                p={2}
                                position="relative"
                                _hover={{
                                  transform: "scale(1.02)",
                                  boxShadow: "2xl",
                                  borderColor: "orange.400"
                                }}
                                transition="all 0.3s ease"
                              >
                                <Image 
                                  src={wq.questionImage} 
                                  alt="صورة السؤال" 
                                  borderRadius="lg"
                                  maxW="100%"
                                  maxH={{ base: '400px', sm: '500px', md: '600px' }}
                                  objectFit="contain"
                                  bg="gray.50"
                                  onError={(e) => {
                                    console.log('Image load error, retrying...');
                                    setTimeout(() => {
                                      e.target.src = wq.questionImage + '?t=' + Date.now();
                                    }, 1000);
                                  }}
                                  fallback={
                                    <Box 
                                      w="full" 
                                      h="200px" 
                                      bg="gray.100" 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center"
                                      borderRadius="lg"
                                    >
                                      <VStack spacing={2}>
                                        <Spinner size="md" color="orange.500" />
                                        <Text color="gray.500" fontSize="sm">جاري تحميل الصورة...</Text>
                                      </VStack>
                                    </Box>
                                  }
                                />
                              </Box>
                            </Box>
                          )}

                          {/* الإجابات */}
                          <VStack spacing={3} align="stretch">
                            {/* إجابة الطالب */}
                            <Box 
                              p={3} 
                              borderRadius="lg" 
                              bg="red.50" 
                              border="1px solid" 
                              borderColor="red.200"
                            >
                              <HStack spacing={2} mb={1}>
                                <AiOutlineCloseCircle color="#DC2626" size={16} />
                                <Text fontWeight="bold" color="red.700" fontSize="sm">
                      إجابتك:
                                </Text>
                              </HStack>
                              <Text 
                                color="red.800" 
                                fontSize="md" 
                                fontWeight="medium"
                                bg="red.100"
                                p={2}
                                borderRadius="md"
                              >
                        {wq.yourChoice?.text || "لم تجب"}
                    </Text>
                            </Box>

                            {/* الإجابة الصحيحة */}
                            <Box 
                              p={3} 
                              borderRadius="lg" 
                              bg="green.50" 
                              border="1px solid" 
                              borderColor="green.200"
                            >
                              <HStack spacing={2} mb={1}>
                                <AiOutlineCheckCircle color="#16A34A" size={16} />
                                <Text fontWeight="bold" color="green.700" fontSize="sm">
                      الإجابة الصحيحة:
                                </Text>
                              </HStack>
                              <Text 
                                color="green.800" 
                                fontSize="md" 
                                fontWeight="medium"
                                bg="green.100"
                                p={2}
                                borderRadius="md"
                              >
                        {wq.correctChoice?.text}
                    </Text>
                            </Box>
                          </VStack>
                        </VStack>
                  </Box>
                ))}
              </VStack>
                </VStack>
              </Box>
            )}
          </>
        ) : (
          // الوضع العادي: عرض الأسئلة
          <>
            {/* للمدرسين: عرض جميع الأسئلة */}
            {isTeacher || isAdmin ? (
              <>
                {questions.length > 0 ? (
                  questions.map((q, idx) => (
              <Box
                key={q.id}
                  p={{ base: 4, sm: 5, md: 6 }}
                borderRadius="xl"
                boxShadow="lg"
                bgGradient="linear(to-r, blue.50, white)"
                border="1px solid #e2e8f0"
                position="relative"
              >
                  <HStack justify="space-between" mb={2} align="start">
                    <VStack align="start" flex={1} spacing={{ base: 2, sm: 3 }} w="full">
                      {/* عرض نص السؤال أو رقم السؤال فقط */}
                      {q.text ? (
                        <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="blue.700" lineHeight="1.4" w="full">
                          {idx + 1}. {q.text}
                        </Text>
                      ) : q.image ? (
                        <HStack spacing={2} w="full">
                          <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                            سؤال بصورة
                          </Badge>
                          <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="blue.700" lineHeight="1.4">
                            {idx + 1}
                          </Text>
                        </HStack>
                      ) : (
                        <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="blue.700" lineHeight="1.4" w="full">
                          {idx + 1}. سؤال {idx + 1}
                        </Text>
                      )}
                      {/* عرض صورة السؤال إذا كانت موجودة */}
                      {q.image && (
                        <Box 
                          mt={4} 
                          w="full" 
                          display="flex" 
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Box
                            maxW="100%"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="xl"
                            border="3px solid"
                            borderColor="blue.200"
                            bg="white"
                            p={2}
                            position="relative"
                            _hover={{
                              transform: "scale(1.02)",
                              boxShadow: "2xl",
                              borderColor: "blue.300"
                            }}
                            transition="all 0.3s ease"
                          >
                            <Image 
                              src={q.image} 
                              alt="صورة السؤال" 
                              borderRadius="lg"
                              maxW="100%"
                              maxH={{ base: '400px', sm: '500px', md: '600px', lg: '700px' }}
                              objectFit="contain"
                              bg="gray.50"
                              onError={(e) => {
                                console.log('Image load error, retrying...');
                                // إعادة المحاولة بعد ثانية واحدة
                                setTimeout(() => {
                                  e.target.src = q.image + '?t=' + Date.now();
                                }, 1000);
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully');
                              }}
                              fallback={
                                <Box 
                                  w="full" 
                                  h="200px" 
                                  bg="gray.100" 
                                  display="flex" 
                                  alignItems="center" 
                                  justifyContent="center"
                                  borderRadius="lg"
                                >
                                  <VStack spacing={2}>
                                    <Spinner size="md" color="blue.500" />
                                    <Text color="gray.500" fontSize="sm">جاري تحميل الصورة...</Text>
                                  </VStack>
                                </Box>
                              }
                            />
                            {/* مؤشر أن هذه صورة السؤال */}
                          
                          </Box>
                        </Box>
                      )}
                    </VStack>
                    <HStack spacing={{ base: 1, sm: 2 }}>
                      <IconButton
                        aria-label="إضافة صورة"
                        size={{ base: 'xs', sm: 'sm' }}
                        colorScheme="purple"
                        onClick={() => openAddQuestionImageModal(q.id)}
                        minW={{ base: '28px', sm: '32px' }}
                        h={{ base: '28px', sm: '32px' }}
                        icon={<AiFillPicture boxSize={{ base: 3, sm: 4 }} />}
                      />
                      <IconButton
                        aria-label="تعديل"
                        size={{ base: 'xs', sm: 'sm' }}
                        colorScheme="yellow"
                        onClick={() => openEditModal(q)}
                        minW={{ base: '28px', sm: '32px' }}
                        h={{ base: '28px', sm: '32px' }}
                        icon={<AiFillEdit boxSize={{ base: 3, sm: 4 }} />}
                      />
                      <IconButton
                        aria-label="حذف"
                        size={{ base: 'xs', sm: 'sm' }}
                        colorScheme="red"
                        isLoading={deleting}
                        onClick={() => setDeleteModal({ open: true, qid: q.id })}
                        minW={{ base: '28px', sm: '32px' }}
                        h={{ base: '28px', sm: '32px' }}
                        icon={<AiFillDelete boxSize={{ base: 3, sm: 4 }} />}
                      />
                    </HStack>
                </HStack>
                <Divider mb={3} />
                {q.choices && q.choices.length > 0 ? (
            <RadioGroup>
              <Stack direction="column" spacing={3}>
                {q.choices.map((choice, cidx) => (
                          <HStack key={choice.id} align="center">
                            <Radio
                              value={String(choice.id)}
                              colorScheme="blue"
                              isChecked={choice.is_correct}
                              isReadOnly
                            >
                              <Box
                                p={2}
                                borderRadius="md"
                                bg={choice.is_correct ? "green.50" : "white"}
                                fontWeight={choice.is_correct ? "bold" : "normal"}
                                color={choice.is_correct ? "green.700" : "gray.800"}
                              >
                    {String.fromCharCode(65 + cidx)}. {choice.text}
                              </Box>
                  </Radio>
                              <IconButton
                                aria-label="تعيين كإجابة صحيحة"
                                size="sm"
                                colorScheme={
                                  (pendingCorrect[q.id] === choice.id) || choice.is_correct
                                    ? "green"
                                    : "gray"
                                }
                                variant={
                                  (pendingCorrect[q.id] === choice.id) || choice.is_correct
                                    ? "solid"
                                    : "outline"
                                }
                                ml={2}
                                onClick={() => handleSetCorrect(q.id, choice.id)}
                                isDisabled={pendingCorrect[q.id] || choice.is_correct}
                              icon={<AiFillCheckCircle boxSize={{ base: 3, sm: 4 }} />}
                              />
                          </HStack>
                ))}
              </Stack>
            </RadioGroup>
                ) : (
                  <Alert status="info" borderRadius="md" mt={2}>
                    <AlertIcon />
                    هذا السؤال يتطلب إجابة كتابية أو لا توجد اختيارات متاحة.
                  </Alert>
                )}
          </Box>
                  ))
                ) : (
                  <Center minH="40vh">
                    <Alert status="info" borderRadius="md" maxW="md">
                      <AlertIcon />
                      <VStack spacing={3} align="start">
                        <Text fontWeight="bold" fontSize="lg">لا توجد أسئلة</Text>
                        <Text>لم يتم العثور على أسئلة في هذا الامتحان.</Text>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={fetchExamData}
                          isLoading={loading}
                        >
                          إعادة تحميل
                        </Button>
                      </VStack>
                    </Alert>
                  </Center>
                )}
              </>
            ) : (
              // للطلاب: عرض سؤال واحد مع التنقل
              questions.length > 0 && (
                <>
                  {/* شريط التقدم المبسط */}
                  <Box 
                    p={{ base: 4, sm: 5, md: 6 }} 
                    borderRadius="xl" 
                    bg="white" 
                    border="1px solid" 
                    borderColor="gray.200"
                    boxShadow="md"
                    mb={6}
                  >
                    <VStack spacing={4}>
                      {/* عداد الوقت */}
                      {currentAttempt && remainingSeconds !== null && remainingSeconds > 0 && (
                        <Box 
                          w="full" 
                          p={4} 
                          borderRadius="lg" 
                          bgGradient={remainingSeconds < 300 ? "linear(to-r, red.50, orange.50)" : "linear(to-r, blue.50, green.50)"}
                          border="2px solid"
                          borderColor={remainingSeconds < 300 ? "red.300" : "blue.300"}
                          textAlign="center"
                        >
                          <Text fontSize="sm" color="gray.600" mb={1}>الوقت المتبقي</Text>
                          <Text 
                            fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }} 
                            fontWeight="bold" 
                            color={remainingSeconds < 300 ? "red.700" : "blue.700"}
                          >
                            {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                          </Text>
                          {remainingSeconds < 300 && (
                            <Text fontSize="sm" color="red.600" mt={2} fontWeight="bold">
                              ⚠️ الوقت على وشك الانتهاء!
                            </Text>
                          )}
                        </Box>
                      )}
                      
                      {/* شريط التقدم العام */}
                      <Box w="full">
                        <HStack justify="space-between" mb={3}>
                          <Text fontSize={{ base: 'lg', sm: 'xl' }} fontWeight="bold" color="blue.700">
                            التقدم: {Object.keys(studentAnswers).length} من {questions.length}
                          </Text>
                          <Text fontSize={{ base: 'lg', sm: 'xl' }} fontWeight="bold" color="gray.600">
                            السؤال {currentQuestionIndex + 1}
                          </Text>
                        </HStack>
                        <Box w="full" h="12px" bg="gray.200" borderRadius="full" overflow="hidden">
                          <Box 
                            h="full" 
                            bgGradient="linear(to-r, blue.400, green.400)" 
                            borderRadius="full" 
                            transition="width 0.5s ease"
                            w={`${(Object.keys(studentAnswers).length / questions.length) * 100}%`}
                          />
                        </Box>
                      </Box>

                      {/* زر المراجعة فقط */}
                     

                      {/* الباجنيشن المبسط */}
                      {showPagination && (
                        <Box w="full" mt={4}>
                          <Text fontSize="md" fontWeight="bold" color="gray.700" mb={3} textAlign="center">
                            التنقل السريع
                          </Text>
                          <HStack spacing={2} flexWrap="wrap" justify="center">
                            {questions.map((question, index) => {
                              const isAnswered = studentAnswers[question.id];
                              const isCurrent = currentQuestionIndex === index;
                              return (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={isCurrent ? "solid" : isAnswered ? "outline" : "ghost"}
                                  colorScheme={isCurrent ? "blue" : isAnswered ? "green" : "gray"}
                                  onClick={() => goToQuestion(index)}
                                  minW="40px"
                                  h="40px"
                                  borderRadius="full"
                                  fontSize="sm"
                                  fontWeight="bold"
                                  position="relative"
                                >
                                  {index + 1}
                                  {isAnswered && !isCurrent && (
                                    <Box
                                      position="absolute"
                                      top="-2px"
                                      right="-2px"
                                      w="8px"
                                      h="8px"
                                      bg="green.500"
                                      borderRadius="full"
                                      border="2px solid white"
                                    />
                                  )}
                                </Button>
                              );
                            })}
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>

                  {/* السؤال الحالي */}
                  <Box
                    p={{ base: 4, sm: 5, md: 6 }}
                    borderRadius="xl"
                    boxShadow="lg"
                    bgGradient="linear(to-r, blue.50, white)"
                    border="1px solid #e2e8f0"
                    position="relative"
                  >
                    <VStack align="start" spacing={{ base: 3, sm: 4 }}>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }} color="blue.700" lineHeight="1.4">
                        {currentQuestionIndex + 1}. {questions[currentQuestionIndex].text}
                      </Text>
                      
                      {/* عرض صورة السؤال إذا كانت موجودة */}
                      {questions[currentQuestionIndex].image && (
                        <Box 
                          mt={4} 
                          w="full" 
                          display="flex" 
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Box
                            maxW="100%"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="xl"
                            border="3px solid"
                            borderColor="blue.200"
                            bg="white"
                            p={2}
                            position="relative"
                            _hover={{
                              transform: "scale(1.02)",
                              boxShadow: "2xl",
                              borderColor: "blue.300"
                            }}
                            transition="all 0.3s ease"
                          >
                            <Image 
                              src={questions[currentQuestionIndex].image} 
                              alt="صورة السؤال"
                              borderRadius="lg"
                              maxW="100%"
                              maxH={{ base: '400px', sm: '500px', md: '600px', lg: '700px' }}
                              objectFit="contain"
                              bg="gray.50"
                              onError={(e) => {
                                console.log('Image load error, retrying...');
                                // إعادة المحاولة بعد ثانية واحدة
                                setTimeout(() => {
                                  e.target.src = questions[currentQuestionIndex].image + '?t=' + Date.now();
                                }, 1000);
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully');
                              }}
                              fallback={
                                <Box 
                                  w="full" 
                                  h="200px" 
                                  bg="gray.100" 
                                  display="flex" 
                                  alignItems="center" 
                                  justifyContent="center"
                                  borderRadius="lg"
                                >
                                  <VStack spacing={2}>
                                    <Spinner size="md" color="blue.500" />
                                    <Text color="gray.500" fontSize="sm">جاري تحميل الصورة...</Text>
                                  </VStack>
                                </Box>
                              }
                            />
                            {/* مؤشر أن هذه صورة السؤال */}
                     
                          </Box>
                        </Box>
                      )}
                    </VStack>
                    
                    <Divider my={4} />
                    
                    {questions[currentQuestionIndex].choices && questions[currentQuestionIndex].choices.length > 0 ? (
                      <CheckboxGroup value={studentAnswers[questions[currentQuestionIndex].id] ? [String(studentAnswers[questions[currentQuestionIndex].id])] : []}>
                        <HStack spacing={4} flexWrap="wrap" align="stretch">
                          {questions[currentQuestionIndex].choices.map((choice, cidx) => (
                            <Checkbox
                              key={choice.id}
                              value={String(choice.id)}
                              colorScheme="blue"
                              isChecked={studentAnswers[questions[currentQuestionIndex].id] === choice.id}
                              onChange={() => handleStudentChoice(questions[currentQuestionIndex].id, choice.id)}
                              isDisabled={!!submitResult}
                              flex="1"
                              minW={{ base: "100%", sm: "45%", md: "30%", lg: "22%" }}
                            >
                              <Box 
                                p={{ base: 4, sm: 5, md: 6 }} 
                                borderRadius="2xl" 
                                bg="white" 
                                border="3px solid" 
                                borderColor={studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "blue.400" : "gray.200"}
                                _hover={{ 
                                  bg: studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "blue.50" : "gray.50", 
                                  borderColor: studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "blue.500" : "blue.300",
                                  transform: "translateY(-3px)",
                                  boxShadow: "xl"
                                }}
                                transition="all 0.3s ease"
                                w="full"
                                minH="100px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                textAlign="center"
                                position="relative"
                                cursor="pointer"
                                boxShadow={studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "xl" : "md"}
                                bgGradient={studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "linear(to-br, blue.50, white)" : "linear(to-br, white, gray.50)"}
                              >
                                {/* مؤشر الاختيار */}
                                {studentAnswers[questions[currentQuestionIndex].id] === choice.id && (
                                  <Box
                                    position="absolute"
                                    top="8px"
                                    right="8px"
                                    w="24px"
                                    h="24px"
                                    borderRadius="full"
                                    bg="blue.500"
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    boxShadow="md"
                                  >
                                    ✓
                                  </Box>
                                )}
                                
                                <Text 
                                  fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} 
                                  fontWeight={studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "bold" : "medium"}
                                  color={studentAnswers[questions[currentQuestionIndex].id] === choice.id ? "blue.700" : "gray.700"}
                                  lineHeight="1.4"
                                  px={2}
                                >
                                  <Text as="span" fontSize="lg" fontWeight="bold" color="blue.600" mr={2}>
                                    {String.fromCharCode(65 + cidx)}.
                                  </Text>
                                  {choice.text}
                                </Text>
                              </Box>
                            </Checkbox>
                          ))}
                        </HStack>
                      </CheckboxGroup>
                    ) : (
                      <Alert status="info" borderRadius="md" mt={2}>
                        <AlertIcon />
                        هذا السؤال يتطلب إجابة كتابية أو لا توجد اختيارات متاحة.
                      </Alert>
                    )}
                  </Box>

                  {/* أزرار السابق والتالي - تحت الأسئلة */}
                  <Box 
                    mt={6} 
                    p={4} 
                    borderRadius="xl" 
                    bg="white" 
                    border="1px solid" 
                    borderColor="gray.200"
                    boxShadow="md"
                  >
                    <HStack spacing={4} justify="center" flexWrap="wrap">
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={goToPreviousQuestion}
                        isDisabled={currentQuestionIndex === 0}
                        size={{ base: 'md', sm: 'lg' }}
                        leftIcon={<Icon as={AiOutlineCloseCircle} boxSize={5} />}
                        px={{ base: 6, sm: 8 }}
                        py={{ base: 3, sm: 4 }}
                        borderRadius="full"
                        fontSize={{ base: 'md', sm: 'lg' }}
                        fontWeight="bold"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl',
                          bg: 'blue.50'
                        }}
                        transition="all 0.2s"
                        minW={{ base: '120px', sm: '140px' }}
                        h={{ base: '48px', sm: '56px' }}
                      >
                        السابق
                      </Button>
                      
                      {/* زر تسليم الامتحان - يظهر فقط عند اكتمال جميع الأسئلة */}
                      {Object.keys(studentAnswers).length === questions.length && (
                        <Button
                          colorScheme="green"
                          onClick={handleSubmitExam}
                          isLoading={submitLoading}
                          size={{ base: 'md', sm: 'lg' }}
                          leftIcon={<Icon as={AiFillCheckCircle} boxSize={5} />}
                          px={{ base: 6, sm: 8 }}
                          py={{ base: 3, sm: 4 }}
                          borderRadius="full"
                          fontSize={{ base: 'md', sm: 'lg' }}
                          fontWeight="bold"
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'xl',
                            bg: 'green.600'
                          }}
                          transition="all 0.2s"
                          minW={{ base: '140px', sm: '160px' }}
                          h={{ base: '48px', sm: '56px' }}
                          bgGradient="linear(to-r, green.400, green.500)"
                          color="white"
                          boxShadow="lg"
                        >
                          {submitLoading ? "جاري التسليم..." : "تسليم الامتحان"}
                        </Button>
                      )}
                      
                      <Button
                        colorScheme="blue"
                        onClick={goToNextQuestion}
                        isDisabled={currentQuestionIndex === questions.length - 1}
                        size={{ base: 'md', sm: 'lg' }}
                        rightIcon={<Icon as={AiOutlineCheckCircle} boxSize={5} />}
                        px={{ base: 6, sm: 8 }}
                        py={{ base: 3, sm: 4 }}
                        borderRadius="full"
                        fontSize={{ base: 'md', sm: 'lg' }}
                        fontWeight="bold"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl',
                          bg: 'blue.600'
                        }}
                        transition="all 0.2s"
                        minW={{ base: '120px', sm: '140px' }}
                        h={{ base: '48px', sm: '56px' }}
                      >
                        {currentQuestionIndex === questions.length - 1 ? "آخر سؤال" : "التالي"}
                      </Button>
                    </HStack>
                  </Box>
                </>
              )
            )}
          </>
        )}
      </VStack>


      {/* عرض نتيجة التسليم */}
      {submitResult && (
        <Box mt={8} p={6} borderRadius="xl" boxShadow="lg" bg="white" border="1px solid #e2e8f0">
          <Heading size="md" color="green.600" mb={4}>نتيجة الامتحان</Heading>
          {/* مثال: عرض عدد الإجابات الصحيحة والنتيجة النهائية */}
          {submitResult.score !== undefined && (
            <Text fontWeight="bold" color="blue.700">درجتك: {submitResult.score}</Text>
          )}
          {submitResult.correctAnswersCount !== undefined && (
            <Text color="green.700">عدد الإجابات الصحيحة: {submitResult.correctAnswersCount}</Text>
          )}
          {/* إذا كان هناك تفاصيل أخرى */}
          {submitResult.details && Array.isArray(submitResult.details) && (
            <VStack mt={4} align="stretch">
              {submitResult.details.map((item, idx) => (
                <Box key={idx} p={2} borderRadius="md" bg="gray.50">
                  <Text>{item}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, question: null })} size={{ base: 'sm', sm: 'md', md: 'lg' }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, sm: 4 }}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={{ base: 3, sm: 4 }} align="stretch">
              <FormControl>
                <FormLabel>نص السؤال:</FormLabel>
            <Input
              value={editForm.text}
              onChange={(e) => handleEditChange("text", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>صورة السؤال:</FormLabel>
                <VStack spacing={{ base: 2, sm: 3 }} align="stretch">
                  {/* معاينة الصورة الحالية */}
                  {imagePreview && (
                    <Box>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600" mb={2}>الصورة الحالية:</Text>
                      <Box
                        maxW="100%"
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="lg"
                        border="2px solid"
                        borderColor="blue.200"
                        bg="white"
                        p={2}
                        position="relative"
                      >
                        <Image 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          borderRadius="lg"
                          maxW="100%"
                          maxH={{ base: '200px', sm: '250px', md: '300px' }}
                          objectFit="contain"
                          bg="gray.50"
                          fallback={
                            <Box 
                              w="full" 
                              h="150px" 
                              bg="gray.100" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              borderRadius="lg"
                            >
                              <Text color="gray.500">خطأ في تحميل الصورة</Text>
                            </Box>
                          }
                        />
                        {/* مؤشر معاينة */}
                        <Box
                          position="absolute"
                          top="4px"
                          right="4px"
                          bg="green.500"
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          boxShadow="md"
                        >
                          معاينة
                        </Box>
                      </Box>
                    </Box>
                  )}
                  
                  {/* رفع ملف جديد */}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    p={{ base: 1, sm: 2 }}
                    border="2px dashed"
                    borderColor="blue.200"
                    borderRadius="md"
                    _hover={{ borderColor: "blue.300" }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                  />
                  
                  {/* رابط الصورة (اختياري) */}
                  <FormControl>
                    <FormLabel fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600">أو رابط الصورة (اختياري)</FormLabel>
                    <Input 
                      value={editForm.image} 
                      onChange={(e) => handleEditChange("image", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    />
                  </FormControl>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>الاختيارات:</FormLabel>
            <VStack spacing={2}>
              {editForm.choices.map((choice, idx) => (
                <Input
                  key={choice.id}
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(idx, e.target.value)}
                  placeholder={`اختيار ${String.fromCharCode(65 + idx)}`}
                />
              ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleEditSave}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              حفظ
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setEditModal({ open: false, question: null })}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, qid: null })} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد الحذف</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>هل أنت متأكد أنك تريد حذف هذا السؤال؟ لا يمكن التراجع عن هذه العملية.</Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="red" 
              mr={3} 
              onClick={handleDelete} 
              isLoading={deleting}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '100px', sm: '120px' }}
            >
              تأكيد الحذف
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ open: false, qid: null })}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Images Modal */}
      <Modal isOpen={addImageModal.open} onClose={closeAddImageModal} size="xl">
        <ModalOverlay />
        <ModalContent mx={{ base: 2, sm: 4 }}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>إضافة أسئلة كصور</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* تعليمات */}
              <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                <VStack spacing={2} align="start">
                  <Text fontWeight="bold" color="blue.700" fontSize="sm">
                    تعليمات إضافة الصور:
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    • يمكن رفع حتى 10 صور كحد أقصى
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    • أنواع الصور المدعومة: JPG, PNG, GIF
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    • حجم كل صورة يجب أن يكون أقل من 5MB
                  </Text>
                </VStack>
              </Box>

              {/* رفع الملفات */}
              <FormControl>
                <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>اختيار الصور:</FormLabel>
                <Box
                  p={6}
                  border="2px dashed"
                  borderColor="purple.300"
                  borderRadius="lg"
                  textAlign="center"
                  _hover={{ borderColor: "purple.400", bg: "purple.50" }}
                  transition="all 0.2s"
                >
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    display="none"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <VStack spacing={2} cursor="pointer">
                      <Icon as={AiFillStar} boxSize={8} color="purple.400" />
                      <Text color="purple.600" fontWeight="medium">
                        اضغط هنا لاختيار الصور
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        أو اسحب الصور هنا
                      </Text>
                    </VStack>
                  </label>
                </Box>
              </FormControl>

              {/* معاينة الصور المختارة */}
              {imagePreviews.length > 0 && (
                <Box>
                  <Text fontWeight="bold" color="gray.700" mb={3}>
                    الصور المختارة ({imagePreviews.length}):
                  </Text>
                  <Box
                    maxH="300px"
                    overflowY="auto"
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    bg="gray.50"
                  >
                    <VStack spacing={3} align="stretch">
                      {imagePreviews.map((preview, index) => (
                        <Box
                          key={index}
                          p={3}
                          bg="white"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="gray.200"
                          position="relative"
                        >
                          <HStack spacing={3} align="start">
                            <Image
                              src={preview}
                              alt={`معاينة ${index + 1}`}
                              w="100px"
                              h="80px"
                              objectFit="contain"
                              borderRadius="lg"
                              border="2px solid"
                              borderColor="purple.200"
                              bg="white"
                              boxShadow="md"
                              _hover={{
                                transform: "scale(1.05)",
                                borderColor: "purple.300"
                              }}
                              transition="all 0.2s ease"
                            />
                            <VStack align="start" flex={1} spacing={1}>
                              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                الصورة {index + 1}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                الحجم: {(selectedImages[index].size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                النوع: {selectedImages[index].type}
                              </Text>
                            </VStack>
                            <IconButton
                              aria-label="إزالة الصورة"
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeImage(index)}
                              icon={<AiFillDelete boxSize={4} />}
                            />
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="purple" 
              mr={3} 
              onClick={uploadImagesAsQuestions}
              isLoading={uploadingImages}
              isDisabled={selectedImages.length === 0}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 4, sm: 6 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '120px', sm: '140px' }}
              leftIcon={<Icon as={AiFillStar} boxSize={4} />}
            >
              {uploadingImages ? "جاري الرفع..." : "رفع الصور"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={closeAddImageModal}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Question Image Modal */}
      <Modal isOpen={addQuestionImageModal.open} onClose={closeAddQuestionImageModal} size="md">
        <ModalOverlay />
        <ModalContent mx={{ base: 2, sm: 4 }}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>إضافة صورة للسؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* تعليمات */}
              <Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                <VStack spacing={2} align="start">
                  <Text fontWeight="bold" color="purple.700" fontSize="sm">
                    تعليمات إضافة الصورة:
                  </Text>
                  <Text fontSize="sm" color="purple.600">
                    • أنواع الصور المدعومة: JPG, PNG, GIF
                  </Text>
                  <Text fontSize="sm" color="purple.600">
                    • حجم الصورة يجب أن يكون أقل من 5MB
                  </Text>
                </VStack>
              </Box>

              {/* معاينة الصورة المختارة */}
              {questionImagePreview && (
                <Box>
                  <Text fontWeight="bold" color="gray.700" mb={3}>
                    معاينة الصورة:
                  </Text>
                  <Box
                    maxW="100%"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="lg"
                    border="2px solid"
                    borderColor="purple.200"
                    bg="white"
                    p={2}
                  >
                    <Image 
                      src={questionImagePreview} 
                      alt="معاينة الصورة" 
                      borderRadius="lg"
                      maxW="100%"
                      maxH="300px"
                      objectFit="contain"
                      bg="gray.50"
                    />
                  </Box>
                </Box>
              )}

              {/* رفع الملف */}
              <FormControl>
                <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>اختيار الصورة:</FormLabel>
                <Box
                  p={6}
                  border="2px dashed"
                  borderColor="purple.300"
                  borderRadius="lg"
                  textAlign="center"
                  _hover={{ borderColor: "purple.400", bg: "purple.50" }}
                  transition="all 0.2s"
                >
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleQuestionImageSelection}
                    display="none"
                    id="question-image-upload"
                  />
                  <label htmlFor="question-image-upload">
                    <VStack spacing={2} cursor="pointer">
                      <Icon as={AiFillPicture} boxSize={8} color="purple.400" />
                      <Text color="purple.600" fontWeight="medium">
                        اضغط هنا لاختيار الصورة
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        أو اسحب الصورة هنا
                      </Text>
                    </VStack>
                  </label>
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="purple" 
              mr={3} 
              onClick={uploadQuestionImage}
              isLoading={uploadingQuestionImage}
              isDisabled={!selectedQuestionImage}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 4, sm: 6 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '120px', sm: '140px' }}
              leftIcon={<Icon as={AiFillPicture} boxSize={4} />}
            >
              {uploadingQuestionImage ? "جاري الرفع..." : "رفع الصورة"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={closeAddQuestionImageModal}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ComprehensiveExam;
