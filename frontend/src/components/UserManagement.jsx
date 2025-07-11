import { useEffect, useState } from 'react';
import API from '../api';
import './UserManagement.css'; // Your Google-style CSS
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.warn('All fields are required');
      return;
    }
    try {
      await API.post('/auth/users', form);
      toast.success('User created');
      setForm({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Create failed');
    }
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role });
    setEditId(user._id);
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/auth/users/${editId}`, form);
      toast.success('User updated');
      setEditId(null);
      setForm({ name: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Delete failed');
    }
  };

  return (
    <div className="user-management-container">
      <ToastContainer position="top-center" />
      <h2>User Management</h2>

      <div className="card">
        <h3>{editId ? 'Edit User' : 'Create User'}</h3>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        {!editId && (
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        )}
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="button-group">
          {editId ? (
            <>
              <button className="btn primary" onClick={handleUpdate}>Update</button>
              <button
                className="btn"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: '', email: '', password: '', role: 'user' });
                }}
              >Cancel</button>
            </>
          ) : (
            <button className="btn primary" onClick={handleCreate}>Create</button>
          )}
        </div>
      </div>

      <h3>All Users</h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button className="btn small" onClick={() => handleEdit(u)}>Edit</button>
                <button className="btn small danger" onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
