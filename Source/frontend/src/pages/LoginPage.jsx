import { useState } from 'react';
import { login, register } from '../api/authApi';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');

  const [loginForm, setLoginForm] = useState({
    email: 'admin2@example.com',
    password: 'password',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
    passwordRepeat: '',
  });

  const [error, setError] = useState('');

  function saveAuth(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('role', result.user.role);
    localStorage.setItem('email', result.user.email);
    onLogin(result.user);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const result = await login(loginForm.email, loginForm.password);
      saveAuth(result);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setError('');

    if (!registerForm.name.trim()) {
      setError('Введите имя');
      return;
    }

    if (!registerForm.email.trim()) {
      setError('Введите email');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    if (registerForm.password !== registerForm.passwordRepeat) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const result = await register({
        name: registerForm.name,
        email: registerForm.email,
        age: registerForm.age ? Number(registerForm.age) : undefined,
        password: registerForm.password,
        role: 'VIEWER',
      });

      saveAuth(result);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="auth-card">
      <h1>{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</h1>

      <div className="auth-tabs">
        <button
          type="button"
          className={mode === 'login' ? 'selected' : ''}
          onClick={() => {
            setMode('login');
            setError('');
          }}
        >
          Вход
        </button>

        <button
          type="button"
          className={mode === 'register' ? 'selected' : ''}
          onClick={() => {
            setMode('register');
            setError('');
          }}
        >
          Регистрация
        </button>
      </div>

      {mode === 'login' && (
        <>
          <p>Демо: admin2@example.com / password</p>

          <form onSubmit={handleLoginSubmit}>
            <label>Email</label>
            <input
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
            />

            <label>Пароль</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />

            {error && <div className="error">{error}</div>}

            <button type="submit">Войти</button>
          </form>
        </>
      )}

      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit}>
          <label>Имя</label>
          <input
            placeholder="Введите имя"
            value={registerForm.name}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
          />

          <label>Email</label>
          <input
            placeholder="Введите email"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
          />

          <label>Возраст</label>
          <input
            placeholder="Введите возраст"
            value={registerForm.age}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, age: e.target.value })
            }
          />

          <label>Пароль</label>
          <input
            type="password"
            placeholder="Минимум 6 символов"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
          />

          <label>Повторите пароль</label>
          <input
            type="password"
            placeholder="Повторите пароль"
            value={registerForm.passwordRepeat}
            onChange={(e) =>
              setRegisterForm({
                ...registerForm,
                passwordRepeat: e.target.value,
              })
            }
          />

          {error && <div className="error">{error}</div>}

          <button type="submit">Зарегистрироваться</button>
        </form>
      )}
    </main>
  );
}