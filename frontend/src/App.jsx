import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import Header from './components/Layout/Header'; 
import HomePage from './pages/Home/HomePage';
import MovieDetailPage from './pages/MovieDetail/MovieDetailPage';
import LoginPage from './pages/Auth/LoginPage'; 
import FavoritePage from './pages/Favourite/FavouritePage'; 
import HistoryPage from './pages/History/HistoryPage';
import SearchPage from './pages/Search/SearchPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminLayout from './components/Admin/AdminLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import MovieManagementPage from './pages/Admin/MovieManagementPage';
import GenreManagementPage from './pages/Admin/GenreManagementPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import PremiumPage from './pages/Premium/PremiumPage';
import PaymentResultPage from './pages/Premium/PaymentResultPage';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className='App bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300'>
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/favorites" element={<FavoritePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="movies" element={<MovieManagementPage />} />
          <Route path="genres" element={<GenreManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>  
  );
}

export default App;