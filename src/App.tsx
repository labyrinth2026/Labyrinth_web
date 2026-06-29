import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy loaded Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const VerticalsPage = lazy(() => import('./pages/VerticalsPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy loaded Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const FacultyDashboard = lazy(() => import('./pages/admin/FacultyDashboard'));
const TeamManager = lazy(() => import('./pages/admin/TeamManager'));
const RoleManager = lazy(() => import('./pages/admin/RoleManager'));
const FormsManager = lazy(() => import('./pages/admin/FormsManager'));
const ReportsManager = lazy(() => import('./pages/admin/ReportsManager'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#EAF4FF]">
    <div className="w-10 h-10 border-4 border-[#005BAC] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes key={location.pathname} location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/verticals" element={<VerticalsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="content" element={<ContentManager />} />
                <Route path="team" element={<TeamManager />} />
                <Route path="forms" element={<FormsManager />} />
                <Route path="reports" element={<ReportsManager />} />
                <Route path="registrations" element={<FacultyDashboard />} />
                <Route path="faculty" element={<FacultyDashboard />} />
                <Route path="roles" element={<RoleManager />} />
              </Route>

              {/* 404 Fallback Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

export default App;

