# 💼 TalentBridge — AI-Powered Job Portal

A modern **full-stack job portal** with role-based access (Seeker, Recruiter, Admin) and an **AI-powered resume analyzer** that matches candidate skills with job requirements.

🚀 Built with **React + Vite · Node.js · Express · MongoDB Atlas · Cloudinary**
---
## 🌟 Key Highlights

* 🔐 **Role-Based Authentication** (Seeker, Recruiter, Admin)
* 🤖 **AI Resume Analyzer** (Skill extraction + match scoring)
* 🏢 **Recruiter Dashboard** (Post & manage jobs)
* 📊 **Admin Panel** (User control + analytics)
* 📄 **Cloud Resume Upload** (via Cloudinary)
* ⚡ Fully responsive and production-ready

---

## 🛠️ Tech Stack

**Frontend**

* React (Vite)
* Axios
* Context API

**Backend**

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication

**Other Tools**

* Cloudinary (file uploads)
* PDF parsing (resume analysis)

---

## 🧠 Resume Analyzer (Core Feature)

* Extracts text from uploaded PDF resumes
* Identifies **60+ technical skills**
* Matches resume skills with job requirements
* Generates:

  * ✅ Match Score (0–100%)
  * ✅ Matched Skills
  * ❌ Missing Skills
  * 💡 Strength Insights

---

## 👥 User Roles

| Role         | Features                                              |
| ------------ | ----------------------------------------------------- |
| 👤 Seeker    | Browse jobs, apply, upload resume, track applications |
| 🏢 Recruiter | Post jobs, manage applicants, view AI scores          |
| 🛠️ Admin    | Approve recruiters, manage users, analytics           |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd job-portal
```

---

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Setup Environment Variables

Create `.env` inside `backend/`:

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

---

### 4. Seed Admin User

```bash
cd backend
node seed.js
```

**Credentials:**

```
Email: admin@tb.com  
Password: admin123
```

---

### 5. Run the Project

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Open → **http://localhost:5173**

---

## 🔐 Authentication Flow

* JWT-based authentication
* Token stored in localStorage
* Protected routes with middleware
* Auto logout on unauthorized access

---

## 📡 API Overview

* `/api/auth` → Authentication
* `/api/jobs` → Job management
* `/api/applications` → Apply & track
* `/api/admin` → Admin controls
* `/api/resume` → Resume upload & analysis

---

## 🌐 Deployment

**Frontend:** Vercel
**Backend:** Render / Railway

Update environment variables accordingly:

```env
CLIENT_URL=https://your-frontend-url
VITE_API_URL=https://your-backend-url
```

---

## 🎯 Future Improvements

* AI-based job recommendations
* Resume feedback suggestions
* Real-time notifications
* Interview scheduling automation

---

## 📌 Author

**Yogesh Pande**

---

## ⭐ Show your support

If you like this project, give it a ⭐ on GitHub!

---

