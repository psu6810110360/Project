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

  const fetchMyCoursesFromBackend = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setMyCourses([]);
        return;
      }

      // 1️⃣ ดึง user + courses
      const userRes = await axios.get(`http://localhost:3000/users/${userId}`);
      const courses = userRes.data?.courses || [];

      // 2️⃣ ดึง payment ของ user คนนี้เท่านั้น ✅
      const paymentRes = await axios.get(
        `http://localhost:3000/payments/user/${userId}`
      );
      const myPayments = paymentRes.data || [];

      // 3️⃣ map status ใส่ course
      const coursesWithStatus = courses.map(course => {
        const payment = myPayments.find(
          p => String(p.course.id) === String(course.id)
        );

        return {
          ...course,
          paymentStatus: payment?.status || 'PENDING',
        };
      });

      setMyCourses(coursesWithStatus);
      localStorage.setItem('myCourses', JSON.stringify(coursesWithStatus));
    } catch (error) {
      console.error('โหลดข้อมูลห้องเรียนล้มเหลว:', error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = (courseId, courseTitle) => {
    Swal.fire({
      title: 'ต้องการลบคอร์สนี้?',
      text: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${courseTitle}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const userId = localStorage.getItem('userId');
        await axios.delete(
          `http://localhost:3000/users/${userId}/remove-course/${courseId}`
        );

        const updated = myCourses.filter(c => c.id !== courseId);
        setMyCourses(updated);
        localStorage.setItem('myCourses', JSON.stringify(updated));

        Swal.fire('ลบสำเร็จ', '', 'success');
      } catch {
        Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้', 'error');
      }
    });
  };

  const CourseCard = ({ course, onRemove }) => {
    const isCompleted = (course.progress || 0) === 100;
    const status = course.paymentStatus;

    const renderActionButton = () => {
      if (status === 'PENDING') {
        return <div className="pending-badge">⏳ รอการอนุมัติ</div>;
      }

      if (status === 'REJECTED') {
        return <div className="rejected-badge">❌ ชำระเงินไม่ผ่าน</div>;
      }

      return (
        <button
          className="watch-video-btn"
          onClick={() => alert(`เข้าเรียน: ${course.title}`)}
        >
          <FaPlayCircle />
          {isCompleted ? 'ทบทวนบทเรียน' : 'เข้าเรียน'}
        </button>
      );
    };

    return (
      <div className="course-card">
        <button
          onClick={() => onRemove(course.id, course.title)}
          className="remove-btn"
        >
          ✕
        </button>

        {isCompleted && <FaCheckCircle className="completed-icon" />}

        <div style={{ padding: '15px' }}>
          <h3>{course.title}</h3>
          <div><FaUser /> {course.instructorName || 'ไม่ระบุผู้สอน'}</div>
          <div><FaRegClock /> {course.classTime || 'ไม่ระบุเวลา'}</div>

          <div style={{ marginTop: '15px' }}>
            {renderActionButton()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>กำลังโหลดห้องเรียน...</div>;

  return (
    <div className="classroom-container">
      <h1>ห้องเรียนของฉัน</h1>

      {myCourses.length === 0 ? (
        <EmptyCourseState />
      ) : (
        <div className="course-grid-active">
          {myCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onRemove={handleRemoveCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClassroom;