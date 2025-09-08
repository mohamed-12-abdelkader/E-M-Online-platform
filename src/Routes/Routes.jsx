import { Routes, Route } from "react-router-dom";

// Auth & Login Components
import Login from "../pages/login/Login";
import SingUp from "../pages/signup/SingUp";
import LoginPage from "../pages/login/LoginPage";
import TeacherLogin from "../pages/login/TeacerLogin";
import AdminLogin from "../pages/login/AdminLogin";
import VerifyCode from "../pages/password/VerifyCode";
import ResetPassword from "../pages/password/ResetPassword";

// Main Pages
import Home from "../pages/home/Home";
import HomePage from "../pages/homePage/HomePage";
import HomeLogin from "../pages/homeLogin/HomeLogin";
import LandingPage from "../pages/landingPage/LandingPage";
import NotFound from "../components/not found/NotFound";

// Admin Components
import Admin from "../pages/Admin/Admin";
import AdminMange from "../components/admin/AdminMange";
import AdminCreateCode from "../components/admin/AdminCreateCode";
import AdminTeacherBalances from "../components/admin/AdminTeacherBalances";
import AddTeacher from "../components/admin/AddTeacher";
import AddEmployees from "../components/admin/AddEmployees";
import { MangeEmployees } from "../components/admin/MangeEmployees";
import OpenPhone from "../components/admin/OpenPhone";
import CreateComp from "../components/admin/CreateComp";
import AllComps from "../components/admin/AllComps";
import PackagesManagement from "../components/admin/PackagesManagement";
import AdminStreamsList from "../components/stream/adminList";

// Teacher Components
import CreateLecture from "../components/admin/teacher/CreateLecture";
import AddVideo from "../components/admin/teacher/AddVideo";
import CreateGroup from "../components/admin/teacher/CreateGroup";
import AddStudent from "../components/admin/teacher/AddStudent";
import AddExam from "../components/admin/teacher/AddExam";
import AddQuestion from "../components/admin/teacher/AddQuestion";
import AddPdf from "../components/admin/teacher/AddPdf";
import AddMonth from "../components/admin/teacher/AddMonth";
import AddLectureToMonth from "../components/admin/teacher/AddLectureToMonth";
import CreateCode from "../components/admin/teacher/CreateCode";
import AllResult from "../components/admin/teacher/AllResult";
import StudentResult from "../components/admin/teacher/StudentResult";

// Student Components
import Profile from "../pages/profile/Profile";
import Wallet from "../pages/wallet/Wallet";
import TeacherWallet from "../pages/wallet/TeacherWallet";
import TeacherDetails from "../pages/teacher/TeacherDetails";
import MyLecture from "../pages/leacter/MyLecture";
import LecturDetails from "../pages/leacter/LecturDetails";
import Vedio from "../pages/leacter/Vedio";
import MyGroups from "../pages/groups/MyGroups";
import Groups from "../pages/groups/Groups";
import GroupDetails from "../pages/groups/GroupDetails";
import AllTeacherLogin from "../components/teacher/AllTeacherLogin";
import FreeCourses from "../components/home/FreeCourses";
import MyTeacher from "../pages/myTeacher/MyTeacher";
import SuggestedTeachers from "../pages/suggested-teachers/SuggestedTeachers";

// Exam Components
import Exam from "../pages/exam/Exam";
import ExamTeacher from "../pages/exam/ExamTeacher";
import ComprehensiveExam from "../pages/exam/ComprehensiveExam";
import ExamGrades from "../pages/exam/ExamGrades";
import PlatformExams from "../pages/PlatformExams/PlatformExams";
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
import ReviewResult from "../pages/monthlyExams/ReviewResult";

// Question Bank Components
import QuestionBank from "../pages/Question Bank/QuestionBank";
import ChapterQuestion from "../pages/Question Bank/ChapterQuestion";
import SubjectPage from "../pages/Question Bank/SubjectPage";
import QuestionsPage from "../pages/Question Bank/QuestionsPage";
import QuestionBankDashboard from "../pages/Question Bank/QuestionBankDashboard";
import QuestionLibraryPage from "../pages/Question Bank/QuestionLibraryPage";
import Lesson from "../pages/Question Bank/Lesson";
import TeacherSubject from "../pages/Question Bank/TeacherSubject";

// Competition Components
import Competitions from "../pages/competitions/Competitions";
import CompetitionDetails from "../pages/competitions/CompetitionDetails";
import TheFirsts from "../pages/theFirsts/TheFirsts";

// Course Components
import TeacherCourses from "../pages/teacherCourses/TeacherCourses";
import AllCourses from "../pages/teacherCourses/AllCourses";
import CourseDetailsPage from "../pages/course/CourseDetailsPage";
import CourseStatisticsPage from "../pages/course/CourseStatisticsPage";
import CourseStatistics from "../pages/courseStatistics/CourseStatistics";

