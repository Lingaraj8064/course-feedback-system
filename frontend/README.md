# Course Feedback System

A comprehensive full-stack web application for course feedback management with role-based authentication, admin dashboard, and analytics.

## 🎯 Project Overview

This application allows students to submit feedback for courses and enables administrators to manage courses, users, and view analytics. Built with Node.js/Express backend and React frontend.

## 🚀 Features Implemented

### ✅ Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Student/Admin)
- Email validation and strong password requirements
- Protected routes with middleware

### ✅ Student Features
- Submit course feedback with ratings (1-5) and comments
- View paginated list of their feedback
- Edit/delete their own feedback
- Complete profile management with photo upload
- Password change functionality

### ✅ Admin Features
- View all feedback submissions with filters
- Export feedback data to CSV
- User management (Block/Unblock/Delete users)
- Course management (CRUD operations)
- Analytics dashboard with charts and statistics

### ✅ Additional Features
- Responsive Material-UI design
- File upload with Cloudinary integration
- Input validation and error handling
- Toast notifications
- Loading states
- Pagination
- Search and filtering

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image uploads)

## 🛠 Installation & Setup

### Backend Setup

1. **Clone and navigate to backend**
```bash
git clone <your-repo-url>
cd course-feedback-system/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/course_feedback?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

4. **Start the backend server**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the frontend server**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🗄 Database Setup

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get the connection string and replace in your .env file
5. Whitelist your IP address

### Local MongoDB (Alternative)
```bash
# Install MongoDB locally and start service
mongod --dbpath /path/to/your/data/directory

# Update MONGODB_URI in .env to:
MONGODB_URI=mongodb://localhost:27017/course_feedback
```

## ☁️ Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add these to your .env file

## 🧪 Test Accounts

### Create Admin Account
Run this script in MongoDB or use MongoDB Compass:

```javascript
// In MongoDB shell or Compass
use course_feedback;

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Use bcrypt to hash "Admin123!"
  role: "admin",
  isBlocked: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Or Register and Manually Change Role
1. Register a regular student account
2. In MongoDB, change the `role` field from "student" to "admin"

### Sample Login Credentials
- **Student**: Register through the app
- **Admin**: admin@example.com / Admin123! (after creating admin account)

## 🏗 Project Structure

```
course-feedback-system/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── feedbackController.js
│   │   └── courseController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Feedback.js
│   │   └── Course.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── feedback.js
│   │   ├── courses.js
│   │   └── admin.js
│   ├── utils/
│   │   └── validation.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Dashboard/
    │   │   ├── Feedback/
    │   │   ├── Profile/
    │   │   └── Admin/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    └── .env
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/upload-avatar` - Upload profile picture

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my-feedback` - Get user's feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback
- `GET /api/feedback/all` - Get all feedback (Admin)
- `GET /api/feedback/export` - Export to CSV (Admin)
- `GET /api/feedback/stats` - Get statistics (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-block` - Block/Unblock user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Analytics data

## 🎨 Frontend Routes

### Public Routes
- `/login` - Student login page
- `/register` - Student registration
- `/admin-login` - Admin login page

### Student Routes (Protected)
- `/dashboard` - Student dashboard
- `/feedback/new` - Submit new feedback
- `/feedback/edit/:id` - Edit feedback
- `/my-feedback` - View all user feedback
- `/profile` - User profile management

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/feedback` - All feedback management
- `/admin/users` - User management
- `/admin/courses` - Course management
- `/admin/analytics` - Analytics and reports

## 🔧 Development Commands

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Create account and new app**
2. **Set environment variables** in your deployment platform
3. **Deploy from Git repository**

Example for Heroku:
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other environment variables
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

1. **Build the React app**
```bash
npm run build
```

2. **Deploy build folder** to your chosen platform
3. **Set environment variable** for production API URL
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

### Database (MongoDB Atlas)
- Already cloud-hosted, just ensure proper connection strings

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with expiration
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js for security headers
- Protected routes with role-based access

## 🎯 Testing the Application

### Basic Testing Flow

1. **Register a student account**
   - Go to `/register`
   - Fill in valid details (strong password required)
   - Should redirect to student dashboard

2. **Test student features**
   - Submit feedback for courses
   - View and edit submitted feedback
   - Update profile and upload avatar
   - Change password

3. **Create admin account** (via database)
   - Insert admin user in MongoDB
   - Or register student and change role to "admin"

4. **Test admin features**
   - Login at `/admin-login`
   - View all feedback with filters
   - Export feedback to CSV
   - Manage users (block/unblock/delete)
   - Manage courses (CRUD operations)
   - View analytics dashboard

### Sample Test Data

You can create sample courses by logging in as admin and adding:

```
Course Name: Computer Science Fundamentals
Course Code: CS101
Instructor: Dr. Smith
Credits: 3
Description: Introduction to programming concepts

Course Name: Data Structures
Course Code: CS201
Instructor: Prof. Johnson
Credits: 4
Description: Study of data structures and algorithms
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI in .env
   - Ensure IP is whitelisted in MongoDB Atlas
   - Verify database user permissions

2. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Clear browser localStorage if tokens are invalid
   - Ensure token is being sent in Authorization header

3. **Cloudinary Upload Failed**
   - Verify Cloudinary credentials in .env
   - Check file size (max 5MB)
   - Ensure only image files are uploaded

4. **CORS Errors**
   - Check CLIENT_URL in backend .env
   - Ensure frontend URL matches CORS settings

5. **Build Errors**
   - Delete node_modules and package-lock.json
   - Run `npm install` again
   - Check Node.js version compatibility

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['student', 'admin']),
  phone: String,
  dateOfBirth: Date,
  address: String,
  profilePicture: String (URL),
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  code: String (required, unique),
  description: String,
  instructor: String,
  credits: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: 'User'),
  course: ObjectId (ref: 'Course'),
  rating: Number (1-5, required),
  message: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Git Workflow (Incremental Development)

This project follows incremental development with clear commit messages:

```bash
# Example commit history
git commit -m "feat: add user authentication with JWT"
git commit -m "feat: implement feedback submission form"
git commit -m "feat: add admin dashboard with statistics"
git commit -m "fix: resolve password validation issue"
git commit -m "refactor: improve error handling in API"
git commit -m "feat: add CSV export functionality"
git commit -m "docs: update README with deployment instructions"
```

## 📞 Support

If you encounter any issues:

1. Check this README for troubleshooting
2. Review the console logs for detailed error messages
3. Ensure all environment variables are set correctly
4. Verify database connectivity

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application is built for educational purposes as part of a programming assignment. All features are implemented according to the specified requirements with additional enhancements for better user experience.