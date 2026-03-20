import { useState } from 'react';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import CabinetPage from '@/pages/CabinetPage';
import ServicesPage from '@/pages/ServicesPage';
import BookingPage from '@/pages/BookingPage';
import ContactsPage from '@/pages/ContactsPage';
import AdminPage from '@/pages/AdminPage';

interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export default function Index() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);

  const handleNavigate = (page: string) => {
    if ((page === 'cabinet' || page === 'admin') && !user) {
      setCurrentPage('auth');
      return;
    }
    if (page === 'admin' && user?.role !== 'admin') {
      setCurrentPage('cabinet');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage(u.role === 'admin' ? 'admin' : 'cabinet');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'auth': return <AuthPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'cabinet': return user ? <CabinetPage user={user} onNavigate={handleNavigate} /> : <AuthPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'services': return <ServicesPage onNavigate={handleNavigate} />;
      case 'booking': return <BookingPage user={user} onNavigate={handleNavigate} />;
      case 'contacts': return <ContactsPage />;
      case 'admin': return user?.role === 'admin' ? <AdminPage /> : <AuthPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (currentPage === 'auth') {
    return <AuthPage onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}