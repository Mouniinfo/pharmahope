import React, { useEffect, useState } from "react";
import "./style.css";

// === صفحة رسائل التواصل للإدارة ===
function AdminMessages() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/api/contact")
      .then(res => res.json())
      .then(setMessages);
  }, []);
  return (
    <table>
      <thead>
        <tr>
          <th>الاسم</th><th>الإيميل</th><th>الرسالة</th><th>تاريخ الإرسال</th>
        </tr>
      </thead>
      <tbody>
        {messages.map(msg =>
          <tr key={msg._id}>
            <td>{msg.name}</td>
            <td>{msg.email}</td>
            <td style={{textAlign:'right'}}>{msg.message}</td>
            <td>{new Date(msg.createdAt).toLocaleString()}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// === إدارة المسؤولين ===
function AdminsManager() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/admins")
      .then(res => res.json())
      .then(setAdmins);
  }, [success]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("http://localhost:4000/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdmin)
    });
    if (res.ok) {
      setSuccess("تم إضافة المسؤول بنجاح");
      setNewAdmin({ username: "", password: "" });
    } else {
      const data = await res.json();
      setError(data.error || "خطأ!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف المسؤول؟")) return;
    const res = await fetch(`http://localhost:4000/api/admins/${id}`, { method: "DELETE" });
    if (res.ok) setSuccess("تم حذف المسؤول");
    else setError("خطأ أثناء الحذف");
  };

  const handleStartEdit = (adm) => {
    setEditId(adm._id);
    setEditForm({ username: adm.username, password: "" });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch(`http://localhost:4000/api/admins/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      setEditId(null);
      setSuccess("تم التعديل بنجاح");
    } else {
      setError("خطأ أثناء التعديل");
    }
  };

  return (
    <div>
      <h2>إدارة المسؤولين</h2>
      <form onSubmit={handleAdd} className="form-row" style={{marginBottom: 20}}>
        <input placeholder="اسم المستخدم" value={newAdmin.username} onChange={e => setNewAdmin(a => ({...a, username: e.target.value}))} required />
        <input placeholder="كلمة المرور" type="password" value={newAdmin.password} onChange={e => setNewAdmin(a => ({...a, password: e.target.value}))} required />
        <button>إضافة مسؤول</button>
      </form>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <table>
        <thead>
          <tr>
            <th>اسم المستخدم</th>
            <th>تعديل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(adm =>
            <tr key={adm._id}>
              <td>
                {editId === adm._id ? (
                  <form onSubmit={handleEdit} style={{display:'flex',gap:5}}>
                    <input value={editForm.username} onChange={e => setEditForm(f => ({...f, username: e.target.value}))} required />
                    <input placeholder="كلمة مرور جديدة (اختياري)" type="password" value={editForm.password} onChange={e => setEditForm(f => ({...f, password: e.target.value}))} />
                    <button>حفظ</button>
                    <button type="button" onClick={()=>setEditId(null)}>إلغاء</button>
                  </form>
                ) : adm.username}
              </td>
              <td>
                {editId !== adm._id && (
                  <button onClick={()=>handleStartEdit(adm)}>تعديل</button>
                )}
              </td>
              <td>
                <button style={{background:"#eb2f06",color:"#fff"}}
                  onClick={()=>handleDelete(adm._id)}>حذف</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// === بطاقة الدواء والحجز ===
function DrugCard({ drug }) {
  const [showReserve, setShowReserve] = useState(false);
  const [msg, setMsg] = useState("");
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReserve = async (e) => {
    e.preventDefault();
    setMsg("");
    setPharmacy(null);
    setLoading(true);
    const form = e.target;
    const res = await fetch("http://localhost:4000/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: form.userName.value,
        phone: form.phone.value,
        drugId: drug._id
      })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPharmacy(data.pharmacy);
      setMsg("تم الحجز بنجاح! توجه إلى الصيدلية التالية:");
    } else {
      setMsg(data.error || "حدث خطأ أثناء الحجز");
    }
  };

  return (
    <div className="drug-card">
      <h3>{drug.name}</h3>
      <p>{drug.description}</p>
      <ul>
        {drug.pharmacies && drug.pharmacies.map((p, idx) => (
          <li key={idx}>
            <b>{p.name}</b> | {p.address} | الكمية: {p.quantity}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowReserve(r => !r)}>
        {showReserve ? "إلغاء" : "حجز الدواء"}
      </button>
      {showReserve && (
        <form onSubmit={handleReserve} className="form-col" style={{marginTop:10}}>
          <input name="userName" placeholder="اسمك الكامل" required />
          <input name="phone" placeholder="رقم الهاتف" required />
          <button type="submit" disabled={loading}>تأكيد الحجز</button>
        </form>
      )}
      {msg && <div style={{marginTop:8}}>{msg}</div>}
      {pharmacy && (
        <div className="pharmacy-info">
          <b>اسم الصيدلية:</b> {pharmacy.name}<br />
          <b>العنوان:</b> {pharmacy.address}<br />
          <b>رقم الهاتف:</b> {pharmacy.phone}
        </div>
      )}
    </div>
  );
}

// === قائمة الأدوية المستخدمين ===
function DrugsList() {
  const [drugs, setDrugs] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/api/drugs")
      .then(r => r.json())
      .then(setDrugs);
  }, []);
  return (
    <div>
      <h2>قائمة الأدوية المتوفرة</h2>
      <div style={{display:"flex", flexWrap:"wrap", gap:20}}>
        {drugs.map(drug => (
          <DrugCard key={drug._id} drug={drug} />
        ))}
      </div>
    </div>
  );
}

// === تطبيق رئيسي ===
function App() {
  const [page, setPage] = useState("drugs");
  const [adminLogged, setAdminLogged] = useState(
    localStorage.getItem("pharma_admin") === "yes"
  );
  const [loginError, setLoginError] = useState("");

  const handleLogout = () => {
    setAdminLogged(false);
    localStorage.removeItem("pharma_admin");
    setPage("drugs");
  };

  // --- تواصل معنا ---
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");
  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = async e => {
    e.preventDefault();
    setContactError("");
    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error("خطأ في الإرسال");
      setContactSent(true);
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactSent(false), 3000);
    } catch (err) {
      setContactError("حدث خطأ أثناء الإرسال. حاول مجدداً.");
    }
  };

  // --- تسجيل دخول الإدارة ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const user = e.target.username.value;
    const pass = e.target.password.value;
    setLoginError("");
    try {
      const res = await fetch("http://localhost:4000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });
      if (!res.ok) {
        setLoginError("بيانات الدخول غير صحيحة!");
        return;
      }
      setAdminLogged(true);
      localStorage.setItem("pharma_admin", "yes");
      setPage("admin-messages");
    } catch {
      setLoginError("حدث خطأ في الاتصال بالخادم");
    }
  };

  return (
    <div className="container">
      <h1>PharmaHope</h1>
      <nav>
        <button onClick={() => setPage("drugs")} className={page === "drugs" ? "active" : ""}>الأدوية المتوفرة</button>
        <button onClick={() => setPage("contact")} className={page === "contact" ? "active" : ""}>تواصل معنا</button>
        <button onClick={() => setPage("admin-messages")}>رسائل التواصل</button>
        <button onClick={() => setPage("admins-manager")}>إدارة المسؤولين</button>
        {adminLogged && (
          <button onClick={handleLogout} style={{ float: "left", background: "#eb2f06", color: "#fff" }}>
            تسجيل الخروج
          </button>
        )}
      </nav>
      {/* صفحة تسجيل الدخول للإدارة */}
      {page === "admin-messages" && !adminLogged && (
        <section className="login-section">
          <h2>تسجيل دخول الإدارة</h2>
          <form onSubmit={handleLogin} className="form-col">
            <input name="username" placeholder="اسم المستخدم" autoFocus required />
            <input name="password" type="password" placeholder="كلمة المرور" required />
            <button type="submit">دخول</button>
          </form>
          {loginError && <div className="error-msg">{loginError}</div>}
        </section>
      )}
      {/* صفحة رسائل الإدارة (محمية) */}
      {page === "admin-messages" && adminLogged && (
        <section className="contact-section">
          <h2>جميع رسائل التواصل</h2>
          <AdminMessages />
        </section>
      )}

      {page === "drugs" && (
        <DrugsList />
      )}

      {page === "contact" && (
        <section className="contact-section">
          <h2>تواصل معنا</h2>
          <p>لأي استفسار أو اقتراح أو رغبة في التطوع، يرجى تعبئة النموذج التالي:</p>
          <form onSubmit={handleContactSubmit} className="form-col">
            <input name="name" placeholder="اسمك" value={contactForm.name} onChange={handleContactChange} required />
            <input name="email" type="email" placeholder="البريد الإلكتروني" value={contactForm.email} onChange={handleContactChange} required />
            <textarea name="message" placeholder="رسالتك" value={contactForm.message} onChange={handleContactChange} rows={4} required />
            <button type="submit">إرسال</button>
          </form>
          {contactSent && <div className="success-msg">تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.</div>}
          {contactError && <div className="error-msg">{contactError}</div>}
        </section>
      )}

      {page === "admins-manager" && adminLogged && <AdminsManager />}

      <footer>
        &copy; {new Date().getFullYear()} PharmaHope. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default App;