import React, { useEffect, useState } from "react";

function App() {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", donor: "", location: "" });
  const [loading, setLoading] = useState(false);

  // جلب الأدوية من السيرفر
  useEffect(() => {
    fetch("http://localhost:4000/api/drugs")
      .then((res) => res.json())
      .then((data) => setDrugs(data))
      .catch(() => setDrugs([]));
  }, [loading]);

  // التعامل مع التغييرات في النموذج
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // إضافة دواء جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:4000/api/drugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", quantity: "", donor: "", location: "" });
    setLoading(!loading); // لإعادة تحميل القائمة
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40, maxWidth: 800, margin: 'auto' }}>
      <h1 style={{ color: "#2c3e50" }}>PharmaHope</h1>
      <p>
        منصة لإحصاء، استقبال، وتوزيع الأدوية المجانية للمحتاجين.<br />
        نسعى لتسهيل الوصول للعلاج وتحقيق العدالة الصحية.
      </p>
      <section>
        <h2>إضافة دواء جديد</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <input name="name" placeholder="اسم الدواء" value={form.name} onChange={handleChange} required />
          <input name="quantity" type="number" placeholder="الكمية" value={form.quantity} onChange={handleChange} required />
          <input name="donor" placeholder="اسم المتبرع" value={form.donor} onChange={handleChange} required />
          <input name="location" placeholder="مكان التوزيع" value={form.location} onChange={handleChange} required />
          <button type="submit">إضافة</button>
        </form>
      </section>
      <section>
        <h2>الأدوية المتوفرة</h2>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>اسم الدواء</th>
              <th>الكمية</th>
              <th>المتبرع</th>
              <th>مكان التوزيع</th>
              <th>تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {drugs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center" }}>لا يوجد بيانات</td></tr>
            ) : (
              drugs.map((drug) => (
                <tr key={drug._id}>
                  <td>{drug.name}</td>
                  <td>{drug.quantity}</td>
                  <td>{drug.donor}</td>
                  <td>{drug.location}</td>
                  <td>{new Date(drug.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <footer style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
        &copy; {new Date().getFullYear()} PharmaHope. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default App;