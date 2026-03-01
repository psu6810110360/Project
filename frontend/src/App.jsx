import { useState } from 'react';
// 1. นำเข้า Navigate เพื่อใช้สั่งเด้งเปลี่ยนหน้า
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import CourseList from './pages/Courses/CourseList';
import CourseForm from './pages/Courses/CourseForm';
import CourseDetail from './pages/Courses/CourseDetail';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Login/Login';

import MyClassroom from "./pages/MyClassroom/MyClassroom";
import Cart from './pages/Cart/Cart';
import Payment from './pages/Payment/Payment';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import UserManagement from './pages/Admin/UserManagement';
import InstructorForm from './pages/Admin/InstructorForm';
import InstructorManagement from './pages/Admin/InstructorManagement';
// ==========================================
// 🛡️ สร้าง "ยาม" สำหรับดักการเข้าถึง Route
// ==========================================
function ProtectedRoute({ children, requireAdmin }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  // ด่านที่ 1: ถ้ายังไม่ได้ล็อกอิน ให้เด้งไล่ไปหน้า Login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ด่านที่ 2: ถ้าหน้านี้บังคับว่าต้องเป็น Admin แต่คนเข้าเป็นคนธรรมดา ให้เด้งกลับหน้าแรก
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // ถ้าผ่านทุกด่าน อนุญาตให้แสดงผลหน้าเว็บนั้นๆ ได้
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
        
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* 🟢 หน้าทั่วไป ใครๆ ก็เข้าได้ (ไม่ต้องมียาม) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> 
            
            {/* 🟡 หน้าที่ต้อง "ล็อกอิน" ก่อนถึงจะเข้าได้ (ทั้ง Student และ Admin) */}
            <Route path="/courses" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <CourseList isAdmin={isAdminUser} />
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

            {/* 🛒 หน้าตะกร้าสินค้า */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <Cart />
                </div>
              </ProtectedRoute>
            } />

            {/* 💳 หน้าชำระเงิน */}
            <Route path="/payment" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <Payment />
                </div>
              </ProtectedRoute>
            } />

            {/* ✅ หน้าชำระเงินสำเร็จ */}
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <PaymentSuccess />
                </div>
              </ProtectedRoute>
            } />

            {/* 🔴 หน้าหวงห้าม! ต้องเป็น "Admin" เท่านั้น (ดักคนแอบพิมพ์ /add หรือ /edit) */}
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

            {/* 👑 หน้าจัดการ User สำหรับ Admin เท่านั้น */}
            <Route path="/manage-users" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <UserManagement />
                </div>
              </ProtectedRoute>
            } />
            {/* 👑 หน้าจัดการ User สำหรับ Admin เท่านั้น */}
            <Route path="/manage-users" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <UserManagement />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/add-instructor" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <InstructorForm />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/manage-instructors" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <InstructorManagement />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/edit-instructor/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
                  <InstructorForm />
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