import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import SingUp from "../pages/signup/SingUp";
import Admin from "../pages/Admin/Admin";
import AdminMange from "../components/admin/AdminMange";
import AdminCreateCode from "../components/admin/AdminCreateCode";
import AdminTeacherBalances from "../components/admin/AdminTeacherBalances";
import Code from "../pages/code/Code";
import CreateLecture from "../components/admin/teacher/CreateLecture";
import AddVideo from "../components/admin/teacher/AddVideo";
import Wallet from "../pages/wallet/Wallet";
import TeacherDetails from "../pages/teacher/TeacherDetails";
import MyLecture from "../pages/leacter/MyLecture";
import Profile from "../pages/profile/Profile";
import VerifyCode from "../pages/password/VerifyCode";
import ResetPassword from "../pages/password/ResetPassword";
import CreateGroup from "../components/admin/teacher/CreateGroup";
import AddStudent from "../components/admin/teacher/AddStudent";
import AddExam from "../components/admin/teacher/AddExam";
import AddQuestion from "../components/admin/teacher/AddQuestion";

import TeacherWallet from "../pages/wallet/TeacherWallet";
import MyGroups from "../pages/groups/MyGroups";
import Groups from "../pages/groups/Groups";
import GroupDetails from "../pages/groups/GroupDetails";
import AddTeacher from "../components/admin/AddTeacher";
import LecturDetails from "../pages/leacter/LecturDetails";

import Vedio from "../pages/leacter/Vedio";
import Exam from "../pages/exam/Exam";
import AllResult from "../components/admin/teacher/AllResult";
import ExamTeacher from "../pages/exam/ExamTeacher";
import StudentResult from "../components/admin/teacher/StudentResult";
import UserType from "../Hooks/auth/userType";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import ProtectedLogin from "../components/protectedRoute/ProtectedLogin";
import OpenPhone from "../components/admin/OpenPhone";
import LoginPage from "../pages/login/LoginPage";
import TeacherLogin from "../pages/login/TeacerLogin";
import AdminLogin from "../pages/login/AdminLogin";

import AddPdf from "../components/admin/teacher/AddPdf";
import AddMonth from "../components/admin/teacher/AddMonth";
import AddLectureToMonth from "../components/admin/teacher/AddLectureToMonth";
import Month from "../pages/month/Month";
import TeacherCourses from "../pages/teacherCourses/TeacherCourses";
import AllCourses from "../pages/teacherCourses/AllCourses";
import NotFound from "../components/not found/NotFound";
import CreateCode from "../components/admin/teacher/CreateCode";
import HomeLogin from "../pages/homeLogin/HomeLogin";
import LoginTeacher from "../Hooks/teacher/login";
import AllTeacherLogin from "../components/teacher/AllTeacherLogin";
import FreeCourses from "../components/home/FreeCourses";
import PostsHome from "../pages/postshome/PostsHome";
import Competitions from "../pages/competitions/Competitions";
import TheFirsts from "../pages/theFirsts/TheFirsts";
import QuestionBank from "../pages/Question Bank/QuestionBank";
import SupjectQuestion from "../pages/Question Bank/SupjectQuestion";
import ChapterQuestion from "../pages/Question Bank/ChapterQuestion";
import PostDetails from "../pages/post/PostDetails";
import SavePosts from "../pages/post/SavePosts";
import CreateComp from "../components/admin/CreateComp";
import AllComps from "../components/admin/AllComps";
import CompetitionDetails from "../pages/competitions/CompetitionDetails";
import PlatformExams from "../pages/PlatformExams/PlatformExams";

import TeacherCode from "../pages/code/TeacherCode";
import CreateExams from "../pages/monthlyExams/CreateExams";
import ViewExams from "../pages/monthlyExams/ViewExams";
import ShowGrades from "../pages/monthlyExams/ShowGrades";
import ExamContent from "../pages/monthlyExams/ExamContent";
import ExamDetails from "../pages/monthlyExams/ExamDetails";
import AllExams from "../pages/monthlyExams/AllExams";
import AddSExam from "../pages/monthlyExams/AddSExam";
import MonthlyExams from "../pages/monthlyExams/MonthlyExams";
import AddSubQuestions from "../pages/monthlyExams/AddSubQuestions";
import SubjectExam from "../pages/monthlyExams/SubjectExam";
import ExamQuestions from "../pages/monthlyExams/ExamQuestions";
import StudentStats from "../pages/myStatistics/MyStatistics";
import CourseStatistics from "../pages/courseStatistics/CourseStatistics";
import ReviewResult from "../pages/monthlyExams/ReviewResult";
import MyTeacher from "../pages/myTeacher/MyTeacher";
import HomePage from "../pages/homePage/HomePage";
import StreamingPage from "../components/admin/streams/StreamingPage";
import ChatPage from "../pages/chat/ChatPage";
import GroupsPage from "../pages/centerSystem/GroupsPage";
import CenterGroupDetails from "../pages/centerSystem/CenterGroupDetails";
import StudentDetails from "../components/centerSystem/StudentDetails";
import AllUsers from "../pages/allUsers/AllUsers";

