import React, { useEffect, useState } from "react";
import "./style.css";

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

function AdminsManager() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // جلب المسؤولين
  useEffect(() => {
    fetch("http://localhost:4000/api/admins")
      .then(res => res.json())
      .then(setAdmins);
  }, [success]);

  // إضافة مسؤول
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

  // حذف مسؤول
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف المسؤول؟")) return;
    const res = await fetch(`http://localhost:4000/api/admins/${id}`, { method: "DELETE" });
    if (res.ok) setSuccess("تم حذف المسؤول");
    else setError("خطأ أثناء الحذف");
  };

  // بدء التعديل
  const handleStartEdit = (adm) => {
    setEditId(adm._id);
    setEditForm({ username: adm.username, password: "" });
  };

  // حفظ التعديل
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
        {drug.pharmacies.map((p, idx) => (
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

function App() {
  const [page, setPage] = useState("drugs");

  const [adminLogged, setAdminLogged] = useState(
    localStorage.getItem("pharma_admin") === "yes"
  );
  const [loginError, setLoginError] = useState("");

  // بيانات الدخول (يمكنك تغييرها لاحقاً)
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "123456";

   const handleLogout = () => {
    setAdminLogged(false);
    localStorage.removeItem("pharma_admin");
    setPage("drugs");
  };

// أدوية
  const [drugs, setDrugs] = useState([]);
  const [drugForm, setDrugForm] = useState({ name: "", quantity: "", donor: "", location: "" });
  const [editingDrug, setEditingDrug] = useState(null);
  const [drugSearch, setDrugSearch] = useState("");

  // أشخاص
  const [persons, setPersons] = useState([]);
  const [personForm, setPersonForm] = useState({ name: "", type: "donor", phone: "", address: "" });
  const [editingPerson, setEditingPerson] = useState(null);
  const [personSearch, setPersonSearch] = useState("");
  const [personTypeFilter, setPersonTypeFilter] = useState("");

  // جلب الأدوية
  useEffect(() => {
    if (page === "drugs") {
      const url = `http://localhost:4000/api/drugs${drugSearch ? `?search=${drugSearch}` : ""}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setDrugs(data))
        .catch(() => setDrugs([]));
    }
  }, [page, drugSearch]);

  // جلب الأشخاص
  useEffect(() => {
    if (page === "persons") {
      let url = `http://localhost:4000/api/persons?`;
      if (personSearch) url += `search=${personSearch}&`;
      if (personTypeFilter) url += `type=${personTypeFilter}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setPersons(data))
        .catch(() => setPersons([]));
    }
  }, [page, personSearch, personTypeFilter]);

  // --- أدوية ---
  const handleDrugChange = (e) => setDrugForm({ ...drugForm, [e.target.name]: e.target.value });
  const handleDrugSubmit = async (e) => {
    e.preventDefault();
    if (editingDrug) {
      await fetch(`http://localhost:4000/api/drugs/${editingDrug._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drugForm),
      });
      setEditingDrug(null);
    } else {
      await fetch("http://localhost:4000/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drugForm),
      });
    }
    setDrugForm({ name: "", quantity: "", donor: "", location: "" });
    setDrugSearch(""); // إعادة تحميل القائمة
    setPage("drugs");
  };
  const handleDrugEdit = (drug) => {
    setEditingDrug(drug);
    setDrugForm({ name: drug.name, quantity: drug.quantity, donor: drug.donor, location: drug.location });
  };
  const handleDrugDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await fetch(`http://localhost:4000/api/drugs/${id}`, { method: "DELETE" });
      setDrugSearch(""); // إعادة تحميل القائمة
    }
  };

  // --- أشخاص ---
  const handlePersonChange = (e) => setPersonForm({ ...personForm, [e.target.name]: e.target.value });
  const handlePersonSubmit = async (e) => {
    e.preventDefault();
    if (editingPerson) {
      await fetch(`http://localhost:4000/api/persons/${editingPerson._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personForm),
      });
      setEditingPerson(null);
    } else {
      await fetch("http://localhost:4000/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personForm),
      });
    }
    setPersonForm({ name: "", type: "donor", phone: "", address: "" });
    setPersonSearch(""); // إعادة تحميل القائمة
    setPage("persons");
  };
  const handlePersonEdit = (person) => {
    setEditingPerson(person);
    setPersonForm({ name: person.name, type: person.type, phone: person.phone, address: person.address });
  };
  const handlePersonDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await fetch(`http://localhost:4000/api/persons/${id}`, { method: "DELETE" });
      setPersonSearch(""); // إعادة تحميل القائمة
    }
  };
  // كود تواصل معنا (محلي فقط للعرض)
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
// دالة التحقق من تسجيل الدخول
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
        <button onClick={() => setPage("drugs")} className={page === "drugs" ? "active" : ""}>الأدوية</button>
        <button onClick={() => setPage("persons")} className={page === "persons" ? "active" : ""}>المتبرعين/المستفيدين</button>
        <button onClick={() => setPage("about")} className={page === "about" ? "active" : ""}>عن المنصة</button>
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
        // ... كود صفحة الأدوية كما في الرد السابق ...
        <section>
        <h2>{editingDrug ? "تعديل دواء" : "إضافة دواء جديد"}</h2>
          <form onSubmit={handleDrugSubmit} className="form-row">
            <input name="name" placeholder="اسم الدواء" value={drugForm.name} onChange={handleDrugChange} required />
            <input name="quantity" type="number" placeholder="الكمية" value={drugForm.quantity} onChange={handleDrugChange} required />
            <input name="donor" placeholder="اسم المتبرع" value={drugForm.donor} onChange={handleDrugChange} required />
            <input name="location" placeholder="مكان التوزيع" value={drugForm.location} onChange={handleDrugChange} required />
            <button type="submit">{editingDrug ? "تعديل" : "إضافة"}</button>
            {editingDrug && <button type="button" onClick={() => { setEditingDrug(null); setDrugForm({ name: "", quantity: "", donor: "", location: "" }) }}>إلغاء</button>}
          </form>
          <input placeholder="بحث باسم الدواء..." value={drugSearch} onChange={e => setDrugSearch(e.target.value)} className="search" />
          <h2>الأدوية المتوفرة</h2>
          <table>
            <thead>
              <tr>
                <th>اسم الدواء</th>
                <th>الكمية</th>
                <th>المتبرع</th>
                <th>مكان التوزيع</th>
                <th>تاريخ الإضافة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {drugs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>لا يوجد بيانات</td></tr>
              ) : (
                drugs.map((drug) => (
                  <tr key={drug._id}>
                    <td>{drug.name}</td>
                    <td>{drug.quantity}</td>
                    <td>{drug.donor}</td>
                    <td>{drug.location}</td>
                    <td>{new Date(drug.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDrugEdit(drug)}>تعديل</button>
                      <button onClick={() => handleDrugDelete(drug._id)}>حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
      {page === "persons" && (
        // ... كود صفحة المتبرعين/المستفيدين كما في الرد السابق ...
        <section>
          <h2>{editingPerson ? "تعديل بيانات" : "إضافة متبرع أو مستفيد"}</h2>
          <form onSubmit={handlePersonSubmit} className="form-row">
            <input name="name" placeholder="الاسم" value={personForm.name} onChange={handlePersonChange} required />
            <select name="type" value={personForm.type} onChange={handlePersonChange}>
              <option value="donor">متبرع</option>
              <option value="recipient">مستفيد</option>
            </select>
            <input name="phone" placeholder="رقم الهاتف" value={personForm.phone} onChange={handlePersonChange} />
            <input name="address" placeholder="العنوان" value={personForm.address} onChange={handlePersonChange} />
            <button type="submit">{editingPerson ? "تعديل" : "إضافة"}</button>
            {editingPerson && <button type="button" onClick={() => { setEditingPerson(null); setPersonForm({ name: "", type: "donor", phone: "", address: "" }) }}>إلغاء</button>}
          </form>
          <div className="filters">
            <input placeholder="بحث بالاسم..." value={personSearch} onChange={e => setPersonSearch(e.target.value)} className="search" />
            <select value={personTypeFilter} onChange={e => setPersonTypeFilter(e.target.value)}>
              <option value="">الكل</option>
              <option value="donor">متبرعين</option>
              <option value="recipient">مستفيدين</option>
            </select>
          </div>
          <h2>قائمة المتبرعين والمستفيدين</h2>
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>رقم الهاتف</th>
                <th>العنوان</th>
                <th>تاريخ الإضافة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {persons.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>لا يوجد بيانات</td></tr>
              ) : (
                persons.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.type === "donor" ? "متبرع" : "مستفيد"}</td>
                    <td>{p.phone || "-"}</td>
                    <td>{p.address || "-"}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handlePersonEdit(p)}>تعديل</button>
                      <button onClick={() => handlePersonDelete(p._id)}>حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
      {page === "about" && (
        <section className="about-section">
          <h2>عن منصة PharmaHope</h2>
          <p>
            <b>PharmaHope</b> منصة إنسانية تهدف إلى تسهيل إحصاء واستقبال وتوزيع الأدوية المجانية للمحتاجين.<br />
            رسالتنا: تحقيق العدالة الصحية وتسهيل الوصول للعلاج لكل مريض غير قادر.<br /><br />
            المنصة تربط بين المتبرعين والمستفيدين، وتدعم الشفافية عبر إدارة البيانات وتوثيق الجهات المتعاونة (مستشفيات، جمعيات).<br />
            نرحب بكل من يود المشاركة أو التطوع معنا لدعم رسالتنا.
          </p>
          <ul>
            <li>عرض مناطق التوزيع وتحديثها باستمرار</li>
            <li>توفير قاعدة بيانات دقيقة للأدوية المتوفرة</li>
            <li>تسهيل التواصل بين الجهات المتعاونة</li>
            <li>دعم التوسع في مناطق جديدة</li>
          </ul>
          <p>للتواصل أو التعاون، تفضل بزيارة صفحة <span style={{color:'#2c3e50',fontWeight:'bold'}}>تواصل معنا</span>.</p>
        </section>
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
    <div className="contact-info" style={{marginTop: '2em'}}>
      <div>أو تواصل مباشرة عبر:</div>
      <ul>
        <li>البريد: contact@pharmahope.org</li>
        <li>الهاتف: 123456789</li>
      </ul>
    </div>
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