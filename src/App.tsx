import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import ActivityDetail from './pages/ActivityDetail/ActivityDetail';
import Profile from './pages/Profile/Profile';
import ExportPage from './pages/Export/ExportPage';
import ServiceReview from './pages/Admin/ServiceReview';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminActivities from './pages/Admin/AdminActivities';
import ActivityForm from './pages/Admin/ActivityForm';
import AdminRegistrations from './pages/Admin/AdminRegistrations';
import AdminWorkHours from './pages/Admin/AdminWorkHours';
import AdminCertificates from './pages/Admin/AdminCertificates';
import { useUserStore } from './store/useUserStore';
import { useActivityStore } from './store/useActivityStore';
import { useRegistrationStore } from './store/useRegistrationStore';
import { useCheckinStore } from './store/useCheckinStore';
import { useWorkHourStore } from './store/useWorkHourStore';
import { useCertificateStore } from './store/useCertificateStore';
import { useExportStore } from './store/useExportStore';
import { useServiceQualityStore } from './store/useServiceQualityStore';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadUsers = useUserStore(state => state.loadUsers);
  const loadActivities = useActivityStore(state => state.loadActivities);
  const loadRegistrations = useRegistrationStore(state => state.loadRegistrations);
  const loadCheckins = useCheckinStore(state => state.loadCheckins);
  const loadWorkHours = useWorkHourStore(state => state.loadWorkHours);
  const loadCertificates = useCertificateStore(state => state.loadCertificates);
  const loadExportHistory = useExportStore(state => state.loadExportHistory);
  const loadServiceQuality = useServiceQualityStore(state => state.loadRecords);

  useEffect(() => {
    loadUsers();
    loadActivities();
    loadRegistrations();
    loadCheckins();
    loadWorkHours();
    loadCertificates();
    loadExportHistory();
    loadServiceQuality();
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="activity/:id" element={<ActivityDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="export" element={<ExportPage />} />
      </Route>
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="activities/new" element={<ActivityForm />} />
        <Route path="activities/:id/edit" element={<ActivityForm />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="workhours" element={<AdminWorkHours />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="service-review" element={<ServiceReview />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
