//CourseForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '', shortDescription: '', isActive: true, originalPrice: '', salePrice: '',
    
    suitableFor: '', classTime: '',
  });

  const [courseContents, setCourseContents] = useState([{ title: '', lessons: '', problems: '' }]);
  const [coverImage, setCoverImage] = useState(null);
  const [sampleVideo, setSampleVideo] = useState(null);

  
  const [instructors, setInstructors] = useState([{ name: '', image: null, previewUrl: '' }]);

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:3000/courses/${id}`).then((res) => {
        const course = res.data;
        setFormData({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
          isActive: course.isActive === true || String(course.isActive) === "true" || course.isActive === 1,
          originalPrice: course.originalPrice || '',
          salePrice: course.salePrice || '',
          suitableFor: course.suitableFor || '',
          classTime: course.classTime || '',
        });

        if (course.courseContents) {
          const contents = typeof course.courseContents === 'string' ? JSON.parse(course.courseContents) : course.courseContents;
          setCourseContents(contents);
        }

       
        if (course.instructors && Array.isArray(course.instructors)) {
          setInstructors(course.instructors.map(inst => ({
            name: inst.name || '',
            image: null,
            previewUrl: inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : ''
          })));
        } else if (course.instructorName) {
          
          setInstructors([{ 
            name: course.instructorName, 
            image: null, 
            previewUrl: course.instructorImageUrl ? `http://localhost:3000${course.instructorImageUrl}` : '' 
          }]);
        }
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

    data.append('courseContents', JSON.stringify(courseContents));

    if (coverImage) data.append('coverImage', coverImage);
    if (sampleVideo) data.append('sampleVideo', sampleVideo);

   
    instructors.forEach((inst) => {
      data.append('instructorNames', inst.name); 
      if (inst.image) {
        data.append('instructorImages', inst.image); 
      }
    });

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
        {isEditMode ? ' แก้ไขคอร์สเรียน' : ' เพิ่มคอร์สเรียนใหม่'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
      
        <div><label style={labelStyle}>ชื่อคอร์ส:</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} /></div>
        <div><label style={labelStyle}>รายละเอียดสั้น:</label><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} /></div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>ราคาเดิม:</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required style={inputStyle} /></div>
          <div style={{ flex: 1 }}><label style={{ ...labelStyle, color: '#F2984A' }}>ราคาขาย:</label><input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} required style={{ ...inputStyle, border: '1px solid #F2984A' }} /></div>
        </div>

       
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>รูปภาพปก:</label>
            <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>วิดีโอตัวอย่าง (ถ้ามี):</label>
            <input type="file" onChange={(e) => setSampleVideo(e.target.files[0])} accept="video/*" style={{ width: '100%' }} />
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
        
       
        <div>
          <label style={labelStyle}>รายชื่อครูผู้สอน:</label>
          {instructors.map((inst, index) => (
            <div key={index} style={{ display: 'flex', gap: '15px', background: '#fcfcfc', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #eee', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" placeholder={`ชื่อครูคนที่ ${index + 1}`}
                  value={inst.name} 
                  onChange={(e) => {
                    const newItems = [...instructors];
                    newItems[index].name = e.target.value;
                    setInstructors(newItems);
                  }}
                  required
                  style={{ ...inputStyle, marginBottom: '10px' }} 
                />
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => {
                    const newItems = [...instructors];
                    newItems[index].image = e.target.files[0];
                    setInstructors(newItems);
                  }}
                />
              </div>

              
              {inst.previewUrl && !inst.image && (
                <img src={inst.previewUrl} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              )}

             
              {instructors.length > 1 && (
                <button type="button" onClick={() => setInstructors(instructors.filter((_, i) => i !== index))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: '10px' }}>
                  ลบ
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setInstructors([...instructors, { name: '', image: null, previewUrl: '' }])} style={{ padding: '8px 12px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
            + เพิ่มครูผู้สอน
          </button>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

       
        
       
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>เหมาะสำหรับ:</label><input type="text" name="suitableFor" value={formData.suitableFor} onChange={handleChange} placeholder="เช่น นักเรียน ม.4-6" style={inputStyle} /></div>
          <div style={{ flex: 1 }}><label style={labelStyle}> เวลาเรียน:</label><input type="text" name="classTime" value={formData.classTime} onChange={handleChange} placeholder="เช่น เสาร์-อาทิตย์ 09:00-12:00" style={inputStyle} /></div>
        </div>

        <div>
          <label style={labelStyle}> รายละเอียดคอร์สย่อย:</label>
          {courseContents.map((item, index) => (
            <div key={index} style={{ background: '#fcfcfc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee' }}>
              <input type="text" placeholder={`ชื่อคอร์สที่ (${index + 1}.)`} value={item.title} onChange={(e) => { const newItems = [...courseContents]; newItems[index].title = e.target.value; setCourseContents(newItems); }} style={{ ...inputStyle, marginBottom: '10px' }} />
              <textarea placeholder="บทที่สอน (เช่น บทที่ 1, บทที่ 2)" value={item.lessons} onChange={(e) => { const newItems = [...courseContents]; newItems[index].lessons = e.target.value; setCourseContents(newItems); }} style={{ ...inputStyle, height: '60px', marginBottom: '10px' }} />
              <input type="text" placeholder="โจทย์ที่พาลุย :" value={item.problems} onChange={(e) => { const newItems = [...courseContents]; newItems[index].problems = e.target.value; setCourseContents(newItems); }} style={inputStyle} />
              {courseContents.length > 1 && (<button type="button" onClick={() => setCourseContents(courseContents.filter((_, i) => i !== index))} style={{ color: 'red', marginTop: '10px', border: 'none', background: 'none', cursor: 'pointer' }}>ลบรายการนี้</button>)}
            </div>
          ))}
          <button type="button" onClick={() => setCourseContents([...courseContents, { title: '', lessons: '', problems: '' }])} style={{ padding: '8px 12px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>+ เพิ่มคอร์สย่อย</button>
        </div>

        <div style={{ marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#003366', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '10px', width: '18px', height: '18px' }} /> เปิดใช้งานคอร์สนี้ (Active)
          </label>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
          <button type="submit" style={{ flex: 2, padding: '12px', background: '#F2984A', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' }}>บันทึกข้อมูล</button>
          <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '12px', background: '#e9ecef', color: '#003366', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}