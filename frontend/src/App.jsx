import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Seeker pages
import SeekerLayout from './pages/seeker/SeekerLayout';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import BrowseJobs from './pages/seeker/BrowseJobs';
import JobDetail from './pages/seeker/JobDetail';
import MyApplications from './pages/seeker/MyApplications';
import SeekerProfile from './pages/seeker/SeekerProfile';
import SavedJobs from './pages/seeker/SavedJobs';
import ResumeAnalyzer from './pages/seeker/ResumeAnalyzer';

// Recruiter pages
import RecruiterLayout from './pages/recruiter/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import MyJobs from './pages/recruiter/MyJobs';
import Applicants from './pages/recruiter/Applicants';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import CompanyProfile from './pages/recruiter/CompanyProfile';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';

// Guards
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/seeker" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#000' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Seeker */}
        <Route path="/seeker" element={<ProtectedRoute roles={['seeker']}><SeekerLayout /></ProtectedRoute>}>
          <Route index element={<SeekerDashboard />} />
          <Route path="jobs" element={<BrowseJobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="saved" element={<SavedJobs />} />
          <Route path="analyzer" element={<ResumeAnalyzer />} />
        </Route>

        {/* Recruiter */}
        <Route path="/recruiter" element={<ProtectedRoute roles={['recruiter']}><RecruiterLayout /></ProtectedRoute>}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="jobs/:id/edit" element={<PostJob />} />
          <Route path="jobs/:id/applicants" element={<Applicants />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="company" element={<CompanyProfile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
