// src/pages/MyClassroom/MyClassroom.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaRegClock, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyClassroom.css';
import EmptyCourseState from './EmptyCourseState';
import { Link } from 'react-router-dom';


const MyClassroom = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCoursesFromBackend();
  }, []);

  const fetchMyCoursesFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMyCourses([]);
        setLoading(false);
        return;
      }

      // ดึงข้อมูลทั้งหมด 
      const response = await axios.get(
        'http://localhost:3000/payments/my-courses',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const coursesWithStatus = response.data.map((payment) => {
        // 1. คำนวณจำนวนวิดีโอทั้งหมดในคอร์ส
        let totalVideos = 0;
        if (payment.course.videos) {
          try {
            const parsedVideos = typeof payment.course.videos === 'string' 
              ? JSON.parse(payment.course.videos) 
              : payment.course.videos;
            totalVideos = parsedVideos.length;
          } catch (e) {
            console.error('Parse videos error', e);
          }
        }

        // 2. คำนวณจำนวนวิดีโอที่ดูจบแล้ว
        const completedCount = payment.completedVideos ? payment.completedVideos.length : 0;
        
        // 3. คิดเป็นเปอร์เซ็นต์
        const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

        return {
          ...payment.course,
          paymentStatus: payment.status ? payment.status.toLowerCase() : 'pending',
          progressPercent: progressPercent, // ✅ เก็บเปอร์เซ็นต์ส่งไปให้ Card
        };
      });

      setMyCourses(coursesWithStatus);
      localStorage.setItem('myCourses', JSON.stringify(coursesWithStatus));
    } catch (error) {
      console.error('❌ โหลดข้อมูลห้องเรียนล้มเหลว:', error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = (courseId, courseTitle) => {
    // เก็บไว้กัน Error ฟังก์ชันเก่า
  };

  // ===============================
  // 🔎 แยกคอร์สตามสถานะแบบแม่นยำ
  // ===============================
  const pendingCourses = myCourses.filter(c => c.paymentStatus === 'pending');
  const approvedCourses = myCourses.filter(c => c.paymentStatus === 'approved');
  const rejectedCourses = myCourses.filter(c => c.paymentStatus === 'rejected');
  
  // ✅ ดึงคอร์สที่โดนระงับมาอย่างถูกต้อง
  const revokedCourses = myCourses.filter(c => ['revoked', 'suspended', 'canceled'].includes(c.paymentStatus));

  // ===============================
  // 🎴 Course Card Component
  // ===============================
  const CourseCard = ({ course, onRemove }) => {
    const isApproved = course.paymentStatus === 'approved';
    const isPending = course.paymentStatus === 'pending';
    const isRejected = course.paymentStatus === 'rejected';
    const isRevoked = ['revoked', 'suspended', 'canceled'].includes(course.paymentStatus);

    return (
      <div className="course-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        <img 
          src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : 'https://via.placeholder.com/400x200?text=No+Cover'} 
          alt={course.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover', opacity: isRevoked ? 0.6 : 1, filter: isRevoked ? 'grayscale(80%)' : 'none' }}
        />

        {isApproved && <FaCheckCircle className="completed-icon" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', color: '#28a745', background: 'white', borderRadius: '50%' }} />}

        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="course-card-title" style={{ marginTop: '0px', color: isRevoked ? '#7f8c8d' : '#003366' }}>{course.title}</h3>

          <div className="course-info">
            <FaUser /> {course.instructorName || 'ไม่ระบุผู้สอน'}
          </div>
          <div className="course-info" style={{ marginBottom: '15px' }}>
            <FaRegClock /> {course.classTime || 'ไม่ระบุเวลา'}
          </div>

          <div style={{ marginTop: 'auto' }}>
            {isPending && (
              <div className="course-date-box" style={{ background: '#f1c40f', color: '#fff' }}>
                ⏳ รอการอนุมัติ (เข้าเรียนไม่ได้)
              </div>
            )}
            
            {isRejected && (
              <div className="course-date-box" style={{ background: '#ffe6e6', color: '#c0392b' }}>
                ❌ การชำระเงินถูกปฏิเสธ
              </div>
            )}

            {/* ✅ แสดงป้ายเมื่อถูกระงับสิทธิ์ */}
            {isRevoked && (
              <div className="course-date-box" style={{ background: '#ffe6e6', color: '#c0392b', border: '1px solid #c0392b' }}>
                🚫 ท่านหมดสิทธิ์ในการเรียนแล้ว
              </div>
            )}

            {isApproved && (
              <div style={{ marginTop: '15px' }}>
                
                {/* 🟢 หลอด Progress Bar */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    <span>ความคืบหน้า</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{course.progressPercent || 0}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${course.progressPercent || 0}%`, 
                      backgroundColor: '#27ae60', 
                      height: '100%', 
                      transition: 'width 0.5s ease' 
                    }}></div>
                  </div>
                </div>

                {/* 🔵 ปุ่มเข้าเรียน */}
                <Link to={`/attend/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <button className="watch-video-btn">
                    <FaPlayCircle /> เข้าเรียน
                  </button>
                </Link>

              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดห้องเรียน...</div>;
  }

  return (
    <div className="classroom-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <h1 className="classroom-title" style={{ margin: '0', padding: '10px 40px', background: '#ffe8cc', color: '#003366', borderRadius: '30px', display: 'inline-block' }}>
          ห้องเรียนของฉัน
        </h1>
      </div>

      {myCourses.length === 0 ? (
        <EmptyCourseState />
      ) : (
        <>
          {pendingCourses.length > 0 && (
            <>
              <h2 className="section-title">รอการอนุมัติ</h2>
              <div className="course-grid-active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {pendingCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {approvedCourses.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 className="section-title">คอร์สของฉัน</h2>
              <div className="course-grid-active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {approvedCourses.map(course => (
                  <CourseCard key={course.id} course={course} onRemove={handleRemoveCourse} />
                ))}
              </div>
            </div>
          )}

          {/* ✅ กล่องถูกระงับสิทธิ์ */}
          {revokedCourses.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 className="section-title" style={{ color: '#7f8c8d' }}>คอร์สที่ถูกระงับสิทธิ์</h2>
              <div className="course-grid-active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {revokedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {rejectedCourses.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 className="section-title">ถูกปฏิเสธ</h2>
              <div className="course-grid-active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {rejectedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyClassroom;