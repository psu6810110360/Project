import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OurStudentManagement.css";

function OurStudentManagement() {
  const [students, setStudents] = useState([]);
  
  // 1. เปลี่ยนชื่อตัวแปรให้ตรงกับ Backend DTO
  const [form, setForm] = useState({
    name: "",
    course: "",
    description: "", // เปลี่ยนจาก review เป็น description
    imageUrl: "",    // เปลี่ยนจาก image เป็น imageUrl
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/students");
      setStudents(response.data);
    } catch (error) {
      console.error("ดึงข้อมูลล้มเหลว:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.name || !form.course) return alert("กรอกข้อมูลให้ครบ (ชื่อและคอร์ส)");

    try {
      await axios.post("http://localhost:3000/students", form);
      // รีเซ็ตฟอร์ม (อัปเดตชื่อให้ตรงกัน)
      setForm({ name: "", course: "", description: "", imageUrl: "" });
      fetchStudents(); 
    } catch (error) {
      console.error("เพิ่มข้อมูลล้มเหลว:", error);
      alert("ไม่สามารถเพิ่มข้อมูลได้ ลองตรวจสอบ Backend");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันการลบข้อมูล?")) {
      try {
        await axios.delete(`http://localhost:3000/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error("ลบข้อมูลล้มเหลว:", error);
      }
    }
  };

  const handleEdit = async (id) => {
    const studentToEdit = students.find((s) => s.id === id);
    const newName = prompt("แก้ไขชื่อ:", studentToEdit.name);
    const newCourse = prompt("แก้ไขคอร์ส:", studentToEdit.course);

    if (newName && newCourse) {
      try {
        await axios.patch(`http://localhost:3000/students/${id}`, {
          name: newName,
          course: newCourse,
        });
        fetchStudents();
      } catch (error) {
        console.error("แก้ไขข้อมูลล้มเหลว:", error);
      }
    }
  };

  return (
    <div className="container">
      <h2 className="title">จัดการนักเรียนของเรา</h2>

      <div className="form-card">
        <input type="text" name="name" placeholder="ชื่อ-นามสกุล" value={form.name} onChange={handleChange} />
        <input type="text" name="course" placeholder="คอร์สที่เรียน" value={form.course} onChange={handleChange} />
        
        {/* 2. เปลี่ยน name="description" และ value={form.description} */}
        <textarea name="description" placeholder="คำรีวิวจากน้องๆ" value={form.description} onChange={handleChange} />
        
        {/* 3. เปลี่ยน name="imageUrl" และ value={form.imageUrl} */}
        <input type="text" name="imageUrl" placeholder="URL รูปภาพ" value={form.imageUrl} onChange={handleChange} />
        
        <button className="add-btn" onClick={handleAdd}>เพิ่มนักเรียน</button>
      </div>

      <hr />

      <table className="student-table">
        {/* ... ส่วน Thead เขียนเหมือนเดิม ... */}
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.course}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(s.id)}>แก้ไข</button>
                <button className="delete-btn" onClick={() => handleDelete(s.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OurStudentManagement;