# 💼 TalentBridge — Job Portal with Resume Analyzer

A full-stack job portal with AI-powered resume skill matching.  
**Stack:** React + Vite · Node.js + Express · MongoDB Atlas · Cloudinary

---

## 📁 Project Structure

```
job-portal/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection
│   │   └── cloudinary.js      # Cloudinary upload config
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile, notifications
│   │   ├── jobController.js   # CRUD jobs, save, filter/search
│   │   ├── applicationController.js  # Apply, track, AI analysis
│   │   ├── companyController.js      # Company profile
│   │   ├── resumeController.js       # Resume upload
│   │   └── adminController.js        # Platform analytics, user mgmt
│   ├── middleware/
│   │   └── auth.js            # JWT protect + RBAC authorize
│   ├── models/
│   │   ├── User.js            # User schema (seeker/recruiter/admin)
│   │   ├── Job.js             # Job posting schema
│   │   ├── Application.js     # Application + analysis results
│   │   └── Company.js         # Company profile
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── companies.js
│   │   ├── admin.js
│   │   └── resume.js
│   ├── utils/
│   │   └── resumeParser.js    # PDF parsing + skill extraction + matching
│   ├── server.js              # Express entry point
│   ├── seed.js                # Creates admin user
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── utils/
        │   └── api.js           # Axios instance with JWT
        ├── components/
        │   └── Sidebar.jsx      # Shared sidebar for all layouts
        └── pages/
            ├── Landing.jsx      # Homepage with dual portal cards
            ├── Login.jsx
            ├── Register.jsx
            ├── seeker/          # All job seeker pages
            ├── recruiter/       # All recruiter pages
            └── admin/           # Admin dashboard + management
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier — for resume/logo uploads)

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

**Getting Cloudinary keys:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Copy Cloud Name, API Key, API Secret

**Getting MongoDB URI:**
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Network Access → Add IP `0.0.0.0/0`
3. Database Access → Create user with password
4. Connect → Compass / Drivers → Copy URI

---

### 3. Seed the Admin User

```bash
cd backend
node seed.js
```

This creates:
```
Email:    admin@tb.com
Password: admin123
```

---

### 4. Run the Project

**Backend (port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open → **http://localhost:5173**

---

## 🔐 Authentication & Roles

| Role | Access | Notes |
|------|--------|-------|
| **Seeker** | Browse jobs, apply, resume analyzer, profile | Auto-approved on register |
| **Recruiter** | Post jobs, manage applicants, company profile | Needs admin approval |
| **Admin** | Full platform access, analytics, user management | Created via seed script |

### JWT Flow
- Token stored in `localStorage`
- Sent via `Authorization: Bearer <token>` header on every request
- Auto-logout on 401 response

---

## 🧠 Resume Analyzer — How It Works

The core AI feature of TalentBridge:

```
User uploads PDF resume
        ↓
pdf-parse extracts raw text
        ↓
extractSkills() scans text for 60+ known tech keywords
        ↓
calculateMatchScore() compares job.requiredSkills vs resumeSkills
        ↓
Returns: matchScore (0-100%), matchedSkills, missingSkills, strengths
```

### Skill Database (in `utils/resumeParser.js`)
Covers: React, Node, Vue, Angular, Python, Django, FastAPI, MongoDB, PostgreSQL, AWS, Docker, Kubernetes, Machine Learning, and 60+ more.

### Extending the skill list
Open `backend/utils/resumeParser.js` → add to `SKILL_KEYWORDS` array:
```js
const SKILL_KEYWORDS = [
  // Add your custom skills here
  'solidity', 'web3', 'rust', 'zig',
  // ... existing skills
];
```

---

## 📡 API Reference

### Auth Routes `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register user |
| POST | `/login` | — | Login |
| GET | `/me` | ✅ | Get current user |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/change-password` | ✅ | Change password |
| GET | `/notifications` | ✅ | Get notifications |
| PUT | `/notifications/read` | ✅ | Mark all as read |

### Job Routes `/api/jobs`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List jobs (filterable) |
| GET | `/:id` | — | Get single job |
| POST | `/` | Recruiter | Create job |
| PUT | `/:id` | Recruiter | Update job |
| DELETE | `/:id` | Recruiter | Delete job |
| GET | `/recruiter/my-jobs` | Recruiter | My posted jobs |
| PUT | `/:id/save` | Seeker | Toggle save job |

### Application Routes `/api/applications`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:jobId/apply` | Seeker | Apply with resume |
| GET | `/my` | Seeker | My applications |
| GET | `/job/:jobId` | Recruiter | Job's applicants |
| PUT | `/:id/status` | Recruiter | Update status |
| POST | `/analyze` | Any | Analyze resume only |

### Admin Routes `/api/admin`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | Platform analytics |
| GET | `/users` | Admin | All users |
| PUT | `/users/:id/toggle-block` | Admin | Block/unblock |
| PUT | `/users/:id/approve` | Admin | Approve recruiter |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/jobs` | Admin | All jobs |
| PUT | `/jobs/:id/approve` | Admin | Approve/flag job |

---

## 🎨 Design System

- **Theme:** Pure black `#000` + white `#fff` — no colors except accent states
- **Fonts:** Syne (headings, 800 weight) + Inter (body)
- **Animations:** CSS keyframes — `fadeIn`, `scaleIn`, `marquee`, `float`
- **Grid:** CSS Grid for layouts, flexbox for components
- **Design tokens:** CSS custom properties in `src/index.css`

---

## 🏗️ Feature Checklist

### Seeker
- [x] Register / Login
- [x] Profile with skills, bio, education, experience
- [x] Resume upload (Cloudinary)
- [x] Browse & search jobs
- [x] Filter by type, location, experience, salary
- [x] Save / unsave jobs (wishlist)
- [x] Apply with resume + cover letter
- [x] Duplicate application check
- [x] Track application status with progress steps
- [x] Resume Analyzer — drag & drop, score gauge, skill diff
- [x] In-app notifications

### Recruiter
- [x] Register / Login (pending admin approval)
- [x] Company profile creation
- [x] Post jobs with full details
- [x] Edit / delete / close job listings
- [x] View all applicants per job
- [x] Sort applicants by AI match score
- [x] Filter applicants by status
- [x] Update application status (Applied → Selected)
- [x] Schedule interview (date + time + link)
- [x] Send note to candidate
- [x] Email candidate direct link

### Admin
- [x] Platform analytics dashboard
- [x] Monthly user registration chart (LineChart)
- [x] Application status distribution (PieChart)
- [x] Top in-demand skills (BarChart + visual list)
- [x] Platform health metrics
- [x] View all users with filters
- [x] Block / unblock users
- [x] Approve / reject recruiters
- [x] Delete users
- [x] View all job listings
- [x] Approve / unapprove jobs
- [x] Delete jobs

---

## 🔧 Deployment

### Backend → Railway / Render
```bash
# In backend/.env add:
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend → Vercel
```bash
# In frontend/.env.production:
VITE_API_URL=https://your-backend.railway.app
```

Update `frontend/src/utils/api.js`:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
});
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m 'Add my feature'`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

**Built with ❤️ — React + Vite + Node.js + Express + MongoDB**
