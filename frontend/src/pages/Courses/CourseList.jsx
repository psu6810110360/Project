// CourseList.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaBook, FaSearch, FaFilter } from 'react-icons/fa'; // ✅ เพิ่ม FaSearch, FaFilter
import Swal from 'sweetalert2';
import './CourseList.css';

export default function CourseList({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ เพิ่ม State สำหรับจัดการการค้นหาและตัวกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

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

  // ✅ ปรับฟังก์ชันดึงข้อมูลให้รองรับ ค้นหา และ จัดเรียงราคา
  const getProcessedCourses = () => {
    // 1. กรองสิทธิ์และคอร์สที่ซื้อไปแล้ว (โค้ดเดิมของคุณ)
    let filtered = courses.filter(course => {
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

    // 2. กรองจากคำค้นหา (Search)
    if (searchTerm.trim() !== '') {
      const lowerCaseTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(lowerCaseTerm) ||
        (course.shortDescription && course.shortDescription.toLowerCase().includes(lowerCaseTerm))
      );
    }

    // 3. จัดเรียงราคา (Sort)
    if (sortOrder === 'lowToHigh') {
      filtered.sort((a, b) => Number(a.salePrice || 0) - Number(b.salePrice || 0));
    } else if (sortOrder === 'highToLow') {
      filtered.sort((a, b) => Number(b.salePrice || 0) - Number(a.salePrice || 0));
    }

    return filtered;
  };

  const coursesToShow = getProcessedCourses();

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

      {/* ✅ แถบเครื่องมือ Search & Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f4f7f6', padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

        {/* ช่องค้นหา */}
        <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อคอร์สเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#334155' }}
          />
        </div>

        {/* ตัวกรองราคา */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaFilter style={{ color: '#64748b' }} />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', cursor: 'pointer', outline: 'none', backgroundColor: '#fff', color: '#334155', minWidth: '160px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            <option value="default">จัดเรียง: แนะนำ</option>
            <option value="lowToHigh">ราคา: ต่ำไปสูง</option>
            <option value="highToLow">ราคา: สูงไปต่ำ</option>
          </select>
        </div>
      </div>

      <div className="course-grid">
        {coursesToShow.length === 0 ? (
          <div className="course-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <FaSearch className="course-empty-icon" style={{ fontSize: '48px', marginBottom: '15px', color: '#cbd5e1' }} />
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>ไม่พบคอร์สเรียนที่คุณค้นหา</p>
            <p>ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองใหม่อีกครั้ง</p>
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
                  <img
                    src={course.coverImageUrl ? course.coverImageUrl : 'https://via.placeholder.com/300x200'}
                    alt={course.title}
                    className="course-image"
                  />
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

                    {course.originalPrice && Number(course.originalPrice) !== Number(course.salePrice) && (
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
                          <button className="btn btn-preview"><FaEye /> ดูตัวอย่าง</button>
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