// src/pages/Admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaArrowLeft, FaUserCog, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './UserManagement.css'; // ดึงไฟล์ CSS มาใช้ตรงนี้

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async (currentSelectedUserId = null) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, courseRes, paymentRes] = await Promise.all([
        axios.get('http://localhost:3000/users', { headers }),
        axios.get('http://localhost:3000/courses'),
        axios.get('http://localhost:3000/payments', { headers }).catch(() => ({ data: [] })),
      ]);

      const allCoursesData = courseRes.data;
      const allPaymentsData = paymentRes.data || [];

      const processedUsers = userRes.data.map((user) => {
        const userPayments = allPaymentsData.filter(
          (p) =>
            (p.user?.id === user.id || p.userId === user.id) &&
            p.status?.toLowerCase() === 'approved',
        );

        const paidCourses = userPayments
          .map((p) => {
            if (!p.course) return null;
            return {
              ...p.course,
              paymentId: p.id,
              paymentStatus: 'approved',
              expiresAt: p.expiresAt || null,
            };
          })
          .filter(Boolean);

        const courseMap = new Map();
        paidCourses.forEach((c) => {
          courseMap.set(c.id, c);
        });
        const uniqueCourses = Array.from(courseMap.values());

        return { ...user, courses: uniqueCourses };
      });

      setUsers(processedUsers);
      setAllCourses(allCoursesData);

      if (currentSelectedUserId || selectedUser) {
        const targetId = currentSelectedUserId || selectedUser?.id;
        const updatedSelectedUser = processedUsers.find((u) => u.id === targetId);
        if (updatedSelectedUser) setSelectedUser(updatedSelectedUser);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!selectedCourseToAdd) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/users/${selectedUser.id}/add-course/${selectedCourseToAdd}`,
        { expiresAt: expiresAt || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire('สำเร็จ', 'เพิ่มคอร์สให้ผู้เรียนเรียบร้อยแล้ว', 'success');
      setSelectedCourseToAdd('');
      setExpiresAt('');
      await fetchInitialData(selectedUser.id);
    } catch (error) {
      const msg = error.response?.data?.message || 'ไม่สามารถเพิ่มคอร์สได้';
      Swal.fire('เกิดข้อผิดพลาด', msg, 'error');
    }
  };

  const handleDeleteCourse = (course) => {
    Swal.fire({
      title: 'ยืนยันการลบคอร์ส?',
      text: `คอร์ส "${course.title}" จะถูกลบออกจากผู้เรียนคนนี้ทันที และไม่สามารถกู้คืนได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#888',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `http://localhost:3000/payments/user/${selectedUser.id}/course/${course.id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          Swal.fire('ลบแล้ว!', 'คอร์สถูกลบออกจากผู้เรียนเรียบร้อยแล้ว', 'success');
          await fetchInitialData(selectedUser.id);
        } catch (error) {
          console.error(error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้', 'error');
        }
      }
    });
  };

  const handleDeleteUser = (userId, userName) => {
    Swal.fire({
      title: `ลบผู้ใช้ ${userName}?`,
      text: 'ข้อมูลการเรียนทั้งหมดของคนนี้จะหายไปและกู้คืนไม่ได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:3000/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(users.filter((u) => u.id !== userId));
          Swal.fire('ลบแล้ว!', 'บัญชีผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบผู้ใช้ได้', 'error');
        }
      }
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading)
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูล...</div>;

  // 1. หน้าจัดการคอร์สรายบุคคล
  if (selectedUser) {
    return (
      <div className="manage-course-container">
        <button onClick={() => setSelectedUser(null)} className="btn-back">
          <FaArrowLeft /> กลับไปหน้ารายชื่อ
        </button>
        
        <h2 className="page-title">
          จัดการคอร์ส: <span className="highlight-text">{selectedUser.firstName} {selectedUser.lastName}</span>
        </h2>

        {/* ส่วนเพิ่มคอร์ส Manual */}
        <div className="add-course-box">
          <div className="add-course-flex">
            <select
              value={selectedCourseToAdd}
              onChange={(e) => setSelectedCourseToAdd(e.target.value)}
              className="form-select"
            >
              <option value="">-- เลือกคอร์สเพื่อเพิ่มสิทธิ์ (แบบ Manual) --</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            {/* วันหมดอายุ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaClock size={11} /> วันหมดอายุ (ไม่บังคับ)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="form-input"
              />
            </div>

            <button onClick={handleAddCourse} className="btn-add">
              <FaPlus /> เพิ่มคอร์ส
            </button>
          </div>
        </div>

        <h3 style={{ color: '#333' }}>คอร์สที่ครอบครอง ({selectedUser.courses?.length || 0})</h3>
        <div className="course-list">
          {selectedUser.courses?.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>ยังไม่มีคอร์สที่ครอบครอง</p>
          )}
          {selectedUser.courses?.map((course) => {
            const expired = isExpired(course.expiresAt);
            return (
              <div key={course.id} className={`course-item ${expired ? 'expired' : ''}`}>
                <div>
                  <h4 className="course-title">
                    {course.title}
                    {expired && <span className="badge-expired">⏰ หมดอายุแล้ว</span>}
                  </h4>
                  {course.expiresAt ? (
                    <p className="course-date" style={{ color: expired ? '#e67e22' : '#888' }}>
                      <FaClock size={12} />
                      หมดอายุ: {new Date(course.expiresAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  ) : (
                    <p className="course-date" style={{ color: '#aaa' }}>ไม่มีวันหมดอายุ</p>
                  )}
                </div>

                <button onClick={() => handleDeleteCourse(course)} className="btn-delete">
                  <FaTrash /> ลบคอร์ส
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. หน้ารวมรายชื่อผู้ใช้งาน (ตัวหลัก)
  return (
    <div className="user-management-container">
      <h2 className="page-title">
        <FaUserCog /> ระบบจัดการผู้ใช้งาน
      </h2>
      
      {/* ครอบตารางเพื่อให้เลื่อนได้บนจอมือถือ */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ชื่อ - นามสกุล</th>
              <th>อีเมล</th>
              <th>คอร์สที่มี</th>
              <th style={{ textAlign: 'center' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {user.firstName || 'ไม่ระบุ'} {user.lastName || ''}{' '}
                  {user.role === 'admin' && '(Admin)'}
                </td>
                <td>{user.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <strong style={{ color: user.courses?.length > 0 ? '#28a745' : '#888' }}>
                    {user.courses?.length || 0} คอร์ส
                  </strong>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => setSelectedUser(user)} className="btn-manage">
                      จัดการคอร์ส
                    </button>
                    {user.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(user.id, user.firstName)} className="btn-delete">
                        ลบผู้ใช้
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}