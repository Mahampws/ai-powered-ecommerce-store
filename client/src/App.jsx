import { useEffect, useState } from "react";
const API = "http://localhost:5000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [preferences, setPreferences] = useState("I need an affordable setup for remote software development.");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    const response = await fetch(`${API}/products`);
    if (response.ok) setProducts(await response.json());
  }
  useEffect(() => { loadProducts(); }, []);

  async function seed() {
    await fetch(`${API}/products/seed`, { method: "POST" });
    loadProducts();
  }

  async function recommend() {
    setLoading(true);
    const response = await fetch(`${API}/recommend`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ preferences })
    });
    const data = await response.json();
    setRecommendation(data.recommendation || data.message);
    setLoading(false);
  }

  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">Recommendation Engine MVP</div>
        <h1>AI-Powered Store</h1>
        <p className="lead">The AI receives customer intent plus the live product catalog and returns grounded recommendations.</p>
      </header>
      <section className="card">
        <div className="row"><h2>Catalog</h2><button onClick={seed}>Load demo products</button></div>
        <div className="grid">
          {products.map(p => <article className="item" key={p._id}><strong>{p.name}</strong><p>{p.description}</p><span className="badge">${p.price}</span></article>)}
        </div>
      </section>
      <section className="card" style={{marginTop:18}}>
        <label>What are you looking for?<textarea value={preferences} onChange={e => setPreferences(e.target.value)} /></label>
        <button onClick={recommend} disabled={loading}>{loading ? "Analyzing..." : "Recommend products"}</button>
        <div className="result" style={{marginTop:18}}>{recommendation}</div>
      </section>
    </main>
  );
}
