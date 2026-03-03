import React, { useState } from "react";
import "./OurStudentManagement.css";

function OurStudentManagement() {
  const [students, setStudents] = useState([
    { id: 1, name: "น้องเอ นามสมมติ", course: "ฟิสิกส์ ม.4", review: "สอนดีมากครับ", image: "" },
    { id: 2, name: "น้องบี เรียนดี", course: "เคมีพื้นฐาน", review: "เข้าใจง่ายสุดๆ", image: "" },
  ]);

  const [form, setForm] = useState({
    name: "",
    course: "",
    review: "",
    image: "",
  });

  const handleChange = (e) => {
    // ใช้ name จาก input ให้ตรงกับ key ใน state form
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name || !form.course) return alert("กรอกข้อมูลให้ครบ (ชื่อและคอร์ส)");

    const newStudent = {
      id: Date.now(),
      ...form, // เก็บข้อมูลครบทุก field (name, course, review, image)
    };

    setStudents([...students, newStudent]);
    // Reset ฟอร์มหลังจากเพิ่มเสร็จ
    setForm({ name: "", course: "", review: "", image: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("ยืนยันการลบข้อมูล?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleEdit = (id) => {
    const studentToEdit = students.find(s => s.id === id);
    const newName = prompt("แก้ไขชื่อ:", studentToEdit.name);
    const newCourse = prompt("แก้ไขคอร์ส:", studentToEdit.course);

    if (newName && newCourse) {
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, name: newName, course: newCourse } : s
        )
      );
    }
  };

  return (
    <div className="container">
      {/* หัวข้อที่มีขีดข้างหน้าตามรูป */}
      <h2 className="title">เพิ่มนักเรียนใหม่</h2>

      <div className="form-card">
        <input
          type="text"
          name="name" // สำคัญ: ต้องตรงกับ key ใน state
          placeholder="ชื่อ-นามสกุล"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="course"
          placeholder="คอร์สที่เรียน"
          value={form.course}
          onChange={handleChange}
        />

        <textarea
          name="review"
          placeholder="คำรีวิวจากน้องๆ"
          value={form.review}
          onChange={handleChange}
        />

        <input
          type="text"
          name="image"
          placeholder="URL รูปภาพ (หรืออัปโหลด)"
          value={form.image}
          onChange={handleChange}
        />

        <button className="add-btn" onClick={handleAdd}>
          เพิ่มนักเรียน
        </button>
      </div>

      <hr />

      <table className="student-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>ชื่อ</th>
            <th style={{ width: "30%" }}>คอร์ส</th>
            <th style={{ width: "30%" }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.course}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(s.id)}>
                  แก้ไข
                </button>
                <button className="delete-btn" onClick={() => handleDelete(s.id)}>
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OurStudentManagement;