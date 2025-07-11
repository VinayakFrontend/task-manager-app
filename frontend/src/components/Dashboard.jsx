import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import API from '../api';
import UserManagement from './UserManagement';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [me, setMe] = useState({});
  const [userList, setUserList] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const commentRefs = useRef({});
  const [view, setView] = useState('tasks');
  const navigate = useNavigate(); 

  useEffect(() => {
    (async () => {
      const tokenData = parseJwt(localStorage.getItem('token'));
      if (!tokenData?.user) return navigate('/login');
      setMe(tokenData);

      if (tokenData.user?.role === 'admin') {
        const usersRes = await API.get('/auth/users');
        setUserList(usersRes.data);
      }

      await loadTasks(tokenData.user?.role);
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully!');
    setTimeout(() => navigate('/login'), 1000);
  };

  function parseJwt(token) {
    if (!token) return {};
    try {
      const base = token.split('.')[1];
      return JSON.parse(atob(base));
    } catch {
      return {};
    }
  }

  const loadTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to load tasks');
    }
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.assignedTo) {
      toast.warn('Title and Assigned User are required');
      return;
    }

    try {
      await API.post('/tasks', newTask);
      toast.success('Task created!');
      setNewTask({ title: '', description: '', assignedTo: '' });
      loadTasks(me.user?.role);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create task');
    }
  };

  const startEdit = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo._id,
    });
    setEditingTaskId(task._id);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setNewTask({ title: '', description: '', assignedTo: '' });
  };

  const saveEdit = async () => {
    try {
      await API.put(`/tasks/${editingTaskId}`, newTask);
      toast.success('Task updated!');
      cancelEdit();
      loadTasks(me.user?.role);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted!');
      loadTasks(me.user?.role);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete task');
    }
  };

  const complete = async (id) => {
    try {
      await API.put(`/tasks/${id}/complete`);
      toast.success('Task marked complete!');
      loadTasks(me.user?.role);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to complete task');
    }
  };

  const addComment = async (id) => {
    const commentText = commentRefs.current[id]?.value.trim();
    if (!commentText) return toast.warn('Comment cannot be empty');

    try {
      await API.put(`/tasks/${id}/comment`, { comment: { text: commentText } });
      commentRefs.current[id].value = '';
      toast.success('Comment added!');
      loadTasks(me.user?.role);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add comment');
    }
  };

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <ToastContainer position="top-center" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard (You: {me.user?.role})</h2>
        <button onClick={logout} style={{
          padding: '8px 14px',
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      {me.user?.role === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setView('tasks')}
            className={view === 'tasks' ? 'btn primary' : 'btn'}
            style={{ marginRight: '10px' }}
          >
            Task Management
          </button>
          <button
            onClick={() => setView('users')}
            className={view === 'users' ? 'btn primary' : 'btn'}
          >
            User Management
          </button>
        </div>
      )}

      {me.user?.role === 'admin' && view === 'users' && (
        <UserManagement />
      )}

      {view === 'tasks' && (
        <>
          {me.user?.role === 'admin' && (
            <div className="task-form">
              <h3>{editingTaskId ? 'Edit Task' : 'Create Task'}</h3>
              <input
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                <option value="">-- Select user to assign --</option>
                {userList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {editingTaskId ? (
                <>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <button onClick={addTask}>Create</button>
              )}
            </div>
          )}

          <h3>My Tasks</h3>
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t._id} style={{ marginBottom: '16px' }}>
                <div>
                  <b>{t.title}</b> – {t.status}<br />
                  {t.description}

                  {me.user?.role === 'admin' && t.assignedTo && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Assigned to: {t.assignedTo.name} ({t.assignedTo.email})
                    </div>
                  )}

                  {t.comments?.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <b>Comments:</b>
                      <ul style={{ paddingLeft: '20px' }}>
                        {t.comments.map((c, i) => (
                          <li key={i}>{c.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {['admin', 'user'].includes(me.user?.role) && (
                    <>
                      <input
                        placeholder="Add a comment"
                        ref={(el) => (commentRefs.current[t._id] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addComment(t._id);
                        }}
                      />
                      <button onClick={() => addComment(t._id)}>Post</button>
                    </>
                  )}
                </div>

                {t.status === 'pending' && me.user?.role === 'user' && (
                  <button onClick={() => complete(t._id)}>Mark Complete</button>
                )}

                {me.user?.role === 'admin' && (
                  <>
                    <button onClick={() => startEdit(t)}>Edit</button>
                    <button onClick={() => deleteTask(t._id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
