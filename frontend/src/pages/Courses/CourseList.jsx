// CourseList.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaBook } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './CourseList.css'; // โหลด CSS ที่แยกไว้

export default function CourseList({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const [myPayments, setMyPayments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await axios.get('http://localhost:3000/courses');
      setCourses(coursesRes.data);

      const token = localStorage.getItem('token');
      if (token && !isAdmin) {
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
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "แน่ใจหรือไม่ว่าต้องการลบคอร์สนี้? (หากลบแล้วจะไม่สามารถกู้คืนได้)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/courses/${id}`);
        Swal.fire('ลบสำเร็จ!', 'คอร์สนี้ถูกลบออกจากระบบแล้ว', 'success');
        fetchData(); 
      } catch (error) {
        console.error('ลบข้อมูลไม่สำเร็จ', error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบคอร์สได้ กรุณาลองใหม่อีกครั้ง', 'error');
      }
    }
  };

  const getFilteredCourses = () => {
    return courses.filter(course => {
      if (isAdmin) return true; 
      if (!course.isActive) return false;       
      
      const relatedPayments = myPayments.filter(item => {
        if (item.course && String(item.course.id) === String(course.id)) return true;
        if (item.courses && item.courses.some(c => String(c.id) === String(course.id))) return true;
        if (String(item.id) === String(course.id)) return true;
        return false;
      });
            
      if (relatedPayments.length > 0) {
        const shouldHide = relatedPayments.some(p => {
          const status = p.status ? p.status.toLowerCase() : '';
          return status === 'approved' || status === 'pending';
        });
        if (shouldHide) return false; 
      }
      return true;
    });
  };

  const coursesToShow = getFilteredCourses();

  if (loading) {
    return <div className="loading-screen">กำลังค้นหาคอร์สที่ใช่สำหรับคุณ...</div>;
  }

  return (
    <div className="course-container">
      
      <div className="course-header">
        <div>
          <h2 className="course-title">คอร์สเรียนทั้งหมด</h2>
          <p className="course-subtitle">พบ {coursesToShow.length} คอร์สที่พร้อมให้คุณเรียนรู้</p>
        </div>
        
        {isAdmin && (
          <Link to="/add" style={{ textDecoration: 'none' }}>
            <button className="btn btn-add-course">
              <FaPlus /> เพิ่มคอร์สเรียนใหม่
            </button>
          </Link>
        )}
      </div>

      <div className="course-grid">
        {coursesToShow.length === 0 ? (
          <div className="course-empty">
            <FaBook className="course-empty-icon" />
            <p>ไม่พบคอร์สเรียนที่สามารถสั่งซื้อได้ในขณะนี้</p>
          </div>
        ) : (
          coursesToShow.map((course) => (
            <div key={course.id} className="course-card">
              
              {isAdmin && (
                <div className={`badge-status ${course.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {course.isActive ? '• กำลังเปิดขาย' : '• ซ่อนอยู่'}
                </div>
              )}

              <div className="course-cover">
                {course.coverImageUrl ? (
                  <img src={`http://localhost:3000${course.coverImageUrl}`} alt={course.title} />
                ) : (
                  <div className="course-cover-placeholder">
                    <FaBook />
                  </div>
                )}
              </div>
              
              <div className="course-body">
                <h3 className="course-name">{course.title}</h3>
                <p className="course-desc">
                  {course.shortDescription || 'เริ่มต้นเรียนรู้วิชาไปกับเราในคอร์สเรียนคุณภาพ'}
                </p>

                <div className="course-footer">
                  <div className="course-price-wrapper">
                    <span className="sale-price">
                      ฿{Number(course.salePrice).toLocaleString()}
                    </span>
                    {course.originalPrice && (
                      <span className="original-price">
                        ฿{Number(course.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="action-buttons">
                    {isAdmin ? (
                      <>
                        <div className="admin-actions">
                          <Link to={`/edit/${course.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                            <button className="btn btn-edit"><FaEdit /> แก้ไข</button>
                          </Link>
                          <button className="btn btn-delete" onClick={() => handleDelete(course.id)}>
                            <FaTrash />
                          </button>
                        </div>
                        <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                          <button className="btn btn-preview"><FaEye /> ดูตัวอย่างหน้าเว็บ</button>
                        </Link>
                      </>
                    ) : (
                      <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-detail">รายละเอียดคอร์ส</button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}