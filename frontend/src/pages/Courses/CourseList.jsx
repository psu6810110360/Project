// CourseList.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaBook } from 'react-icons/fa';

export default function CourseList({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const [myPayments, setMyPayments] = useState([]); // ✅ เพิ่ม State เก็บประวัติ
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. ดึงคอร์สทั้งหมด
      const coursesRes = await axios.get('http://localhost:3000/courses');
      setCourses(coursesRes.data);

      const token = localStorage.getItem('token');
      if (token && !isAdmin) {
        // 2. ✅ ดึงประวัติการสั่งซื้อของยูสเซอร์คนนั้น
        const resPayments = await axios.get('http://localhost:3000/payments/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyPayments(resPayments.data);
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

  // ==========================================
  // ✅ ระบบกรองคอร์ส (ซ่อนคอร์สที่ซื้อไปแล้ว หรือ รออนุมัติ)
  // ==========================================
  const getFilteredCourses = () => {
    return courses.filter(course => {
      // 1. ถ้าเป็น Admin ให้เห็นทั้งหมด
      if (isAdmin) return true; 
      // 2. ซ่อนคอร์สที่ไม่ได้เปิดขาย
      if (!course.isActive) return false;       
      // 3. หาว่ายูสเซอร์เคยทำรายการคอร์สนี้ไหม (ดึงมาทั้งหมด)
      const relatedPayments = myPayments.filter(item => {
        if (item.course && String(item.course.id) === String(course.id)) return true;
        if (item.courses && item.courses.some(c => String(c.id) === String(course.id))) return true;
        if (String(item.id) === String(course.id)) return true;
        return false;
      });
            
      if (relatedPayments.length > 0) {
        // เช็คว่ามีประวัติที่ผ่าน (approved) หรือกำลังรอตรวจ (pending) อยู่หรือไม่
        const shouldHide = relatedPayments.some(p => {
          const status = p.status ? p.status.toLowerCase() : '';
          return status === 'approved' || status === 'pending';
        });
        
        // 🔴 ถ้าเจอว่ากำลังรออนุมัติ หรืออนุมัติแล้ว ให้ซ่อนออกจากหน้าขายเลย!
        if (shouldHide) return false; 
      }
      return true;
    });
  };

  const coursesToShow = getFilteredCourses();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#003366', fontSize: '18px', fontFamily: '"Prompt", sans-serif' }}>กำลังค้นหาคอร์สที่ใช่สำหรับคุณ...</div>;
  }

  return (
    <div style={{ fontFamily: '"Prompt", sans-serif', paddingBottom: '50px' }}>
      
      {/* ส่วนหัวของหน้า */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#003366' }}>คอร์สเรียนทั้งหมด</h2>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>พบ {coursesToShow.length} คอร์สที่พร้อมให้คุณเรียนรู้</p>
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

      {/* ✅ กริดแสดงผลคอร์สแบบเรียบง่าย (เหมือนออริจินัล) */}
      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {coursesToShow.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#f9f9f9', borderRadius: '20px', color: '#aaa' }}>
            <FaBook style={{ fontSize: '50px', marginBottom: '15px' }} />
            <p>ไม่พบคอร์สเรียนที่สามารถสั่งซื้อได้ในขณะนี้</p>
          </div>
        ) : (
          coursesToShow.map((course) => (
            <div key={course.id} className="course-card" style={{ 
              background: '#FFFFFF', border: '1px solid #f0f0f0', borderRadius: '20px', 
              overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', 
              display: 'flex', flexDirection: 'column', transition: '0.3s', position: 'relative'
            }}>
              
              {/* ป้ายกำกับ Admin */}
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
                  <img src={`http://localhost:3000${course.coverImageUrl}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    <FaBook style={{ fontSize: '40px' }} />
                  </div>
                )}
              </div>
              
              {/* รายละเอียดเนื้อหา */}
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
                            <button style={{ width: '100%', padding: '10px', background: '#003366', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                              <FaEdit /> แก้ไข
                            </button>
                          </Link>
                          <button onClick={() => handleDelete(course.id)} style={{ padding: '10px 15px', background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '10px', cursor: 'pointer' }}>
                            <FaTrash />
                          </button>
                        </div>
                        <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                          <button style={{ width: '100%', padding: '10px', background: '#f0f5ff', color: '#003366', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <FaEye /> ดูตัวอย่างหน้าเว็บ
                          </button>
                        </Link>
                      </>
                    ) : (
                      <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ 
                          width: '100%', padding: '14px', background: '#F2984A', color: '#FFFFFF', border: 'none', borderRadius: '12px', 
                          cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(242, 152, 74, 0.2)', transition: '0.3s'
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