import React, { useState, useEffect } from 'react';
import { FaUser, FaRegClock, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyClassroom.css';

const MyClassroom = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 💡 โหลดข้อมูลจากฐานข้อมูลของแต่ละคนตอนเปิดหน้า
    fetchMyCoursesFromBackend();
  }, []);

  const fetchMyCoursesFromBackend = async () => {
    try {
      // 1. ดึง userId ของคนที่กำลังล็อกอินอยู่
      const userId = localStorage.getItem('userId'); 
      
      // ถ้าไม่มีไอดี (ยังไม่ได้ล็อกอิน) ให้คอร์สว่างเปล่าไปเลย
      if (!userId) {
        console.warn("ยังไม่ได้ล็อกอิน ไม่มี userId");
        setMyCourses([]);
        setLoading(false);
        return;
      }

      // 2. ยิง API ไปถาม Backend ว่า User คนนี้มีคอร์สอะไรบ้าง
      const response = await axios.get(`http://localhost:3000/users/${userId}`);
      const userData = response.data;

      console.log("ข้อมูล User และคอร์สที่ได้จาก Backend:", userData);

      // 3. เอาข้อมูลคอร์สที่ดึงมาไปอัปเดตหน้าจอ
      if (userData && userData.courses) {
        setMyCourses(userData.courses);
        // อัปเดตกลับลง LocalStorage ด้วย เพื่อให้ระบบอื่นทำงานต่อได้
        localStorage.setItem('myCourses', JSON.stringify(userData.courses));
      } else {
        setMyCourses([]);
      }

    } catch (error) {
      console.error('❌ โหลดข้อมูลคอร์สจาก Backend ล้มเหลว:', error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันสำหรับลบคอร์ส
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
          const userId = localStorage.getItem('userId'); 
          
          if (userId) {
            // 1. ยิง API ไปลบคอร์สออกจาก Database (Backend)
            await axios.delete(`http://localhost:3000/users/${userId}/remove-course/${courseId}`);
          }

          // 2. อัปเดตหน้าจอให้คอร์สหายไปทันที 
          const updatedCourses = myCourses.filter(c => c.id !== courseId);
          setMyCourses(updatedCourses);

          // 3. อัปเดตข้อมูลใน LocalStorage เพื่อให้ตะกร้าและหน้าอื่นๆ รู้ว่าเราลบไปแล้ว
          localStorage.setItem('myCourses', JSON.stringify(updatedCourses));

          Swal.fire('ลบสำเร็จ!', 'คอร์สถูกลบออกจากห้องเรียนแล้ว', 'success');
        } catch (error) {
          console.error('ลบคอร์สไม่สำเร็จ:', error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้ในขณะนี้', 'error');
        }
      }
    });
  };

  // กรองข้อมูลแยกหมวดหมู่
  const activeCourses = myCourses.filter(course => (course.progress || 0) < 100);
  const completedCourses = myCourses.filter(course => (course.progress || 0) === 100);

  // Component สำหรับสร้างการ์ดคอร์สเรียน (เพิ่ม onRemove เข้ามารับฟังก์ชัน)
  const CourseCard = ({ course, onRemove }) => {
    const isCompleted = (course.progress || 0) === 100;

    return (
      // 💡 ใส่ position: 'relative' เพื่อให้ปุ่มกากบาทเกาะที่มุมขวาบนได้
      <div className="course-card" style={{ position: 'relative' }}>
        
        {/* ✅ ปุ่ม ✕ สำหรับลบคอร์ส */}
        <button 
          onClick={() => onRemove(course.id, course.title)}
          style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            background: '#ff4d4d', color: 'white', border: 'none', 
            borderRadius: '50%', width: '30px', height: '30px', 
            cursor: 'pointer', zIndex: 10, fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="ลบคอร์สนี้"
        >
          ✕
        </button>

        {/* ไอคอนติ๊กถูก (จะโชว์เฉพาะคอร์สที่เรียนจบแล้ว) */}
        {isCompleted && <FaCheckCircle className="completed-icon" />}

        {/* รูปปกคอร์ส (ถ้ามี) */}
        {course.coverImageUrl ? (
           <img 
             src={`http://localhost:3000${course.coverImageUrl}`} 
             alt={course.title} 
             style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} 
             onError={(e) => { e.target.src = 'https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found'; }}
           />
        ) : (
           <div style={{ width: '100%', height: '180px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', borderRadius: '8px 8px 0 0' }}>
             ไม่มีรูปภาพปก
           </div>
        )}

        <div style={{ padding: '15px' }}>
          <h3 className="course-card-title" style={{ marginTop: '0' }}>{course.title}</h3>
          
          <div className="course-info">
            <FaUser /> {course.instructorName || 'ไม่ระบุผู้สอน'}
          </div>
          <div className="course-info">
            <FaRegClock /> {course.classTime || 'ไม่ระบุเวลา'}
          </div>

          <div className="course-date-box" style={{ margin: '15px 0', padding: '8px', backgroundColor: '#e6f0fa', color: '#003366', borderRadius: '6px', textAlign: 'center', fontSize: '14px' }}>
            {isCompleted ? 'เรียนเสร็จสิ้น' : 'กำลังเรียน'}
          </div>

          <div className="progress-container">
            <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
              <span>ความคืบหน้า</span>
              <span style={{ color: '#F49D58', fontWeight: 'bold' }}>{course.progress || 0}%</span>
            </div>
            <div className="progress-bar-bg" style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
              <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%`, height: '100%', backgroundColor: '#4CAF50' }}></div>
            </div>
            
            <button 
              className="watch-video-btn" 
              onClick={() => alert(`เดี๋ยวเราจะลิงก์ไปหน้าดูวิดีโอคอร์ส: ${course.title}`)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <FaPlayCircle /> 
              {isCompleted ? 'ทบทวนบทเรียน' : 'เข้าเรียนวิดีโอ'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดห้องเรียน...</div>;

  return (
    <div className="classroom-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="classroom-header" style={{ marginBottom: '30px' }}>
        <h1 className="classroom-title" style={{ color: '#003366' }}>ห้องเรียนของฉัน</h1>
      </div>

      {myCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
          <p style={{ color: '#666', marginBottom: '15px', fontSize: '18px' }}>คุณยังไม่มีคอร์สในห้องเรียน</p>
          <button 
            onClick={() => window.location.href = '/courses'} 
            style={{ padding: '12px 25px', backgroundColor: '#F2984A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            ไปเลือกซื้อคอร์สเรียนเลย!
          </button>
        </div>
      ) : (
        <>
          {/* Section 1: คอร์สที่กำลังเรียน */}
          {activeCourses.length > 0 && (
            <>
              <h2 className="section-title" style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>คอร์สที่กำลังเรียน</h2>
              <div className="course-grid-active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {activeCourses.map(course => (
                  <CourseCard key={course.id} course={course} onRemove={handleRemoveCourse} />
                ))}
              </div>
            </>
          )}

          {/* Section 2: คอร์สที่เรียนจบแล้ว */}
          {completedCourses.length > 0 && (
            <>
              <h2 className="section-title" style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px' }}>คอร์สที่เรียนจบแล้ว</h2>
              <div className="course-grid-completed" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {completedCourses.map(course => (
                  <CourseCard key={course.id} course={course} onRemove={handleRemoveCourse} />
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