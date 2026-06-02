import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import TreesPage from './pages/TreesPage';
import UsersPage from './pages/UsersPage';

function getSavedUser() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  if (!token || !role || !email) return null;
  return { email, role };
}

export default function App() {
  const [user, setUser] = useState(getSavedUser());
  const [page, setPage] = useState('trees');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <>
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
      {page === 'trees' && <TreesPage />}
      {page === 'users' && user.role === 'ADMIN' && <UsersPage />}
    </>
  );
}
