import { useState } from 'react';
import { login } from '../api/authApi';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.user.role);
      localStorage.setItem('email', result.user.email);
      onLogin(result.user);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="auth-card">
      <h1>Вход в систему</h1>
      <p>Демо: admin@example.com / password</p>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </main>
  );
}