// Chat Components
import ChatPage from "../pages/chat/ChatPage";
import TeacherChat from "../pages/chat/TeacherChatPage";
import ChatbotPage from "../pages/chatbot/ChatbotPage";
import TeamChat from "../pages/teamChatPage/TeamChat";

// Center System Components
import GroupsPage from "../pages/centerSystem/GroupsPage";
import CenterGroupDetails from "../pages/centerSystem/CenterGroupDetails";
import StudentDetails from "../components/centerSystem/StudentDetails";
import StudentDetailsPage from "../pages/centerSystem/StudentDetailsPage";

// Other Components
import Code from "../pages/code/Code";
import TeacherCode from "../pages/code/TeacherCode";
import Month from "../pages/month/Month";
import StudentStats from "../pages/myStatistics/MyStatistics";
import AllUsers from "../pages/allUsers/AllUsers";
import TasksPage from "../pages/tasks/TasksPage";
import AllStudents from "../pages/allStudents/AllStudents";
import LecturCommints from "../pages/lecturCommints/LecturCommints";
import Social from "../pages/social/Social";
import PlatfourmLeagues from "../pages/league/PlatfourmLeagues";
import League from "../pages/league/League";
import LecturesSchedule from "../pages/lecturesSchedule/LecturesSchedule";
import PlatformAccounts from "../pages/financial-accounts/FinancialAccounts";
import AdminDashboardHome from "../pages/home/AdminDashboardHome";
import TeacherDashboardHome from "../pages/home/TeacherDashboardHome";

// Hooks & Utils
import UserType from "../Hooks/auth/userType";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import ProtectedLogin from "../components/protectedRoute/ProtectedLogin";


