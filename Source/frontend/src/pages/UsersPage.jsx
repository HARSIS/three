import { useEffect, useState } from 'react';
import { createUser, getUsers } from '../api/usersApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', age: '', role: 'VIEWER' });
  const [error, setError] = useState('');

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
    try {
      await createUser({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        password: 'password',
      });
      setForm({ name: '', email: '', age: '', role: 'VIEWER' });
      await loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="panel users-panel">
      <h2>Пользователи</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <input placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Возраст" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
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
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
