// OurStudentManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OurStudentManagement.css";

function OurStudentManagement() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  
  // เพิ่ม State สำหรับจัดการ Modal ยืนยันการลบ
  const [itemToDelete, setItemToDelete] = useState(null);

  const [form, setForm] = useState({
    name: "",
    course: "",
    description: "", 
    imageUrl: "", 
    university: "", 
    faculty: "",
    logoUrl: "",
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

  const showToastMessage = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast({ msg: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.course) {
      showToastMessage("⚠️ กรุณากรอกชื่อและคอร์สให้ครบถ้วนครับ", "error");
      return; 
    }

    try {
      if (editingId) {
        await axios.patch(`http://localhost:3000/students/${editingId}`, form);
        showToastMessage("อัปเดตข้อมูลสำเร็จ! 🎉", "success");
      } else {
        await axios.post("http://localhost:3000/students", form);
        showToastMessage("เพิ่มข้อมูลนักเรียนใหม่สำเร็จ! 🎉", "success");
      }
      
      setForm({ name: "", course: "", description: "", imageUrl: "", university: "", faculty: "", logoUrl: "" });
      setEditingId(null);
      fetchStudents(); 
    } catch (error) {
      console.error("บันทึกข้อมูลล้มเหลว:", error);
      showToastMessage("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", "error");
    }
  };

  // --- ระบบลบแบบใหม่ ไม่พึ่งเบราว์เซอร์ ---
  const handleDeleteClick = (id) => {
    setItemToDelete(id); // เปิด Modal
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`http://localhost:3000/students/${itemToDelete}`);
      showToastMessage("ลบข้อมูลสำเร็จ! 🗑️", "success");
      fetchStudents();
    } catch (error) {
      console.error("ลบข้อมูลล้มเหลว:", error);
      showToastMessage("❌ ลบข้อมูลไม่สำเร็จ", "error");
    }
    setItemToDelete(null); // ลบเสร็จ ปิด Modal
  };

  const cancelDelete = () => {
    setItemToDelete(null); // ยกเลิก ปิด Modal
  };
  // ------------------------------------

  const handleEditClick = (student) => {
    setForm({
      name: student.name || "",
      course: student.course || "",
      description: student.description || "",
      imageUrl: student.imageUrl || "",
      university: student.university || "",
      faculty: student.faculty || "",
      logoUrl: student.logoUrl || ""
    });
    setEditingId(student.id); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const handleCancelEdit = () => {
    setForm({ name: "", course: "", description: "", imageUrl: "", university: "", faculty: "", logoUrl: "" });
    setEditingId(null);
  };

  return (
    <div className="container">
      <h2 className="title">จัดการนักเรียนของเรา</h2>

      <div className="form-card">
        {toast.msg && (
          <div className={`toast-message ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.msg}
          </div>
        )}

        {editingId && <div style={{ color: "orange", marginBottom: "10px", fontWeight: "bold" }}>กำลังแก้ไขข้อมูลน้อง: {form.name}</div>}
        
        <input type="text" name="name" placeholder="ชื่อ-นามสกุล" value={form.name} onChange={handleChange} />
        <input type="text" name="course" placeholder="คอร์สที่เรียน" value={form.course} onChange={handleChange} />
        <input type="text" name="university" placeholder="สอบติดมหาวิทยาลัย (เช่น จุฬาฯ, มหิดล)" value={form.university} onChange={handleChange} />
        <input type="text" name="faculty" placeholder="คณะ/สาขา (เช่น แพทยศาสตร์)" value={form.faculty} onChange={handleChange} />
        <input type="text" name="logoUrl" placeholder="URL โลโก้มหาวิทยาลัย (ถ้ามี)" value={form.logoUrl} onChange={handleChange} />
        <textarea name="description" placeholder="คำรีวิวจากน้องๆ" value={form.description} onChange={handleChange} />
        <input type="text" name="imageUrl" placeholder="URL รูปภาพน้องๆ" value={form.imageUrl} onChange={handleChange} />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="add-btn" onClick={handleSubmit} style={{ flex: 1, backgroundColor: editingId ? "#ffcc00" : "", color: editingId ? "#003366" : "" }}>
            {editingId ? "บันทึกการแก้ไข" : "เพิ่มนักเรียน"}
          </button>
          
          {editingId && (
            <button className="add-btn" onClick={handleCancelEdit} style={{ flex: 1, backgroundColor: "#ccc", color: "#333" }}>
              ยกเลิก
            </button>
          )}
        </div>
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
                <button className="edit-btn" onClick={() => handleEditClick(s)}>แก้ไข</button>
                {/* เปลี่ยนมาเรียกฟังก์ชันเปิด Modal แทน */}
                <button className="delete-btn" onClick={() => handleDeleteClick(s.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- โค้ดส่วนที่เป็น Modal ยืนยันการลบแบบ Custom --- */}
      {itemToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>ยืนยันการลบข้อมูล?</h3>
            <p>คุณแน่ใจหรือไม่ที่จะลบข้อมูลนักเรียนคนนี้? เมื่อลบแล้วจะไม่สามารถกู้คืนได้</p>
            <div className="modal-btn-group">
              <button className="modal-btn confirm" onClick={confirmDelete}>ใช่, ลบเลย</button>
              <button className="modal-btn cancel" onClick={cancelDelete}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------ */}

    </div>
  );
}

export default OurStudentManagement;