const AppRouter = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <LoginPage />
            </ProtectedLogin>
          }
        />
        <Route
          path="/student_login"
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <Login />
            </ProtectedLogin>
          }
        />
        <Route
          path="/teacher_login"
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <TeacherLogin />
            </ProtectedLogin>
          }
        />
        <Route
          path="/admin_login"
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <AdminLogin />
            </ProtectedLogin>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedLogin auth={isAdmin || student || isTeacher}>
              <SingUp />
            </ProtectedLogin>
          }
        />
        <Route path="/verify_code" element={<VerifyCode />} />
        <Route path="/rest_pass" element={<ResetPassword />} />

        {/* Admin Only Routes */}
        <Route
          path="/code"
          element={
            <ProtectedRoute auth={isAdmin}>
              <Code />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all_users"
          element={
            <ProtectedRoute auth={isAdmin}>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all_students"
          element={
            <ProtectedRoute auth={isAdmin}>
              <AllStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packages-management"
          element={
            <ProtectedRoute auth={isAdmin}>
              <PackagesManagement />
            </ProtectedRoute>
          }
        />

        {/* Streams Route */}
        <Route
          path="/streams"
          element={
            <ProtectedRoute auth={isAdmin}>
              <HomeLogin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminStreamsList />} />
        </Route>

        {/* Admin Panel Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute auth={isAdmin || isTeacher}>
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute auth={isAdmin} />}>
            <Route path="management" element={<AdminMange />} />
            <Route path="add_employees" element={<AddEmployees />} />
            <Route path="mange_employees" element={<MangeEmployees />} />
            <Route path="addteacher" element={<AddTeacher />} />
            <Route path="create_code" element={<AdminCreateCode />} />
            <Route path="cridet" element={<AdminTeacherBalances />} />
            <Route path="open_phone" element={<OpenPhone />} />
          </Route>
          
          {/* Teacher Routes */}
          <Route element={<ProtectedRoute auth={isTeacher} />}>
            <Route path="create_lecture" element={<CreateLecture />} />
            <Route path="add_video" element={<AddVideo />} />
            <Route path="add_month" element={<AddMonth />} />
            <Route path="add_lecture_month" element={<AddLectureToMonth />} />
            <Route path="create_group" element={<CreateGroup />} />
            <Route path="add_student" element={<AddStudent />} />
            <Route path="add_pdf" element={<AddPdf />} />
            <Route path="create_codee" element={<CreateCode />} />
            <Route path="add_question" element={<AddQuestion />} />
            <Route path="result/" element={<AllResult />}>
              <Route path="all_result/:resId" element={<StudentResult />} />
            </Route>
          </Route>
        </Route>

        {/* Main App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute auth={isAdmin || isTeacher || student}>
              <HomeLogin />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="home"
            element={
              isAdmin ? (
                <AdminDashboardHome />
              ) : isTeacher ? (
                <TeacherDashboardHome />
              ) : (
                <HomePage />
              )
            }
          />

          {/* Profile & Settings */}
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<Wallet />} />

          {/* Teachers */}
          <Route path="teachers" element={<AllTeacherLogin />} />
          <Route path="suggested-teachers" element={<SuggestedTeachers />} />
          <Route path="my-teachers" element={<MyTeacher />} />
          <Route path="teacher/:id" element={<TeacherDetails />} />

          {/* Courses */}
          <Route path="my_courses" element={<MyLecture />} />
          <Route path="free_courses" element={<FreeCourses />} />
          <Route path="lecture/:id" element={<LecturDetails />} />
          <Route path="month/:id/" element={<Month />} />
          <Route path="video/:videoId" element={<Vedio />} />

          {/* Groups */}
          <Route path="my_groups" element={<MyGroups />}>
            <Route path="group/:id" element={<Groups />} />
          </Route>
          <Route path="group/:id" element={<GroupDetails />} />

          {/* Competitions */}
          <Route path="competitions" element={<Competitions />} />
          <Route path="competition/:id" element={<CompetitionDetails />} />
          <Route path="the_Firsts" element={<TheFirsts />} />

          {/* Question Bank */}
          <Route path="question-bank/:id" element={<QuestionBank />} />
          <Route path="question_bank" element={<QuestionBank />} />
          <Route path="supject/:id" element={<SubjectPage />} />
          <Route path="QuestionsPage/:id" element={<QuestionsPage />} />
          <Route path="chapter/:id" element={<ChapterQuestion />} />
          <Route path="lesson/:id" element={<Lesson />} />
          <Route path="Teacher_subjects" element={<TeacherSubject />} />
          <Route path="question-bank-dashboard" element={<QuestionBankDashboard />} />
          <Route path="dashboard" element={<QuestionBankDashboard />} />
          <Route path="QuestionLibraryPage" element={<QuestionLibraryPage />} />

          {/* Exams */}
          <Route path="Platform_exams" element={<PlatformExams />} />
          <Route path="exam_content/:id" element={<ExamContent />} />
          <Route path="create_exam" element={<CreateExams />} />
          <Route path="add_sup_questions" element={<AddSubQuestions />} />
          <Route path="view_exams" element={<ViewExams />} />
          <Route path="all_exams" element={<AllExams />} />
          <Route path="exam_details/:id" element={<ExamDetails />} />
          <Route path="subject_exam/:id" element={<SubjectExam />} />
          <Route path="subject_exam/:id/review" element={<ReviewResult />} />
          <Route path="subject_exam/:id/questions" element={<ExamQuestions />} />
          <Route path="monthly_exam/:id" element={<MonthlyExams />} />
          <Route path="monthly_exam/:id/show_grades" element={<ShowGrades />} />
          <Route path="exam/:examId" element={<Exam />} />
          <Route path="exam_grades" element={<ExamGrades />} />
          <Route path="ComprehensiveExam/:id" element={<ComprehensiveExam />} />

          {/* Leagues */}
          <Route path="leagues" element={<PlatfourmLeagues />} />
          <Route path="league/:id" element={<League />} />

          {/* Chat */}
          <Route path="chatbot-page" element={<ChatbotPage />} />
          <Route path="chats" element={<ChatPage />} />
          <Route path="TeacherChat" element={<TeacherChat />} />
          <Route path="teamChat" element={<TeamChat />} />

          {/* Center System */}
          <Route path="center_groups" element={<GroupsPage />} />
          <Route path="group_details/:id" element={<CenterGroupDetails />} />
          <Route path="student/:id" element={<StudentDetails />} />
          <Route path="group/:groupId/student/:studentId" element={<StudentDetailsPage />} />

          {/* Other Pages */}
          <Route path="social" element={<Social />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="lectur_commints/:id" element={<LecturCommints />} />

          {/* Course Details */}
          <Route path="CourseDetailsPage/:id" element={<CourseDetailsPage />} />
          <Route path="CourseStatisticsPage/:id" element={<CourseStatisticsPage />} />

          {/* Financial */}
          <Route path="PlatformAccounts" element={<PlatformAccounts />} />
          <Route path="LecturesSchedule" element={<LecturesSchedule />} />

          {/* Admin/Teacher Competition Management */}
          <Route path="create_comp" element={<CreateComp />} />
          <Route path="allComps" element={<AllComps />} />
          <Route path="add_sub_exam" element={<AddSExam />} />
        </Route>

        {/* Teacher Specific Routes */}
        <Route element={<ProtectedRoute auth={isTeacher} />}>
          <Route path="teacher_wallet" element={<TeacherWallet />} />
          <Route path="teacher_code" element={<TeacherCode />} />
          <Route path="teacher_exam/:examId" element={<ExamTeacher />} />
          <Route path="teacher_courses/*" element={<TeacherCourses />}>
            <Route path="courses/:id" element={<AllCourses />} />
          </Route>
        </Route>

        {/* Student Specific Routes */}
        <Route element={<ProtectedRoute auth={student} />}>
          <Route path="studentStats" element={<StudentStats />} />
          <Route path="course_statistics" element={<CourseStatistics />} />
          <Route path="my_lecture" element={<MyLecture />} />
        </Route>

        {/* Shared Routes */}
        <Route element={<ProtectedRoute auth={isTeacher || student} />}>
          <Route path="lecture/:id" element={<LecturDetails />} />
          <Route path="month/:id/" element={<Month />} />
          <Route path="video/:videoId" element={<Vedio />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AppRouter;
