import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AssignBookPage from './pages/AssignBookPage';
import ShareQuotePage from './pages/ShareQuotePage';
import StudentBooksPage from './pages/StudentBooksPage';
import TeacherReportsPage from './pages/TeacherReportsPage';
import StudentQuotesPage from './pages/StudentQuotesPage';
import BadgesPage from './pages/BadgesPage';
import TeacherQuotesPage from './pages/TeacherQuotesPage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import AssignmentDetailsPage from './pages/AssignmentDetailsPage';
import WriteSummaryPage from './pages/WriteSummaryPage';
import StudentSummariesPage from './pages/StudentSummariesPage';
import StudentTasksPage from './pages/StudentTasksPage';
import ClassDetailPage from './pages/ClassDetailPage';
import TeacherClassDetailPage from './pages/TeacherClassDetailPage';

import { BadgeProvider } from './context/BadgeContext';

function App() {
  return (
    <BadgeProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/assign-book" element={<AssignBookPage />} />
          <Route path="/share-quote" element={<ShareQuotePage />} />
          <Route path="/dashboard/books" element={<StudentBooksPage />} />
          <Route path="/dashboard/reports" element={<TeacherReportsPage />} />
          <Route path="/dashboard/my-quotes" element={<StudentQuotesPage />} />
          <Route path="/dashboard/summaries" element={<StudentSummariesPage />} />
          <Route path="/dashboard/tasks" element={<StudentTasksPage />} />
          <Route path="/dashboard/badges" element={<BadgesPage />} />
          <Route path="/dashboard/teacher/quotes" element={<TeacherQuotesPage />} />
          <Route path="/dashboard/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/assignment/:id" element={<AssignmentDetailsPage />} />
          <Route path="/assignment/:id/write-summary" element={<WriteSummaryPage />} />
          <Route path="/dashboard/class/:id" element={<ClassDetailPage />} />
          <Route path="/dashboard/teacher/class/:id" element={<TeacherClassDetailPage />} />
        </Routes>
      </MainLayout>
    </BadgeProvider>
  );
}

export default App;
