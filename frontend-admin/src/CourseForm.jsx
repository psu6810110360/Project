import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '', shortDescription: '', isActive: true, originalPrice: '', salePrice: '', instructorName: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [instructorImage, setInstructorImage] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:3000/courses/${id}`).then((res) => {
        const course = res.data;
        setFormData({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
        
          isActive: course.isActive === true || course.isActive === "true" || course.isActive === 1,
          originalPrice: course.originalPrice || '',
          salePrice: course.salePrice || '',
          instructorName: course.instructorName || '',
        });
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    
    Object.keys(formData).forEach(key => {
      if (key === 'isActive') {
        data.append('isActive', formData.isActive ? 'true' : 'false');
      } else {
        data.append(key, formData[key]);
      }
    });

    if (coverImage) data.append('coverImage', coverImage);
    if (instructorImage) data.append('instructorImage', instructorImage);

    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:3000/courses/${id}`, data);
      } else {
        await axios.post('http://localhost:3000/courses', data);
      }
      navigate('/');
    } catch (error) {
      console.error('บันทึกข้อมูลไม่สำเร็จ', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  
  const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outlineColor: '#003366', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '8px', color: '#003366' };

  return (
    <div style={{ maxWidth: '650px', background: '#FFFFFF', border: 'none', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', margin: '0 auto' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px', marginTop: 0 }}>
        {isEditMode ? '✏️ แก้ไขคอร์สเรียน' : ' เพิ่มคอร์สเรียนใหม่'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={labelStyle}>ชื่อคอร์ส:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>รายละเอียดสั้น:</label>
          <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ราคาเดิม:</label>
            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, color: '#F2984A' }}>ราคาขาย:</label>
            <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} required style={{ ...inputStyle, border: '1px solid #F2984A' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>รูปภาพปก:</label>
          <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" style={{ width: '100%' }} />
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
        
        <div style={{ display: 'flex', gap: '20px' }}>
           <div style={{ flex: 1 }}>
              <label style={labelStyle}>ชื่อครูผู้สอน:</label>
              <input type="text" name="instructorName" value={formData.instructorName} onChange={handleChange} style={inputStyle} />
           </div>
           <div style={{ flex: 1 }}>
              <label style={labelStyle}>รูปครูผู้สอน:</label>
              <input type="file" onChange={(e) => setInstructorImage(e.target.files[0])} accept="image/*" style={{ width: '100%', marginTop: '5px' }} />
           </div>
        </div>

        <div style={{ marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#003366', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '10px', width: '18px', height: '18px' }} /> 
            เปิดใช้งานคอร์สนี้ทันที (Active)
          </label>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
          <button type="submit" style={{ flex: 2, padding: '12px', background: '#F2984A', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' }}>
             บันทึกข้อมูล
          </button>
          <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '12px', background: '#e9ecef', color: '#003366', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}