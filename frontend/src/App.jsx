// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import CourseList from './pages/Courses/CourseList';
import CourseForm from './pages/Courses/CourseForm';
import CourseDetail from './pages/Courses/CourseDetail';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Login/Login';
import OurStudents from './pages/OurStudents/OurStudents';
import Contact from './pages/Contact/contact'; 

import MyClassroom from "./pages/MyClassroom/MyClassroom";
import Cart from './pages/Cart/Cart';
import Payment from './pages/Payment/Payment';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import UserManagement from './pages/Admin/UserManagement/UserManagement';
import CoursePlayer from './pages/CoursePlayer/CoursePlayer';
import Profile from './pages/Profile/Profile'; 
import PaymentReview from './pages/Admin/PaymentReview/PaymentReview';

// ==========================================
// 🛡️ Protected Route
// ==========================================
function ProtectedRoute({ children, requireAdmin }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
// ==========================================

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const isAdminUser = localStorage.getItem('userRole') === 'admin';

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: '"Prompt", sans-serif' }}>
        
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdminUser={isAdminUser} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>

            {/* 🟢 Public Pages (รวมหน้า OurStudents ไว้ด้วย) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> 
            <Route path="/our-students" element={<OurStudents />} />
            <Route path="/contact" element={<Contact />} /> 

            {/* 🟡 Logged-in Users */}
            <Route path="/courses" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <CourseList isAdmin={isAdminUser} />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <Profile />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/my-classroom" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <MyClassroom />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/course/:id" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <CourseDetail />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/cart" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <Cart />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/payment" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <Payment />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/payment-success" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <PaymentSuccess />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/attend/:courseId" element={<CoursePlayer />} />

            {/* 🔴 Admin Only */}
            <Route path="/add" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <CourseForm />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/edit/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <CourseForm />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/manage-users" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <UserManagement />
                </div>
              </ProtectedRoute>
            } />

            {/* 🔴 ปิด Route นี้ไว้ชั่วคราวเพื่อไม่ให้แอปพัง */}
            {/* <Route path="/manage-students" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <OurStudentManagement />
                </div>
              </ProtectedRoute>
            } /> 
            */}

            {/* 🧾 Admin: ตรวจสอบการชำระเงิน (จาก Code ใหม่) */}
            <Route path="/admin/payments" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <PaymentReview />
                </div>
              </ProtectedRoute>
            } />

          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;