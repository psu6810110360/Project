import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';

export default function InstructorForm() {
  const navigate = useNavigate();
  
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

 
  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:3000/instructors/${id}`)
        .then(res => {
          setName(res.data.name);
          setBio(res.data.bio || '');
          if (res.data.imageUrl) {
            setPreviewImage(`http://localhost:3000${res.data.imageUrl}`);
          }
        })
        .catch(err => {
          console.error(err);
          Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลครูได้', 'error');
        });
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', name);
    data.append('bio', bio);
    if (image) data.append('image', image); 

    try {
      if (isEditMode) {
      
        await axios.patch(`http://localhost:3000/instructors/${id}`, data);
        Swal.fire('สำเร็จ!', 'แก้ไขประวัติครูผู้สอนเรียบร้อยแล้ว', 'success');
      } else {
        await axios.post('http://localhost:3000/instructors', data);
        Swal.fire('สำเร็จ!', 'เพิ่มประวัติครูผู้สอนเรียบร้อยแล้ว', 'success');
      }
      navigate('/manage-instructors'); 
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#003366', textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        {isEditMode ? '✏️ แก้ไขประวัติครูผู้สอน' : 'เพิ่มประวัติครูผู้สอน'}
      </h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        
        {/* แสดงรูปเก่าตอนแก้ไข */}
        {previewImage && !image && (
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img src={previewImage} alt="profile preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #F2984A' }} />
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>รูปโปรไฟล์ปัจจุบัน</div>
          </div>
        )}

        <label style={{ fontWeight: 'bold', color: '#003366' }}>ชื่อ-นามสกุล:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="เช่น ครูพี่เอก" />

        <label style={{ fontWeight: 'bold', color: '#003366' }}>ประวัติย่อ / ความเชี่ยวชาญ:</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, height: '80px' }} placeholder="เช่น เชี่ยวชาญฟิสิกส์ ม.ปลาย" />

        <label style={{ fontWeight: 'bold', color: '#003366' }}>รูปโปรไฟล์ครู {isEditMode && <span style={{color: '#888', fontSize: '12px'}}>(ไม่ต้องเลือกถ้าใช้รูปเดิม)</span>}:</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={inputStyle} required={!isEditMode} />

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" style={{ flex: 2, padding: '12px', background: '#F2984A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            บันทึกข้อมูล
          </button>
          <button type="button" onClick={() => navigate('/manage-instructors')} style={{ flex: 1, padding: '12px', background: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}