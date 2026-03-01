import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [courseType, setCourseType] = useState('VOD'); 

  
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const daysList = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  const [vodDuration, setVodDuration] = useState('');

  const [formData, setFormData] = useState({
    title: '', shortDescription: '', isActive: true, originalPrice: '', salePrice: '', suitableFor: ''
  });

  const [courseContents, setCourseContents] = useState([{ title: '', lessons: '', problems: '' }]);
  const [coverImage, setCoverImage] = useState(null);
  const [sampleVideo, setSampleVideo] = useState(null);
  
 
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState([]);
  
  
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateThai = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  useEffect(() => {
    axios.get('http://localhost:3000/instructors')
      .then(res => setAvailableInstructors(res.data))
      .catch(err => console.error("ดึงข้อมูลครูไม่สำเร็จ", err));

    if (isEditMode) {
      axios.get(`http://localhost:3000/courses/${id}`).then((res) => {
        const course = res.data;
        
        let loadedCourseType = 'VOD';
        let loadedClassTime = course.classTime || '';
        
        if (loadedClassTime && !loadedClassTime.includes('คลิป') && !loadedClassTime.includes('24 ชม.')) {
           loadedCourseType = 'LIVE';
          
           try {
             let timePart = loadedClassTime;
             if (loadedClassTime.includes(' | ')) {
               const mainParts = loadedClassTime.split(' | ');
               timePart = mainParts[1]; 
             }

             if (timePart.includes('(')) {
               const parts = timePart.split(' (');
               const days = parts[0].split(', ');
               const times = parts[1].replace(')', '').split(' - ');
               setSelectedDays(days);
               setStartTime(times[0]);
               setEndTime(times[1]);
             }
           } catch(e) { console.log('แกะข้อมูลเวลาไม่ได้', e); }
        } else {
           loadedCourseType = 'VOD';
          
           if (loadedClassTime && loadedClassTime.includes('รวม')) {
             const match = loadedClassTime.match(/รวม (.*?) ชั่วโมง/);
             if (match && match[1]) {
               setVodDuration(match[1]);
             }
           }
        }
        setCourseType(loadedCourseType);

        setFormData({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
          isActive: course.isActive === true || String(course.isActive) === "true" || course.isActive === 1,
          originalPrice: course.originalPrice || '',
          salePrice: course.salePrice || '',
          suitableFor: course.suitableFor || '',
        });

        if (course.courseContents) {
          const contents = typeof course.courseContents === 'string' ? JSON.parse(course.courseContents) : course.courseContents;
          setCourseContents(contents);
        }

        if (course.instructors && Array.isArray(course.instructors)) {
          setSelectedInstructorIds(course.instructors.map(inst => inst.id));
        }
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDayClick = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    let finalClassTime = '';
    
    if (courseType === 'VOD') {
      finalClassTime = `เรียนออนไลน์ด้วยคลิป (ดูได้ตลอด 24 ชม.)${vodDuration ? ` รวม ${vodDuration} ชั่วโมง` : ''}`;
    } else {
      if (selectedDays.length === 0) {
        alert('กรุณาเลือกวันที่เรียนอย่างน้อย 1 วันครับ');
        return; 
      }
      
      let dateRangeText = '';
      if (startDate && endDate) {
        dateRangeText = `${formatDateThai(startDate)} - ${formatDateThai(endDate)} | `;
      }
      
      finalClassTime = `${dateRangeText}${selectedDays.join(', ')} (${startTime} - ${endTime})`;
    }

    Object.keys(formData).forEach(key => {
      if (key === 'isActive') {
        data.append('isActive', formData.isActive ? 'true' : 'false');
      } else {
        data.append(key, formData[key]);
      }
    });

    data.append('classTime', finalClassTime);
    data.append('courseContents', JSON.stringify(courseContents));

    if (coverImage) data.append('coverImage', coverImage);
    if (sampleVideo) data.append('sampleVideo', sampleVideo);

    data.append('instructorIds', JSON.stringify(selectedInstructorIds));

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

  
  const filteredInstructors = availableInstructors.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outlineColor: '#003366', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '8px', color: '#003366', display: 'block' };

  return (
    <div style={{ maxWidth: '650px', background: '#FFFFFF', border: 'none', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', margin: '0 auto' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px', marginTop: 0 }}>
        {isEditMode ? ' แก้ไขคอร์สเรียน' : ' เพิ่มคอร์สเรียนใหม่'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ background: '#f4f7f6', padding: '20px', borderRadius: '8px', border: '2px solid #003366' }}>
          <label style={{ ...labelStyle, fontSize: '16px' }}>รูปแบบคอร์สเรียนหลัก:</label>
          <select 
            value={courseType} 
            onChange={(e) => setCourseType(e.target.value)} 
            style={{ ...inputStyle, fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="VOD">เรียนด้วยคลิปวิดีโอ (ดูได้ตลอด 24 ชม.)</option>
            <option value="LIVE">เรียนสด Online / เรียนรอบสด (กำหนดเวลา)</option>
          </select>
        </div>

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
          <label style={labelStyle}>เลือกครูผู้สอนประจำคอร์สนี้ (เลือกได้หลายคน):</label>
          
          <div style={{ padding: '15px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px' }}>
           
            <input 
              type="text" 
              placeholder="🔍 ค้นหาชื่อครู..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, marginBottom: '15px', borderRadius: '20px', padding: '10px 15px' }}
            />

            <div style={{ 
              display: 'flex', gap: '15px', flexWrap: 'wrap',
              maxHeight: '220px', 
              overflowY: 'auto',  
              paddingBottom: '10px'
            }}>
            
              {filteredInstructors.map(inst => (
                <div 
                  key={inst.id} 
                  onClick={() => {
                    setSelectedInstructorIds(prev => 
                      prev.includes(inst.id) ? prev.filter(id => id !== inst.id) : [...prev, inst.id]
                    )
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', 
                    borderRadius: '30px', cursor: 'pointer', transition: '0.2s',
                    border: selectedInstructorIds.includes(inst.id) ? '2px solid #F2984A' : '1px solid #ccc',
                    background: selectedInstructorIds.includes(inst.id) ? '#fff8f0' : '#fff',
                    height: 'fit-content'
                  }}
                >
                  <img 
                    src={inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : 'https://via.placeholder.com/40'} 
                    alt={inst.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ fontWeight: selectedInstructorIds.includes(inst.id) ? 'bold' : 'normal', color: '#003366' }}>
                    {inst.name}
                  </span>
                  {selectedInstructorIds.includes(inst.id) && <span style={{ color: '#F2984A' }}>✔</span>}
                </div>
              ))}

              
              {availableInstructors.length > 0 && filteredInstructors.length === 0 && (
                <span style={{ color: '#888', fontSize: '14px', width: '100%', textAlign: 'center', marginTop: '10px' }}>
                  ไม่พบชื่อครูที่คุณค้นหา
                </span>
              )}

            
              {availableInstructors.length === 0 && (
                <span style={{ color: 'red', fontSize: '14px', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                  ยังไม่มีข้อมูลครูในระบบ กรุณาเพิ่มประวัติครูก่อน
                </span>
              )}
            </div>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>เหมาะสำหรับ (เช่น นักเรียน ม.4-6):</label>
            <input type="text" name="suitableFor" value={formData.suitableFor} onChange={handleChange} style={inputStyle} />
          </div>
          
          {courseType === 'VOD' && (
            <div style={{ flex: 1 }}>
               <label style={labelStyle}>เวลาเรียนทั้งหมด (ชั่วโมง):</label>
               <input 
                 type="number" 
                 value={vodDuration} 
                 onChange={(e) => setVodDuration(e.target.value)} 
                 placeholder="เช่น 15 (ใส่แค่ตัวเลข)" 
                 style={inputStyle} 
                 min="1"
               />
            </div>
          )}
        </div>
          
        {courseType === 'LIVE' && (
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            
            <label style={labelStyle}> ระยะเวลาของคอร์สเรียน (เริ่ม - สิ้นสุด):</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
              <span style={{ fontWeight: 'bold', color: '#555' }}>ถึง</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={inputStyle} />
            </div>

            <label style={labelStyle}> เลือกวันที่เรียน (ในแต่ละสัปดาห์):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
              {daysList.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  style={{
                    padding: '8px 15px', border: '1px solid #003366', borderRadius: '20px', cursor: 'pointer',
                    background: selectedDays.includes(day) ? '#003366' : '#fff',
                    color: selectedDays.includes(day) ? '#fff' : '#003366',
                    fontWeight: selectedDays.includes(day) ? 'bold' : 'normal',
                    transition: '0.2s'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            <label style={labelStyle}> เลือกเวลาเรียน:</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={inputStyle} />
              <span style={{ fontWeight: 'bold', color: '#555' }}>ถึง</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={inputStyle} />
            </div>
          </div>
        )}

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