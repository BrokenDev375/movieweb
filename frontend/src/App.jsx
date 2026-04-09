import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import Header from './components/Layout/Header'; 
import HomePage from './pages/Home/HomePage';
import MovieDetailPage from './pages/MovieDetail/MovieDetailPage';
import LoginPage from './pages/Auth/LoginPage'; 
import FavoritePage from './pages/Favourite/FavouritePage'; 
import HistoryPage from './pages/History/HistoryPage';
import SearchPage from './pages/Search/SearchPage';
import RegisterPage from './pages/Auth/RegisterPage';

function App() {
  return (
    <AuthProvider> 
      <div className='App bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300'>
        <Header /> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </AuthProvider>  
  );
}

export default App;