import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const userId = localStorage.getItem('userId'); //

  useEffect(() => {
    if (userId) {
      fetchMyCourses();
    }
  }, [userId]);

  const fetchMyCourses = async () => {
    try {
      // 🔍 ดึงข้อมูล User พร้อมคอร์สที่มีจาก Database
      const res = await axios.get(`http://localhost:3000/users/${userId}`);
      // ตรวจสอบว่า Backend ส่งอาร์เรย์ courses มาให้จริง
      setMyCourses(res.data.courses || []); 
    } catch (error) {
      console.error('ดึงข้อมูลล้มเหลว', error);
    }
  };

  // ✅ เปลี่ยนชื่อให้ตรงกับที่เรียกใช้ในปุ่ม
  const handleRemoveMyCourse = (courseId, courseTitle) => {
    Swal.fire({
      title: 'ยกเลิกคอร์สเรียนนี้?',
      text: `คุณต้องการลบ "${courseTitle}" ออกจากรายการเรียนของคุณใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          //
          await axios.delete(`http://localhost:3000/users/${userId}/remove-course/${courseId}`);
          setMyCourses(myCourses.filter(c => c.id !== courseId));
          Swal.fire('สำเร็จ', 'ลบคอร์สเรียนเรียบร้อยแล้ว', 'success');
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบคอร์สได้', 'error');
        }
      }
    });
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>📚 คอร์สเรียนของฉัน</h2>
      
      {myCourses.length === 0 ? (
        <p style={{ color: '#888' }}>คุณยังไม่มีคอร์สเรียนในขณะนี้</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {myCourses.map(course => (
            <div key={course.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px', position: 'relative', backgroundColor: '#fff' }}>
              
              {/* ✕ ปุ่มลบคอร์ส (เรียกใช้ชื่อฟังก์ชันที่ถูกต้องแล้ว) */}
              <button 
                onClick={() => handleRemoveMyCourse(course.id, course.title)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                ✕
              </button>

              <img src={`http://localhost:3000${course.coverImageUrl}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
              <h3 style={{ fontSize: '18px', margin: '15px 0' }}>{course.title}</h3>
              <button style={{ width: '100%', padding: '10px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>เข้าเรียน</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}