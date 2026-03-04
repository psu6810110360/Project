import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OurStudents.css';

function OurStudents() {
  // 1. สร้าง State มารับข้อมูลจาก Backend
  const [students, setStudents] = useState([]);

  // 2. ใช้ useEffect ดึงข้อมูลตอนเปิดหน้าเว็บ
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // ยิง API ไปที่ NestJS พอร์ต 3000
        const response = await axios.get('http://localhost:3000/students'); 
        setStudents(response.data);
      } catch (error) {
        console.error("ดึงข้อมูลนักเรียนล้มเหลว:", error);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="students-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className="student-image">
              {/* เปลี่ยนจาก student.image เป็น student.imageUrl */}
              <img src={student.imageUrl || "https://via.placeholder.com/150"} alt={student.name} />
            </div>
            <div className="student-info">
              <h3>{student.name}</h3>
              <span className="course-tag">{student.course}</span>
              {/* เปลี่ยนจาก student.review เป็น student.description */}
              <p className="review-text">"{student.description}"</p> 
            </div>
          </div>
        ))}
      </div>
  );
}

export default OurStudents;