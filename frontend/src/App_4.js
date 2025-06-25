import React, { useEffect, useState } from "react";
import "./style.css"; // سنضيف CSS بسيط لاحقاً

function App() {
  const [page, setPage] = useState("drugs"); // drugs | persons

  // --- أدوية ---
  const [drugs, setDrugs] = useState([]);
  const [drugForm, setDrugForm] = useState({ name: "", quantity: "", donor: "", location: "" });
  const [editingDrug, setEditingDrug] = useState(null);
  const [drugSearch, setDrugSearch] = useState("");

  // --- أشخاص ---
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

  return (
    <div className="container">
      <h1>PharmaHope</h1>
      <nav>
        <button onClick={() => setPage("drugs")} className={page === "drugs" ? "active" : ""}>الأدوية</button>
        <button onClick={() => setPage("persons")} className={page === "persons" ? "active" : ""}>المتبرعين/المستفيدين</button>
      </nav>
      {page === "drugs" && (
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
      <footer>
        &copy; {new Date().getFullYear()} PharmaHope. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default App;