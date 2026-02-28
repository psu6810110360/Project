// CourseList.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaBook } from 'react-icons/fa';

export default function CourseList({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await axios.get('http://localhost:3000/courses');
      setCourses(coursesRes.data);

      const userId = localStorage.getItem('userId');
      if (userId && !isAdmin) {
        const userRes = await axios.get(`http://localhost:3000/users/${userId}`);
        if (userRes.data && userRes.data.courses) {
          const ownedIds = userRes.data.courses.map(c => c.id);
          setOwnedCourseIds(ownedIds);
          localStorage.setItem('myCourses', JSON.stringify(userRes.data.courses));
        }
      }
    } catch (error) {
      console.error('ดึงข้อมูลไม่สำเร็จ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleDelete = async (id) => {
    if (window.confirm('แน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?')) {
      try {
        await axios.delete(`http://localhost:3000/courses/${id}`);
        fetchData();
      } catch (error) {
        console.error('ลบข้อมูลไม่สำเร็จ', error);
      }
    }
  };

  const displayedCourses = courses.filter((course) => {
    if (isAdmin) return true;
    if (course.isActive !== true) return false;
    if (ownedCourseIds.includes(course.id)) return false; 
    return true; 
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#003366', fontSize: '18px', fontFamily: '"Prompt", sans-serif' }}>กำลังค้นหาคอร์สที่ใช่สำหรับคุณ...</div>;
  }

  return (
    <div style={{ fontFamily: '"Prompt", sans-serif', paddingBottom: '50px' }}>
      
      {/* ส่วนหัวของหน้าและปุ่มเพิ่มคอร์สสำหรับแอดมิน */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#003366' }}>คอร์สเรียนทั้งหมด</h2>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>พบ {displayedCourses.length} คอร์สที่น่าสนใจ</p>
        </div>
        
        {isAdmin && (
          <Link to="/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              background: '#28a745', color: '#FFFFFF', border: 'none', borderRadius: '12px', 
              cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)' 
            }}>
              <FaPlus /> เพิ่มคอร์สเรียนใหม่
            </button>
          </Link>
        )}
      </div>

      {/* Grid รายการคอร์ส */}
      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {displayedCourses.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#f9f9f9', borderRadius: '20px', color: '#aaa' }}>
            <FaBook style={{ fontSize: '50px', marginBottom: '15px' }} />
            <p>ไม่พบคอร์สเรียนที่ต้องการแสดงในขณะนี้</p>
          </div>
        ) : (
          displayedCourses.map((course) => (
            <div key={course.id} className="course-card" style={{ 
              background: '#FFFFFF', border: '1px solid #f0f0f0', borderRadius: '20px', 
              overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', 
              display: 'flex', flexDirection: 'column', transition: '0.3s'
            }}>
              
              {/* Badge สถานะสำหรับ Admin */}
              {isAdmin && (
                <div style={{
                  position: 'absolute', top: '15px', left: '15px',
                  backgroundColor: course.isActive ? '#28a745' : '#dc3545',
                  color: '#fff', padding: '5px 12px', borderRadius: '30px',
                  fontSize: '12px', fontWeight: 'bold', zIndex: 1
                }}>
                  {course.isActive ? '• กำลังเปิดขาย' : '• ซ่อนอยู่'}
                </div>
              )}

              {/* รูปภาพหน้าปก */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f5f5f5' }}>
                {course.coverImageUrl ? (
                  <img 
                    src={`http://localhost:3000${course.coverImageUrl}`} 
                    alt={course.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    <FaBook style={{ fontSize: '40px' }} />
                  </div>
                )}
              </div>
              
              {/* เนื้อหาใน Card */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '18px', color: '#003366', margin: '0 0 10px 0', lineHeight: '1.4', height: '50px', overflow: 'hidden' }}>
                  {course.title}
                </h3>
                
                <p style={{ 
                  color: '#777', fontSize: '14px', marginBottom: '20px', height: '40px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {course.shortDescription || 'เริ่มต้นเรียนรู้วิชาไปกับเราในคอร์สเรียนคุณภาพ'}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <span style={{ color: '#F2984A', fontWeight: 'bold', fontSize: '24px' }}>
                      ฿{Number(course.salePrice).toLocaleString()}
                    </span>
                    {course.originalPrice && (
                      <span style={{ textDecoration: 'line-through', color: '#ccc', fontSize: '14px' }}>
                        ฿{Number(course.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* ปุ่ม Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {isAdmin ? (
                      <>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/edit/${course.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                            <button style={{ 
                              width: '100%', padding: '10px', background: '#003366', color: '#FFFFFF', 
                              border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                            }}>
                              <FaEdit /> แก้ไข
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(course.id)} 
                            style={{ 
                              padding: '10px 15px', background: '#fff', color: '#dc3545', 
                              border: '1px solid #dc3545', borderRadius: '10px', cursor: 'pointer' 
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                          <button style={{ width: '100%', padding: '10px', background: '#f0f5ff', color: '#003366', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <FaEye /> ดูตัวอย่างหน้าเว็บ
                          </button>
                        </Link>
                      </>
                    ) : (
                      <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ 
                          width: '100%', padding: '14px', background: '#F2984A', 
                          color: '#FFFFFF', border: 'none', borderRadius: '12px', 
                          cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', 
                          boxShadow: '0 4px 10px rgba(242, 152, 74, 0.2)', transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e0873a'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#F2984A'}
                        >
                          รายละเอียดคอร์ส
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      <style>{`
        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
          border-color: #F2984A !important;
        }
      `}</style>
    </div>
  );
}