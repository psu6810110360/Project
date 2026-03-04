import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurStudents.css';

function OurStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/students');
        setStudents(response.data);
      } catch (error) {
        console.error("ดึงข้อมูลนักเรียนล้มเหลว:", error);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="students-container">
      <header className="students-header">
        <h2>ความสำเร็จของนักเรียนของเรา</h2>
        <div className="header-line"></div>
        <p>ความภูมิใจและความสำเร็จของน้องๆ ที่ไว้วางใจเรียนกับ SmartSciencePro</p>
      </header>

      {/* เปลี่ยนมาใช้ Grid แบบการ์ดกว้าง */}
      <div className="students-grid-v2">
        {students.map((student) => (
          <div key={student.id} className="split-card">
            
            {/* ซีกซ้าย: รูปภาพนักเรียนและชื่อ */}
            <div className="card-left">
              <img 
                src={student.imageUrl || "https://via.placeholder.com/400x500"} 
                alt={student.name} 
              />
              <div className="image-overlay">
                <h3 className="overlay-name">น้อง {student.name}</h3>
                <span className="overlay-course">คอร์ส: {student.course}</span>
              </div>
            </div>

            {/* ซีกขวา: ข้อมูลมหาลัยและคำรีวิว */}
            <div className="card-right">
              
              {/* โลโก้มหาลัย (ตรวจสอบว่ามี Link URL ไหม ถ้ามีให้โชว์รูป ถ้าไม่มีให้โชว์ไอคอน) */}
              <div className="uni-logo-ring">
                {student.logoUrl ? (
                  <img src={student.logoUrl} alt="University Logo" className="uni-logo-image" />
                ) : (
                  <div className="uni-logo-inner">🎓</div>
                )}
              </div>

              {/* ข้อมูลสอบติด (จะแสดงก็ต่อเมื่อมีข้อมูลคณะหรือมหาลัย) */}
              {(student.university || student.faculty) && (
                <div className="admission-info">
                  <div className="faculty-highlight">
                    {student.faculty || "ไม่ระบุคณะ"}
                  </div>
                  <div className="university-name">
                    {student.university}
                  </div>
                </div>
              )}

              {/* คำรีวิว */}
              <p className="quote-text">“{student.description}”</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default OurStudents;