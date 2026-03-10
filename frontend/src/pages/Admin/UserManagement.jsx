// src/pages/Admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaArrowLeft, FaUserCog, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // วันหมดอายุสำหรับคอร์สที่เพิ่ม Manual
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

      // ประมวลผลข้อมูล: ดึงเฉพาะ approved payments มาแสดง
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

        // ตัดข้อมูลซ้ำ (ใช้ Map, ให้ paidCourses ที่มี paymentId เป็นหลัก)
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

  // ✅ ลบคอร์สออกจาก user (ลบทั้ง user_courses และ payment records)
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
          // ใช้ DELETE endpoint เดียว — backend จัดการทั้ง user_courses และ payment records
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

  // ตรวจสอบว่าคอร์สหมดอายุแล้วหรือยัง
  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading)
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูล...</div>;

  // 1. หน้าจัดการคอร์สรายบุคคล
  if (selectedUser) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => setSelectedUser(null)}
          style={{ background: 'none', border: 'none', color: '#003366', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}
        >
          <FaArrowLeft /> กลับไปหน้ารายชื่อ
        </button>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
          จัดการคอร์ส: <span style={{ color: '#F2984A' }}>{selectedUser.firstName} {selectedUser.lastName}</span>
        </h2>

        {/* ส่วนเพิ่มคอร์ส Manual */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <select
              value={selectedCourseToAdd}
              onChange={(e) => setSelectedCourseToAdd(e.target.value)}
              style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '200px' }}
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
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '160px' }}
              />
            </div>

            <button
              onClick={handleAddCourse}
              style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              <FaPlus /> เพิ่มคอร์ส
            </button>
          </div>
        </div>

        <h3 style={{ color: '#333' }}>คอร์สที่ครอบครอง ({selectedUser.courses?.length || 0})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {selectedUser.courses?.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>ยังไม่มีคอร์สที่ครอบครอง</p>
          )}
          {selectedUser.courses?.map((course) => {
            const expired = isExpired(course.expiresAt);
            return (
              <div
                key={course.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: `1px solid ${expired ? '#ffc107' : '#eee'}`,
                  padding: '15px', borderRadius: '8px',
                  backgroundColor: expired ? '#fffbf0' : '#fff',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: '#003366', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {course.title}
                    {/* badge หมดอายุ */}
                    {expired && (
                      <span style={{ fontSize: '12px', backgroundColor: '#ffc107', color: '#333', padding: '2px 8px', borderRadius: '12px', fontWeight: 'normal' }}>
                        ⏰ หมดอายุแล้ว
                      </span>
                    )}
                  </h4>
                  {/* แสดงวันหมดอายุถ้ามี */}
                  {course.expiresAt && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: expired ? '#e67e22' : '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaClock size={12} />
                      หมดอายุ: {new Date(course.expiresAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {!course.expiresAt && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#aaa' }}>ไม่มีวันหมดอายุ</p>
                  )}
                </div>

                {/* ปุ่มลบคอร์ส */}
                <button
                  onClick={() => handleDeleteCourse(course)}
                  style={{ padding: '8px 14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                >
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #eee', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaUserCog /> ระบบจัดการผู้ใช้งาน
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#003366', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>ชื่อ - นามสกุล</th>
            <th style={{ padding: '15px' }}>อีเมล</th>
            <th style={{ padding: '15px' }}>คอร์สที่มี</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>
                {user.firstName || 'ไม่ระบุ'} {user.lastName || ''}{' '}
                {user.role === 'admin' && '(Admin)'}
              </td>
              <td style={{ padding: '15px' }}>{user.email}</td>
              <td style={{ padding: '15px' }}>
                <strong style={{ color: user.courses?.length > 0 ? '#28a745' : '#888' }}>
                  {user.courses?.length || 0} คอร์ส
                </strong>
              </td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    style={{ padding: '8px 15px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    จัดการคอร์ส
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.firstName)}
                      style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
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
  );
}