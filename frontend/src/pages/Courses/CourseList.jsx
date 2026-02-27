//CourseList.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';

export default function CourseList({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate(); 

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('ดึงข้อมูลไม่สำเร็จ', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('แน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?')) {
      try {
        await axios.delete(`http://localhost:3000/courses/${id}`);
        fetchCourses(); 
      } catch (error) {
        console.error('ลบข้อมูลไม่สำเร็จ', error);
      }
    }
  };

  // ดึงรายการคอร์สที่ซื้อไปแล้วมาเช็ค
  const myCourses = JSON.parse(localStorage.getItem('myCourses')) || [];
  const ownedCourseIds = myCourses.map(c => c.id);

  const displayedCourses = courses.filter((course) => {
    if (isAdmin) return true; // แอดมินเห็นทุกคอร์สปกติ
    if (course.isActive !== true) return false; // ถ้าคอร์สถูกซ่อนอยู่ ก็ไม่แสดง
    if (ownedCourseIds.includes(course.id)) return false; // ถ้าซื้อไปแล้ว ให้ซ่อนออกไปเลย!
    return true; 
  });

  return (
    <div>
      {isAdmin && (
        <div style={{ marginBottom: '25px', textAlign: 'right' }}>
          <Link to="/add">
            <button style={{ padding: '12px 24px', background: '#F2984A', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' }}>
              + เพิ่มคอร์สเรียนใหม่
            </button>
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {displayedCourses.map((course) => (
          <div key={course.id} style={{ background: '#FFFFFF', border: '1px solid #eee', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {isAdmin && (
              <div style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                backgroundColor: course.isActive ? '#28a745' : '#dc3545',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1
              }}>
                {course.isActive ? 'เปิดขาย' : 'ซ่อนอยู่'}
              </div>
            )}

            {course.coverImageUrl ? (
              <img src={`http://localhost:3000${course.coverImageUrl}`} alt={course.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px' }} />
            ) : (
              <div style={{ width: '100%', height: '180px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>ไม่มีรูปภาพปก</div>
            )}
            
            <h3 style={{ fontSize: '18px', color: '#003366', margin: '15px 0 5px 0', lineHeight: '1.4', flexGrow: 1 }}>{course.title}</h3>
            
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px',display: '-webkit-box',WebkitLineClamp: 2,WebkitBoxOrient: 'vertical',overflow: 'hidden',}}>รายละเอียด: <span style={{ fontWeight: 'bold', color: '#333' }}>
            {course.shortDescription || 'ไม่ระบุ'}</span></p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
              <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '14px' }}>฿{course.originalPrice}</span>
              <span style={{ color: '#F2984A', fontWeight: 'bold', fontSize: '24px' }}>฿{course.salePrice}</span>
            </div>
            
           
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {isAdmin ? (
                <>
                  
                  <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '10px', background: '#e6f7ff', color: '#003366', border: '1px solid #91d5ff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      🔍 ดูรายละเอียด (Preview)
                    </button>
                  </Link>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/edit/${course.id}`} style={{ flex: 1 }}>
                      <button style={{ width: '100%', padding: '10px', background: '#003366', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>แก้ไข</button>
                    </Link>
                    
                    <button onClick={() => handleDelete(course.id)} style={{ padding: '10px 15px', background: '#dc3545', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      ลบ
                    </button>
                  </div>
                </>
              ) : (
                
                <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    width: '100%', padding: '12px', background: '#F2984A', 
                    color: '#FFFFFF', border: 'none', borderRadius: '8px', 
                    cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', 
                    boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' 
                  }}>
                    รายละเอียด
                  </button>
                </Link>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}