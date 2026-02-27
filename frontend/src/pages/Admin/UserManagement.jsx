import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaArrowLeft, FaUserCog } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function UserManagement() {
  const [users, setUsers] = useState([]); 
  const [allCourses, setAllCourses] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [userRes, courseRes] = await Promise.all([
        axios.get('http://localhost:3000/users'),
        axios.get('http://localhost:3000/courses')
      ]);
      setUsers(userRes.data);
      setAllCourses(courseRes.data);
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
      const response = await axios.post(`http://localhost:3000/users/${selectedUser.id}/add-course/${selectedCourseToAdd}`);
      const updatedUser = response.data;
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedCourseToAdd('');
      Swal.fire('สำเร็จ', 'เพิ่มคอร์สให้ผู้เรียนเรียบร้อยแล้ว', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || 'ไม่สามารถเพิ่มคอร์สได้';
      Swal.fire('เกิดข้อผิดพลาด', msg, 'error');
    }
  };

  const handleRemoveCourse = (courseId) => {
    Swal.fire({
      title: 'ยืนยันการดึงคอร์สคืน?',
      text: "ผู้เรียนจะเสียสิทธิ์การเข้าถึงคอร์สนี้ทันที",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:3000/users/${selectedUser.id}/remove-course/${courseId}`);
          const updatedUser = response.data;
          setSelectedUser(updatedUser);
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          Swal.fire('ลบสำเร็จ', 'ดึงคอร์สออกจากบัญชีผู้ใช้แล้ว', 'success');
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้', 'error');
        }
      }
    });
  };

  const handleDeleteUser = (userId, userName) => {
    Swal.fire({
      title: `ลบผู้ใช้ ${userName}?`,
      text: "ข้อมูลการเรียนทั้งหมดของคนนี้จะหายไปและกู้คืนไม่ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/users/${userId}`);
          setUsers(users.filter(u => u.id !== userId));
          Swal.fire('ลบแล้ว!', 'บัญชีผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบผู้ใช้ได้', 'error');
        }
      }
    });
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูล...</div>;

  // 1. หน้าจัดการคอร์สรายบุคคล
  if (selectedUser) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#003366', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <FaArrowLeft /> กลับไปหน้ารายชื่อ
        </button>
        <h2 style={{ color: '#003366', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
          จัดการคอร์ส: <span style={{ color: '#F2984A' }}>{selectedUser.firstName} {selectedUser.lastName}</span>
        </h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
          <select value={selectedCourseToAdd} onChange={(e) => setSelectedCourseToAdd(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option value="">-- เลือกคอร์สเพื่อเพิ่มสิทธิ์ --</option>
            {allCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <button onClick={handleAddCourse} style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaPlus /> เพิ่มคอร์ส
          </button>
        </div>
        <h3 style={{ color: '#333' }}>คอร์สที่ครอบครอง ({selectedUser.courses?.length || 0})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {selectedUser.courses?.map(course => (
            <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: 0, color: '#003366' }}>{course.title}</h4>
              </div>
              <button onClick={() => handleRemoveCourse(course.id)} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <FaTrash /> ลบสิทธิ์
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. หน้ารวมรายชื่อผู้ใช้งาน (ตัวหลัก)
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #eee', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaUserCog /> ระบบจัดการผู้ใช้งาน (Real-time Database)
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
              <td style={{ padding: '15px' }}>{user.firstName || 'ไม่ระบุ'} {user.lastName || ''} {user.role === 'admin' && '(Admin)'}</td>
              <td style={{ padding: '15px' }}>{user.email}</td>
              <td style={{ padding: '15px' }}>{user.courses?.length || 0} คอร์ส</td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                    onClick={() => setSelectedUser(user)}
                    style={{ padding: '8px 15px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    จัดการคอร์ส
                    </button>
                    {user.role !== 'admin' && (
                    <button 
                        onClick={() => handleDeleteUser(user.id, user.firstName)}
                        style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
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