// src/pages/MyClassroom/MyClassroom.jsx
import React from 'react';
import { FaUser, FaRegCalendarAlt, FaRegClock, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import './MyClassroom.css';

// 1. จำลองข้อมูลคอร์สที่ซื้อแล้ว (Mock Data)
const mockMyCourses = [
  {
    id: 1,
    title: 'คอร์สเคมี ม.ปลาย เตรียมสอบเข้า',
    teacher: 'ครูแอ้ม',
    schedule: 'พฤหัสบดี 13:00-15:00 น.',
    duration: '10 ชั่วโมง',
    statusText: 'งวดที่เรียนรู้ได้ 10 ม.ค. 2568 เวลา 13:00 น.',
    progress: 65,
  },
  {
    id: 2,
    title: 'คอร์สชีววิทยา ม.ปลาย เตรียมสอบเข้า',
    teacher: 'ครูปิ๊ก',
    schedule: 'ศุกร์ 18:00-20:00 น.',
    duration: '8 ชั่วโมง',
    statusText: 'งวดที่เรียนรู้ได้ 13 ม.ค. 2568 เวลา 18:00 น.',
    progress: 40,
  },
  {
    id: 3,
    title: 'คอร์สเคมี ม.6 เพิ่มเกรด',
    teacher: 'ครูแอ้ม',
    schedule: '-',
    duration: '12 ชั่วโมง',
    statusText: 'เสร็จสิ้น',
    progress: 100,
  },
  {
    id: 4,
    title: 'คอร์สเคมี ม.ปลาย เตรียมสอบเข้า',
    teacher: 'ครูแอ้ม',
    schedule: '-',
    duration: '12 ชั่วโมง',
    statusText: 'เสร็จสิ้น',
    progress: 100,
  },
  {
    id: 5,
    title: 'คอร์สฟิสิกส์ ม.6 เพิ่มเกรด',
    teacher: 'ครูอ้าง',
    schedule: '-',
    duration: '8 ชั่วโมง',
    statusText: 'เสร็จสิ้น',
    progress: 100,
  },
];

const MyClassroom = () => {
  // 2. กรองข้อมูลแยกหมวดหมู่
  const activeCourses = mockMyCourses.filter(course => course.progress < 100);
  const completedCourses = mockMyCourses.filter(course => course.progress === 100);

  // Component สำหรับสร้างการ์ดคอร์สเรียน (เพื่อให้โค้ดดูสะอาด)
  const CourseCard = ({ course }) => {
    const isCompleted = course.progress === 100;

    return (
      <div className="course-card">
        {/* ไอคอนติ๊กถูก (จะโชว์เฉพาะคอร์สที่เรียนจบแล้ว) */}
        {isCompleted && <FaCheckCircle className="completed-icon" />}

        <h3 className="course-card-title">{course.title}</h3>
        
        <div className="course-info">
          <FaUser /> {course.teacher}
        </div>
        <div className="course-info">
          <FaRegCalendarAlt /> {course.schedule}
        </div>
        <div className="course-info">
          <FaRegClock /> {course.duration}
        </div>

        <div className="course-date-box">
          {course.statusText}
        </div>

        <div className="progress-container">
          <div className="progress-header">
            <span>ความคืบหน้า</span>
            <span style={{ color: '#F49D58' }}>{course.progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
          </div>
          
          {/* ปุ่มเข้าดูวิดีโอ (ฟีเจอร์ใหม่ที่ขอเพิ่ม) */}
          <button className="watch-video-btn" onClick={() => alert(`เดี๋ยวเราจะลิงก์ไปหน้าดูวิดีโอคอร์ส: ${course.title} นะครับ!`)}>
            <FaPlayCircle style={{ marginRight: '8px' }} /> 
            {isCompleted ? 'ทบทวนบทเรียน' : 'เข้าเรียนวิดีโอ'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="classroom-container">
      <div className="classroom-header">
        <h1 className="classroom-title">ห้องเรียนของฉัน</h1>
      </div>

      {/* Section 1: คอร์สที่กำลังเรียน */}
      {activeCourses.length > 0 && (
        <>
          <h2 className="section-title">คอร์สที่กำลังเรียน</h2>
          <div className="course-grid-active">
            {activeCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}

      {/* Section 2: คอร์สที่เรียนจบแล้ว */}
      {completedCourses.length > 0 && (
        <>
          <h2 className="section-title">คอร์สที่เรียนจบแล้ว</h2>
          <div className="course-grid-completed">
            {completedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyClassroom;