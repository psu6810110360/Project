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

      {/* จัดเรียงเป็น Grid */}
      <div className="students-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            
            {/* ส่วนหัวของการ์ด (รูป + ชื่อ + คอร์ส) */}
            <div className="card-header">
              <img 
                src={student.imageUrl || "https://via.placeholder.com/150"} 
                alt={student.name} 
                className="student-avatar"
              />
              <div className="student-info">
                <h3>{student.name}</h3>
                <span className="course-badge">คอร์ส: {student.course}</span>
              </div>
            </div>

            {/* ส่วนเนื้อหาของการ์ด (คำรีวิว และ ผลงาน) */}
            <div className="card-body">
              
              {/* ตรวจสอบว่ามีข้อมูลมหาลัย/คณะไหม ถ้ามีให้แสดง */}
              {(student.university || student.faculty) && (
                <div className="achievement-box">
                  <span className="achievement-icon">🎓</span>
                  <div>
                    <strong>สอบติด:</strong> {student.faculty} {student.university}
                  </div>
                </div>
              )}

              <p className="review-text">"{student.description}"</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default OurStudents;