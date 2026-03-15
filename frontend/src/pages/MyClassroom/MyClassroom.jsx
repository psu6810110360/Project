// src/pages/MyClassroom/MyClassroom.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaRegClock, FaCheckCircle, FaPlayCircle, FaChevronDown, FaChevronRight, FaCalendarAlt, FaHistory} from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyClassroom.css';
import EmptyCourseState from './EmptyCourseState';
import { Link, useNavigate } from 'react-router-dom';

const MyClassroom = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevoked, setShowRevoked] = useState(false);
  const [showRejected, setShowRejected] = useState(false);  
  const [showExpired, setShowExpired] = useState(false); // ✅ เพิ่ม State เปิด-ปิดคอร์สหมดอายุ
  const navigate = useNavigate();

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

      const response = await axios.get(
        'http://localhost:3000/payments/my-courses',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const coursesWithStatus = response.data.map((payment) => {
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

        const completedCount = payment.completedVideos ? payment.completedVideos.length : 0;
        const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

        // ✅ เช็ควันหมดอายุ
        const expiresAt = payment.expiresAt ? new Date(payment.expiresAt) : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;

        return {
          ...payment.course,
          paymentStatus: payment.status ? payment.status.toLowerCase() : 'pending',
          progressPercent: progressPercent,
          expiresAt: expiresAt, // ✅ เก็บวันหมดอายุ
          isExpired: isExpired, // ✅ สถานะหมดอายุ
          userCourseId: payment.id // เก็บ ID ไว้ใช้อ้างอิงตอนขอต่ออายุ
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

  // ===============================
  // 🔎 แยกคอร์สตามสถานะแบบแม่นยำ (เพิ่มหมวดหมู่หมดอายุ)
  // ===============================
  const pendingCourses = myCourses.filter(c => c.paymentStatus === 'pending');
  // ✅ ถ้า approved แต่ isExpired = true จะไม่แสดงในช่องคอร์สของฉัน
  const approvedCourses = myCourses.filter(c => c.paymentStatus === 'approved' && !c.isExpired);
  const rejectedCourses = myCourses.filter(c => c.paymentStatus === 'rejected');
  const revokedCourses = myCourses.filter(c => ['revoked', 'suspended', 'canceled'].includes(c.paymentStatus));
  // ✅ หมวดหมู่ใหม่: หมดอายุแล้ว
  const expiredCourses = myCourses.filter(c => c.paymentStatus === 'approved' && c.isExpired);

  // ฟังก์ชันแปลงวันที่ให้สวยงาม
  const formatDate = (date) => {
    if (!date) return 'ตลอดชีพ';
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ===============================
  // 🎴 Course Card Component
  // ===============================
  const CourseCard = ({ course }) => {
    const isApproved = course.paymentStatus === 'approved' && !course.isExpired;
    const isPending = course.paymentStatus === 'pending';
    const isRejected = course.paymentStatus === 'rejected';
    const isRevoked = ['revoked', 'suspended', 'canceled'].includes(course.paymentStatus);
    const isExpired = course.isExpired; // ✅ เช็คว่าบัตรนี้หมดอายุไหม

    return (
      <div className="course-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <img 
          src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : 'https://via.placeholder.com/400x200?text=No+Cover'} 
          alt={course.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover', opacity: (isRevoked || isExpired) ? 0.6 : 1, filter: (isRevoked || isExpired) ? 'grayscale(80%)' : 'none' }}
        />

        {isApproved && <FaCheckCircle className="completed-icon" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', color: '#28a745', background: 'white', borderRadius: '50%' }} />}

        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="course-card-title" style={{ marginTop: '0px', color: (isRevoked || isExpired) ? '#7f8c8d' : '#003366', fontSize: '18px', marginBottom: '10px' }}>{course.title}</h3>

          <div className="course-info" style={{ color: '#555', fontSize: '14px', marginBottom: '5px' }}>
            <FaUser style={{ color: '#888', marginRight: '5px' }} /> {course.instructorName || 'ไม่ระบุผู้สอน'}
          </div>
          <div className="course-info" style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>
            <FaRegClock style={{ color: '#888', marginRight: '5px' }} /> {course.classTime || 'ไม่ระบุเวลา'}
          </div>

          <div style={{ marginTop: 'auto' }}>
            {isPending && (
              <div style={{ background: '#fef9c3', color: '#b45309', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                ⏳ รอการอนุมัติ
              </div>
            )}
            
            {isRejected && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                ❌ สลิปถูกปฏิเสธ
              </div>
            )}

            {isRevoked && (
              <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', border: '1px solid #d1d5db' }}>
                🚫 ถูกระงับสิทธิ์
              </div>
            )}

            {/* ✅ แสดงวันหมดอายุสำหรับคอร์สที่ยังเรียนได้ */}
            {isApproved && (
              <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCalendarAlt /> หมดอายุ: <strong>{formatDate(course.expiresAt)}</strong>
              </div>
            )}

            {isApproved && (
              <div>
                {/* 🟢 หลอด Progress Bar */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    <span>ความคืบหน้า</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{course.progressPercent || 0}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.progressPercent || 0}%`, backgroundColor: '#27ae60', height: '100%', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                {/* 🔵 ปุ่มเข้าเรียน */}
                <Link to={`/attend/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{ width: '100%', padding: '10px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaPlayCircle /> เข้าเรียน
                  </button>
                </Link>
              </div>
            )}

            {/* ✅ แสดงปุ่มต่ออายุสำหรับคอร์สที่หมดอายุแล้ว */}
            {isExpired && (
              <div>
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                  <FaHistory /> หมดอายุเมื่อ: <strong>{formatDate(course.expiresAt)}</strong>
                </div>
                
                <button 
                  onClick={() => navigate(`/course/${course.id}`)} // กดแล้วพากลับไปหน้าซื้อคอร์ส
                  style={{ width: '100%', padding: '10px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FaHistory /> ต่ออายุคอร์สเรียน
                </button>
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
    <div className="classroom-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <h1 className="classroom-title" style={{ margin: '0', color: '#003366', display: 'inline-block' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {pendingCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {approvedCourses.length > 0 && (
            <div>
              <h2 className="section-title">คอร์สของฉัน</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {approvedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* ✅ หมวดหมู่ใหม่: หมดอายุ (พับเก็บได้) */}
          {expiredCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowExpired(!showExpired)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#ea580c' }}
              >
                {showExpired ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  คอร์สที่หมดอายุแล้ว ({expiredCourses.length})
                </h2>
              </div>
              
              {showExpired && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {expiredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ถูกระงับสิทธิ์ */}
          {revokedCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowRevoked(!showRevoked)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#7f8c8d' }}
              >
                {showRevoked ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  คอร์สที่ถูกระงับสิทธิ์ ({revokedCourses.length})
                </h2>
              </div>
              
              {showRevoked && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {revokedCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ถูกปฏิเสธ */}
          {rejectedCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowRejected(!showRejected)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#c0392b' }}
              >
                {showRejected ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  การสั่งซื้อถูกปฏิเสธ ({rejectedCourses.length})
                </h2>
              </div>

              {showRejected && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {rejectedCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyClassroom;