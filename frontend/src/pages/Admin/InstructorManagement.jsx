import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaChalkboardTeacher, FaPlus, FaEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/instructors');
      setInstructors(response.data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลครูจากเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInstructor = (id, name) => {
    Swal.fire({
      title: `ลบประวัติ ${name}?`,
      text: "หากลบแล้วข้อมูลนี้จะหายไปจากระบบ (คอร์สที่เคยผูกไว้อาจจะไม่มีชื่อครูคนนี้แสดงอีก)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/instructors/${id}`);
          
          setInstructors(instructors.filter(inst => inst.id !== id));
          Swal.fire('ลบสำเร็จ!', 'ลบข้อมูลครูออกจากระบบแล้ว', 'success');
        } catch (error) {
          console.error(error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      }
    });
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <h2 style={{ color: '#003366', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaChalkboardTeacher /> ระบบจัดการรายชื่อครูผู้สอน
        </h2>
        
        <button 
          onClick={() => navigate('/add-instructor')} 
          style={{ 
            padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', 
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s',
            boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FaPlus size={16} /> เพิ่มประวัติครูใหม่
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#003366', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '15px', width: '80px' }}>รูปภาพ</th>
            <th style={{ padding: '15px', width: '250px' }}>ชื่อ - นามสกุล / ฉายา</th>
            <th style={{ padding: '15px' }}>ความเชี่ยวชาญ (Bio)</th>
            <th style={{ padding: '15px', textAlign: 'center', width: '180px' }}>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((inst) => (
            <tr key={inst.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>
                <img 
                  src={inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : 'https://via.placeholder.com/60'} 
                  alt={inst.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F2984A' }} 
                />
              </td>
              <td style={{ padding: '15px', fontWeight: 'bold', color: '#003366' }}>
                {inst.name}
              </td>
              <td style={{ padding: '15px', color: '#555', fontSize: '14px' }}>
                {inst.bio || '- ไม่ได้ระบุ -'}
              </td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigate(`/edit-instructor/${inst.id}`)}
                    style={{ padding: '8px 15px', backgroundColor: '#F2984A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <FaEdit /> แก้ไข
                  </button>
                  <button 
                    onClick={() => handleDeleteInstructor(inst.id, inst.name)}
                    style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <FaTrash /> ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {instructors.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                ยังไม่มีข้อมูลครูในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}