import React, { useEffect, useState } from "react";

function App() {
  const [page, setPage] = useState("drugs"); // drugs | persons

  // بيانات الأدوية
  const [drugs, setDrugs] = useState([]);
  const [drugForm, setDrugForm] = useState({ name: "", quantity: "", donor: "", location: "" });
  const [drugsLoading, setDrugsLoading] = useState(false);

  // بيانات المتبرعين/المستفيدين
  const [persons, setPersons] = useState([]);
  const [personForm, setPersonForm] = useState({ name: "", type: "donor", phone: "", address: "" });
  const [personsLoading, setPersonsLoading] = useState(false);

  // جلب الأدوية
  useEffect(() => {
    if (page === "drugs") {
      fetch("http://localhost:4000/api/drugs")
        .then((res) => res.json())
        .then((data) => setDrugs(data))
        .catch(() => setDrugs([]));
    }
  }, [drugsLoading, page]);

  // جلب المتبرعين/المستفيدين
  useEffect(() => {
    if (page === "persons") {
      fetch("http://localhost:4000/api/persons")
        .then((res) => res.json())
        .then((data) => setPersons(data))
        .catch(() => setPersons([]));
    }
  }, [personsLoading, page]);

  // التعامل مع تغيرات نموذج الأدوية
  const handleDrugChange = (e) => {
    setDrugForm({ ...drugForm, [e.target.name]: e.target.value });
  };

  // إرسال نموذج دواء جديد
  const handleDrugSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:4000/api/drugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drugForm),
    });
    setDrugForm({ name: "", quantity: "", donor: "", location: "" });
    setDrugsLoading(!drugsLoading);
  };

  // التعامل مع تغيرات نموذج الشخص
  const handlePersonChange = (e) => {
    setPersonForm({ ...personForm, [e.target.name]: e.target.value });
  };

  // إرسال نموذج متبرع/مستفيد جديد
  const handlePersonSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:4000/api/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personForm),
    });
    setPersonForm({ name: "", type: "donor", phone: "", address: "" });
    setPersonsLoading(!personsLoading);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40, maxWidth: 900, margin: 'auto' }}>
      <h1 style={{ color: "#2c3e50" }}>PharmaHope</h1>
      <nav style={{ marginBottom: 30 }}>
        <button onClick={() => setPage("drugs")} style={{ margin: 5, background: page === "drugs" ? "#eee" : "#fff" }}>الأدوية</button>
        <button onClick={() => setPage("persons")} style={{ margin: 5, background: page === "persons" ? "#eee" : "#fff" }}>المتبرعين/المستفيدين</button>
      </nav>
      {page === "drugs" && (
        <section>
          <h2>إضافة دواء جديد</h2>
          <form onSubmit={handleDrugSubmit} style={{ marginBottom: 30 }}>
            <input name="name" placeholder="اسم الدواء" value={drugForm.name} onChange={handleDrugChange} required />
            <input name="quantity" type="number" placeholder="الكمية" value={drugForm.quantity} onChange={handleDrugChange} required />
            <input name="donor" placeholder="اسم المتبرع" value={drugForm.donor} onChange={handleDrugChange} required />
            <input name="location" placeholder="مكان التوزيع" value={drugForm.location} onChange={handleDrugChange} required />
            <button type="submit">إضافة</button>
          </form>
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
      )}
      {page === "persons" && (
        <section>
          <h2>إضافة متبرع أو مستفيد</h2>
          <form onSubmit={handlePersonSubmit} style={{ marginBottom: 30 }}>
            <input name="name" placeholder="الاسم" value={personForm.name} onChange={handlePersonChange} required />
            <select name="type" value={personForm.type} onChange={handlePersonChange}>
              <option value="donor">متبرع</option>
              <option value="recipient">مستفيد</option>
            </select>
            <input name="phone" placeholder="رقم الهاتف" value={personForm.phone} onChange={handlePersonChange} />
            <input name="address" placeholder="العنوان" value={personForm.address} onChange={handlePersonChange} />
            <button type="submit">إضافة</button>
          </form>
          <h2>قائمة المتبرعين والمستفيدين</h2>
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>رقم الهاتف</th>
                <th>العنوان</th>
                <th>تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {persons.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center" }}>لا يوجد بيانات</td></tr>
              ) : (
                persons.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.type === "donor" ? "متبرع" : "مستفيد"}</td>
                    <td>{p.phone || "-"}</td>
                    <td>{p.address || "-"}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
      <footer style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
        &copy; {new Date().getFullYear()} PharmaHope. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default App;