// src/components/Certificate.jsx
import React from 'react';

const Certificate = React.forwardRef(({ studentName, courseName, date }, ref) => {
  // สุ่มเลข Certificate No.
  const certId = `SSP-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
      <div 
        ref={ref} 
        style={{
          width: '800px',
          height: '600px',
          backgroundColor: '#ffffff',
          fontFamily: "'Sarabun', 'Prompt', sans-serif",
          position: 'relative',
          boxSizing: 'border-box',
          padding: '20px', // ลดระยะขอบนอกลงเพื่อไม่ให้เบียดกรอบใน
          color: '#333'
        }}
      >
        {/* กรอบสีส้มหนา */}
        <div style={{
          border: '8px solid #f26522', 
          height: '100%',
          boxSizing: 'border-box',
          padding: '4px'
        }}>
          {/* กรอบเส้นบางด้านใน */}
          <div style={{
            border: '1px solid #f26522',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            padding: '40px 50px 15px 50px' // ปรับลด padding ด้านล่าง ป้องกันการล้น
          }}>

            {/* เลข No. มุมขวาบน */}
            <div style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '12px', color: '#555' }}>
              No: {certId}
            </div>

            {/* ส่วนหัว CERTIFICATE */}
            <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#1a365d', letterSpacing: '2px', margin: '0 0 5px 0' }}>
              CERTIFICATE
            </h1>
            <h2 style={{ fontSize: '20px', color: '#718096', letterSpacing: '3px', margin: '0 0 25px 0', fontWeight: '600' }}>
              OF COMPLETION
            </h2>
            
            <p style={{ fontSize: '16px', color: '#4a5568', margin: '0 0 10px 0' }}>
              ใบประกาศนียบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
            </p>

            {/* ชื่อผู้เรียน */}
            <h2 style={{ 
              fontSize: '36px', 
              color: '#f26522', 
              margin: '0 0 20px 0', 
              fontWeight: 'bold', 
              fontStyle: 'italic',
              borderBottom: '1px solid #cbd5e1', 
              paddingBottom: '10px', 
              minWidth: '70%',
              textAlign: 'center'
            }}>
              {studentName || 'ไม่ระบุชื่อผู้เรียน'} 
            </h2>
            
            <p style={{ fontSize: '16px', color: '#4a5568', margin: '0 0 10px 0' }}>
              ได้ผ่านการเรียนคอร์สออนไลน์เรื่อง
            </p>

            {/* ชื่อคอร์สเรียน */}
            <h3 style={{ fontSize: '28px', color: '#1a202c', margin: '0 0 30px 0', fontWeight: 'bold' }}>
              {courseName || 'ไม่ระบุชื่อคอร์ส'}
            </h3>
            
            {/* ส่วนลายเซ็นและวันที่ ด้านล่าง */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', alignItems: 'flex-end', paddingBottom: '5px' }}>
              
              {/* ซ้าย: ลายเซ็นผู้สอน */}
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ 
                  fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
                  fontSize: '32px', 
                  color: '#1a202c', 
                  borderBottom: '1px solid #000', 
                  paddingBottom: '5px', 
                  marginBottom: '5px' 
                }}>
                  Smart Science Pro
                </div>
                {/* ลบชื่อนายสมศักดิ์ออกไปแล้ว */}
                <p style={{ fontSize: '14px', margin: '0', color: '#718096' }}>Director, Smart Science Pro</p>
              </div>

              {/* กลาง: โลโก้ */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '500', color: '#1a365d', fontSize: '12px', lineHeight: '1' }}>
                  Smart<br/>Science<br/><span style={{ color: '#1a365d' }}>Pro</span>
                </div>
              </div>

              {/* ขวา: วันที่ */}
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1a202c', 
                  borderBottom: '1px solid #000', 
                  paddingBottom: '5px', 
                  marginBottom: '5px' 
                }}>
                  {date || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <p style={{ fontSize: '14px', margin: '0', color: '#4a5568' }}>วันที่สำเร็จการศึกษา</p>
              </div>

            </div>

            {/* ข้อความสงวนสิทธิ์ จัดไว้ใน flow ปกติ ไม่ให้ล้นกรอบ */}
            <div style={{ width: '100%', textAlign: 'left', fontSize: '10px', color: '#a0aec0', marginTop: '15px' }}>
              © {new Date().getFullYear()} Smart Science Pro. All Rights Reserved.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

export default Certificate;