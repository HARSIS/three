import { useEffect, useState } from 'react';
import { createUser, deleteUser, getUsers } from '../api/usersApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    role: 'VIEWER',
    password: '',
  });
  const [error, setError] = useState('');

  const currentUserEmail = localStorage.getItem('email');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password && form.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    try {
      await createUser({
        name: form.name,
        email: form.email,
        age: form.age ? Number(form.age) : undefined,
        role: form.role,
        password: form.password || 'password',
      });

      setForm({
        name: '',
        email: '',
        age: '',
        role: 'VIEWER',
        password: '',
      });

      await loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteUser(user) {
    if (user.email === currentUserEmail) {
      setError('Нельзя удалить пользователя, под которым выполнен вход');
      return;
    }

    const confirmed = confirm(
      `Удалить пользователя "${user.name}" (${user.email})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteUser(user.id);
      await loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="panel users-panel">
      <h2>Пользователи</h2>

      <form onSubmit={handleSubmit} className="user-form">
        <input
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Возраст"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <input
          placeholder="Пароль, например password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="EDITOR">EDITOR</option>
          <option value="VIEWER">VIEWER</option>
        </select>

        <button>Создать пользователя</button>
      </form>

      {error && <div className="error">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Возраст</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.age ?? '-'}</td>
              <td>{user.role}</td>
              <td>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDeleteUser(user)}
                  disabled={user.email === currentUserEmail}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}