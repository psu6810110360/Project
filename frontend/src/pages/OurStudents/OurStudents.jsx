    // OurStudents.jsx
import React from 'react';
import './OurStudents.css';

// สมมติข้อมูลนักเรียน (ในอนาคตเปลี่ยนเป็นดึงจาก API ได้)
const students = [
  {
    id: 1,
    name: "น้องเอ นามสมมติ",
    course: "ฟิสิกส์ ม.4",
    review: "เรียนที่นี่แล้วเข้าใจง่ายขึ้นเยอะเลยครับ จากที่เคยกลัวฟิสิกส์ ตอนนี้ทำโจทย์ได้คล่องมาก!",
    image: "https://via.placeholder.com/150" // เปลี่ยนเป็นรูปน้องๆ จริงๆ
  },
  {
    id: 2,
    name: "น้องบี เรียนดี",
    course: "เคมีพื้นฐาน",
    review: "เนื้อหาเข้มข้นแต่ไม่น่าเบื่อ พี่ๆ ติวเตอร์ใส่ใจตอบคำถามตลอดเลยค่ะ แนะนำเลย!",
    image: "https://via.placeholder.com/150"
  },
  {
    id: 3,
    name: "น้องซี มีชัย",
    course: "เตรียมสอบเข้า ม.1",
    review: "สอบติดโรงเรียนที่หวังไว้แล้วครับ ขอบคุณ SmartSciencePro ที่ช่วยติวเข้มให้",
    image: "https://via.placeholder.com/150"
  }
];

function OurStudents() {
  return (
    <div className="students-container">
      <header className="students-header">
        <h1>ความสำเร็จของนักเรียนของเรา</h1>
        <p>ความภูมิใจและความสำเร็จของน้องๆ ที่ไว้วางใจเรียนกับ SmartSciencePro</p>
      </header>

      <div className="students-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className="student-image">
              <img src={student.image} alt={student.name} />
            </div>
            <div className="student-info">
              <h3>{student.name}</h3>
              <span className="course-tag">{student.course}</span>
              <p className="review-text">"{student.review}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OurStudents;