const AppRouter = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/login'
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <LoginPage />
            </ProtectedLogin>
          }
        />
        <Route
          path='/student_login'
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <Login />
            </ProtectedLogin>
          }
        />
        <Route
          path='/teacher_login'
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <TeacherLogin />
            </ProtectedLogin>
          }
        />
        <Route
          path='/admin_login'
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <AdminLogin />
            </ProtectedLogin>
          }
        />
        <Route
          path='/signup'
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <SingUp />
            </ProtectedLogin>
          }
        />

        <Route path='*' element={<NotFound />} />

        <Route path='/verify_code' element={<VerifyCode />} />
        <Route path='/rest_pass' element={<ResetPassword />} />
   
          
        <Route
          path='/stream-management'
          element={
            <ProtectedRoute auth={isAdmin}>
              <HomeLogin />
            </ProtectedRoute>
          }
        > 
          <Route index element={<StreamingPage />} />
        </Route>


        <Route
          path='/admin/*'
          element={
            <ProtectedRoute auth={isAdmin || isTeacher}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route element={<ProtectedRoute auth={isAdmin} />}>
            <Route path='management' element={<AdminMange />} />
            <Route path='addteacher' element={<AddTeacher />} />
            <Route path='create_code' element={<AdminCreateCode />} />
            <Route path='cridet' element={<AdminTeacherBalances />} />
            <Route path='open_phone' element={<OpenPhone />} />
           
          </Route>
          <Route element={<ProtectedRoute auth={isTeacher} />}>
            <Route path='create_lecture' element={<CreateLecture />} />
            <Route path='add_video' element={<AddVideo />} />
            <Route path='add_month' element={<AddMonth />} />
            <Route path='add_lecture_month' element={<AddLectureToMonth />} />
            <Route path='create_group' element={<CreateGroup />} />
            <Route path='add_student' element={<AddStudent />} />
            <Route path='addexam' element={<AddExam />} />
            <Route path='add_pdf' element={<AddPdf />} />
            <Route path='create_codee' element={<CreateCode />} />
            <Route path='add_question' element={<AddQuestion />} />
            <Route path='result/' element={<AllResult />}>
              <Route path='all_result/:resId' element={<StudentResult />} />
            </Route>
          </Route>
        </Route>

        <Route
          path='/*'
          element={
            <ProtectedRoute auth={isAdmin || isTeacher || student}>
              <HomeLogin />
            </ProtectedRoute>
          }
        >
          <Route path='home' element={isTeacher|| isAdmin ?<PostsHome/>: <HomePage />} />
          <Route path='social' element={<PostsHome />} />
          <Route path='teachers' element={<AllTeacherLogin />} />
          <Route path='my-teachers' element={<MyTeacher />} />
          <Route path='my_courses' element={<MyLecture />} />
          <Route path='free_courses' element={<FreeCourses />} /> 
          <Route path='competitions' element={<Competitions />} />
          <Route path='the_Firsts' element={<TheFirsts />} />
          <Route path='save_posts' element={<SavePosts />} />
          <Route path='create_comp' element={<CreateComp />} />
          <Route path='allComps' element={<AllComps />} />
          <Route path='add_sub_exam' element={<AddSExam />} />
          <Route path='monthly_exam/:id' element={<MonthlyExams />} />
          <Route path='monthly_exam/:id/show_grades' element={<ShowGrades />} />

          <Route path='question_bank' element={<QuestionBank />} />
          <Route path='supject/:id' element={<SupjectQuestion />} />
          <Route path='chapter/:id' element={<ChapterQuestion />} />
          <Route path='post/:id' element={<PostDetails />} />
          <Route path='competition/:id' element={<CompetitionDetails />} />
          <Route path='Platform_exams' element={<PlatformExams />} />

          <Route path='exam_content/:id' element={<ExamContent />} />
          <Route path='create_exam' element={<CreateExams />} />
          <Route path='add_sup_questions' element={<AddSubQuestions />} />
          <Route path='view_exams' element={<ViewExams />} />
          <Route path='all_exams' element={<AllExams />} />

          <Route path='exam_details/:id' element={<ExamDetails />} />
          <Route path='subject_exam/:id' element={<SubjectExam />} />
          <Route path='subject_exam/:id/review' element={<ReviewResult />} />

          <Route
            path='subject_exam/:id/questions'
            element={<ExamQuestions />}
          />
        </Route>

        <Route
          path='/code'
          element={
            <ProtectedRoute auth={isAdmin}>
              <Code />
            </ProtectedRoute>
          }
        />
        <Route
          path='/all_users'
          element={
            <ProtectedRoute auth={isAdmin}>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route element={<ProtectedRoute auth={student} />}>
          <Route path='/wallet' element={<Wallet />} />
          <Route path='studentStats' element={<StudentStats />} />
          <Route path='course_statistics' element={<CourseStatistics />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/my_lecture' element={<MyLecture />} />
          
          <Route path='/teacher/:id' element={<TeacherDetails />} />
          <Route path='/exam/:examId' element={<Exam />} />
        </Route>
        <Route element={<ProtectedRoute auth={isTeacher} />}>
          <Route path='/teacher_wallet' element={<TeacherWallet />} />
          <Route path='/teacher_code' element={<TeacherCode />} />
          <Route path='/teacher_exam/:examId' element={<ExamTeacher />} />
          <Route path='/teacher_courses/*' element={<TeacherCourses />}>
            <Route path='courses/:id' element={<AllCourses />} />
          </Route>
          <Route path='/my_groups' element={<MyGroups />}>
            <Route path='group/:id' element={<Groups />} />
          </Route>
          <Route path='/group/:id' element={<GroupDetails />} />
        </Route>
        <Route element={<ProtectedRoute auth={isTeacher || student} />}>
          <Route path='/lecture/:id' element={<LecturDetails />} />
          <Route path='/month/:id/' element={<Month />} />
          <Route path='/video/:videoId' element={<Vedio />} />

          <Route path='/video/:videoId' element={<Vedio />} />
        </Route>
        {""}
        <Route path='/chats' element={<ChatPage />} />
        <Route path='/center_groups' element={<GroupsPage />} />
        <Route path='/group_details/:id' element={<CenterGroupDetails />} />
        <Route path='/student/:id' element={<StudentDetails />} />

      </Routes>
    </div>
  );
};

export default AppRouter;
