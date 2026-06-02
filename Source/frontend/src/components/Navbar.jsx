export default function Navbar({ page, setPage, user, onLogout, theme, toggleTheme }) {
  return (
    <header className="navbar">
      <div>
        <strong>Дерево знаний</strong>
        <span className="subtitle">КР, вариант 27</span>
      </div>

      {user && (
        <nav>
          <button className={page === 'trees' ? 'active' : ''} onClick={() => setPage('trees')}>Деревья</button>
          {user.role === 'ADMIN' && (
            <button className={page === 'users' ? 'active' : ''} onClick={() => setPage('users')}>Пользователи</button>
          )}
          <button onClick={toggleTheme}>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</button>
          <button onClick={onLogout}>Выйти</button>
        </nav>
      )}
    </header>
  );
}
