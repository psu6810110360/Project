// src/pages/MyClassroom/MyClassroom.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaRegClock, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyClassroom.css';
import EmptyCourseState from './EmptyCourseState';

const MyClassroom = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCoursesFromBackend();
  }, []);

  // ===============================
  // 🔄 โหลดคอร์สจาก PAYMENT API
  // ===============================
  const fetchMyCoursesFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMyCourses([]);
        setLoading(false);
        return;
      }

      // ดึงข้อมูลทั้งหมด (Backend จะส่งมาทั้ง Pending และ Approved)
      const response = await axios.get(
        'http://localhost:3000/payments/my-courses',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /**
       * แปลงข้อมูลให้มี status ที่แน่นอน (ตัวเล็กเสมอ)
       */
      const coursesWithStatus = response.data.map((payment) => ({
        ...payment.course,
        // ✅ เพิ่ม toLowerCase() เพื่อป้องกันปัญหาตัวพิมพ์เล็กใหญ่
        paymentStatus: payment.status ? payment.status.toLowerCase() : 'pending',
      }));

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
  // ❌ ฟังก์ชันลบคอร์ส (คงเดิม)
  // ===============================
  const handleRemoveCourse = (courseId, courseTitle) => {
    Swal.fire({
      title: 'ต้องการลบคอร์สนี้?',
      text: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${courseTitle}" ออกจากห้องเรียนของคุณ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#888',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Logic ลบอาจจะต้องเชื่อม API เพิ่มในอนาคต
          const updatedCourses = myCourses.filter(c => c.id !== courseId);
          setMyCourses(updatedCourses);
          localStorage.setItem('myCourses', JSON.stringify(updatedCourses));
          Swal.fire('ลบสำเร็จ!', 'คอร์สถูกลบออกจากห้องเรียนแล้ว', 'success');
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้', 'error');
        }
      }
    });
  };

  // ===============================
  // 🔎 แยกคอร์สตามสถานะ
  // ===============================
  // ระบบจะแยกกล่องให้อัตโนมัติเพราะเราแก้ Backend ให้ส่งมาหมดแล้ว
  const pendingCourses = myCourses.filter(c => c.paymentStatus === 'pending');
  const approvedCourses = myCourses.filter(c => c.paymentStatus === 'approved');
  const rejectedCourses = myCourses.filter(c => c.paymentStatus === 'rejected');

  // ===============================
  // 🎴 Course Card Component
  // ===============================
  const CourseCard = ({ course, onRemove }) => {
    const isApproved = course.paymentStatus === 'approved';
    const isPending = course.paymentStatus === 'pending';
    const isRejected = course.paymentStatus === 'rejected';

    return (
      <div className="course-card" style={{ position: 'relative' }}>
        {/* ปุ่มลบ (เฉพาะ Approved) */}
        {isApproved && (
          <button
            onClick={() => onRemove(course.id, course.title)}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: '#ff4d4d', color: 'white', border: 'none',
              borderRadius: '50%', width: '30px', height: '30px',
              cursor: 'pointer', zIndex: 10,
            }}
          >
            ✕
          </button>
        )}

        {isApproved && <FaCheckCircle className="completed-icon" />}

        <div style={{ padding: '15px' }}>
          <h3 className="course-card-title">{course.title}</h3>

          <div className="course-info">
            <FaUser /> {course.instructorName || 'ไม่ระบุผู้สอน'}
          </div>
          <div className="course-info">
            <FaRegClock /> {course.classTime || 'ไม่ระบุเวลา'}
          </div>

          {/* 🔔 แสดงสถานะและปุ่ม */}
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

          {/* ✅ ปุ่มเข้าเรียนจะขึ้นเฉพาะตอนสถานะเป็น approved เท่านั้น */}
          {isApproved && (
            <button
              className="watch-video-btn"
              onClick={() => alert(`เข้าเรียนคอร์ส: ${course.title}`)}
            >
              <FaPlayCircle /> เข้าเรียน
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดห้องเรียน...</div>;
  }

  return (
    <div className="classroom-container">
      <h1 className="classroom-title">ห้องเรียนของฉัน</h1>

      {myCourses.length === 0 ? (
        <EmptyCourseState />
      ) : (
        <>
          {/* กล่องรออนุมัติ */}
          {pendingCourses.length > 0 && (
            <>
              <h2 className="section-title">รอการอนุมัติ</h2>
              <div className="course-grid-active">
                {pendingCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {/* กล่องคอร์สที่เรียนได้ */}
          {approvedCourses.length > 0 && (
            <>
              <h2 className="section-title">คอร์สของฉัน</h2>
              <div className="course-grid-active">
                {approvedCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onRemove={handleRemoveCourse}
                  />
                ))}
              </div>
            </>
          )}

          {/* กล่องถูกปฏิเสธ */}
          {rejectedCourses.length > 0 && (
            <>
              <h2 className="section-title">ถูกปฏิเสธ</h2>
              <div className="course-grid-active">
                {rejectedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyClassroom;