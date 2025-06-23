import React from "react";

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40, maxWidth: 800, margin: 'auto' }}>
      <h1 style={{ color: "#2c3e50" }}>PharmaHope</h1>
      <p>
        منصة لإحصاء، استقبال، وتوزيع الأدوية المجانية للمحتاجين.<br />
        نسعى لتسهيل الوصول للعلاج وتحقيق العدالة الصحية.
      </p>
      <section style={{ marginTop: 30 }}>
        <h2>معلومات عن المنصة</h2>
        <ul>
          <li>مناطق التوزيع</li>
          <li>نوعية الأدوية المتوفرة</li>
          <li>جهات التعاون (مستشفيات، متبرعين)</li>
          <li>أهداف التوسع وزيادة المستفيدين</li>
        </ul>
      </section>
      <footer style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
        &copy; {new Date().getFullYear()} PharmaHope. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}

export default App;