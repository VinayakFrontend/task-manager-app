# 📝 MERN Task Manager with Role-Based Access

This is a full-stack MERN (MongoDB, Express, React, Node.js) Task Manager app that includes:

- Role-based Authentication (Admin & User)
- User Management (Admin only)
- Task CRUD (Create, Read, Update, Delete)
- Task Comments
- Task Completion (User)
- Toast Notifications
- Responsive UI
- JWT Protected Routes

## 🚀 Live Demo

You can deploy:
- **Frontend** on [Vercel](https://task-manager-app-mauve-three.vercel.app/)
- **Backend** on [Render](https://render.com/](https://task-manager-app-xp9b.onrender.com/))

## 📁 Folder Structure

```
root/
├── backend/        # Express + MongoDB + JWT
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
├── frontend/       # React + Axios + React Router + Toastify
│   ├── pages/
│   ├── components/
│   ├── api.js
│   └── App.js
```

## 🔧 Technologies Used

- **Frontend:** React, Axios, React Router, Toastify
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Bcrypt, JSON Web Tokens
- **Deployment:** Vercel (frontend), Render (backend)

## 🔐 Roles

| Role   | Features                       |
|--------|--------------------------------|
| Admin  | Manage users, create/edit/delete tasks, comment |
| User   | View assigned tasks, comment, mark complete     |

## ⚙️ How to Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/mern-task-manager.git
cd mern-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start Backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```


Start Frontend:

```bash
npm run dev
```

## 🌐 Deployment Instructions

### Backend (Render)

- New Web Service
- Build command: `npm install`
- Start command: `node server.js`
- Add env vars: `MONGO_URI`, `JWT_SECRET`

### Frontend (Vercel)

- Import frontend folder
- Add env: `REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api`

## ✅ Features

- Secure login/signup with JWT
- Admin can manage users/tasks
- User can complete tasks and comment
- Real-time toast notifications
- Fully responsive

