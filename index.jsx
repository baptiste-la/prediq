import { useState, useEffect } from "react";

const BLOCKED_COUNTRIES = ["US", "GB", "DE", "NL", "IT", "ES", "BE", "PL", "PT"];

function formatVolume(n) {
  if (!n) return "$0";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

// Le composant doit s'appeler App pour correspondre au fichier main.jsx
export default function App() {
  const [markets, setMarkets] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function initPlatform() {
      try {
        const res = await fetch("https://ip-api.com/json/?fields=countryCode");
        const data = await res.json();
        if (BLOCKED_COUNTRIES.includes(data.countryCode)) {
          setBlocked(true);
        }
      } catch (e) {
        // En cas d'échec de l'API géo, on laisse l'accès standard
      }

      try {
        const SUPABASE_URL = "https://ugwmggmhgijkyyrkjcyo.supabase.co/rest/v1/markets?select=*";
        const res = await fetch(SUPABASE_URL, {
          headers: {
            "apikey": "sb_publishable_2H3T1vKhaMVCvGMzpohCIQ_rktXCMHc",
            "Authorization": "Bearer sb_publishable_2H3T1vKhaMVCvGMzpohCIQ_rktXCMHc"
          }
        });
        const data = await res.json();
        const sorted = data.sort((a, b) => b.score - a.score);
        setMarkets(sorted);
      } catch (error) {
        console.error("Erreur de chargement des données", error);
      } finally {
        setLoading(false);
      }
    }
    
    initPlatform();
  }, []);

  const filtered = filter === "all" ? markets : markets.filter(m => m.score >= (filter === "top" ? 70 : 50));

  if (blocked) return (
    <div style={styles.blocked}>
      <div style={styles.blockedCard}>
        <div style={styles.blockedIcon}>🚫</div>
        <h2 style={styles.blockedTitle}>Access Restricted</h2>
        <p style={styles.blockedText}>This service is not available in your country due to local regulations.</p>
      </div>
    </div>
  );

  if (showTerms) return (
    <div style={styles.termsOverlay}>
      <div style={styles.termsCard}>
        <div style={styles.termsLogo}>⚡</div>
        <h1 style={styles.termsTitle}>PREDIQ</h1>
        <p style={styles.termsSubtitle}>AI-Powered Prediction Market Analyzer</p>
        <div style={styles.termsBox}>
          <p style={styles.termsText}>
            ✅ This platform provides <strong>informational analysis only</strong> — not financial advice.<br /><br />
            ✅ By continuing, you confirm you reside in a country where prediction markets are <strong>legally permitted</strong>.<br /><br />
            ✅ Users from restricted countries are <strong>blocked automatically</strong>.<br /><br />
            ⚠️ Trading prediction markets involves <strong>financial risk</strong>. Never invest more than you can afford to lose.
          </p>
        </div>
        <label style={styles.checkLabel}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={styles.checkbox} />
          <span style={{ color: "#fff" }}>I confirm I am legally allowed to use this service</span>
        </label>
        <button
          style={{ ...styles.termsBtn, opacity: agreed ? 1 : 0.4, cursor: agreed ? "pointer" : "not-allowed" }}
          onClick={() => agreed && setShowTerms(false)}
        >
          Enter Platform →
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>PREDIQ</span>
          </div>
          <div style={styles.headerRight}>
            {!isPremium && (
              <button style={styles.premiumBtn} onClick={() => alert("Redirection vers ton lien Stripe...")}>
                Go Premium ✨
              </button>
            )}
            <span style={styles.liveTag}>● LIVE</span>
          </div>
        </div>
      </header>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find Your Edge.<br />Beat the Market.</h1>
        <p style={styles.heroSub}>AI analyzes every Polymarket opportunity in real-time so you don't have to.</p>
        <div style={styles.stats}>
          <div style={styles.stat}><span style={styles.statNum}>{markets.length}</span><span style={styles.statLabel}>Markets</span></div>
          <div style={styles.statDiv} />
          <div style={styles.stat}><span style={styles.statNum}>{markets.filter(m => m.score >= 70).length}</span><span style={styles.statLabel}>Hot Picks</span></div>
        </div>
      </div>

      <div style={styles.filters}>
        {["all", "top", "medium"].map(f => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
            {f === "all" ? "All Markets" : f === "top" ? "🔥 Top Picks" : "📊 Medium"}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loader}>Loading smart markets...</div>
        ) : filtered.map(market => {
          const scoreColor = market.score >= 70 ? "#00ff88" : market.score >= 50 ? "#ffcc00" : "#ff6b6b";
          const verdictColor = market.verdict === "BUY" ? "#00ff88" : market.verdict === "SELL" ? "#ff6b6b" : "#ffcc00";
          const isLocked = market.score >= 70 && !isPremium;

          return (
            <div key={market.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.scoreBadge, background: scoreColor + "22", border: `1px solid ${scoreColor}`, color: scoreColor }}>
                  {market.score}/100
                </div>
                {!isLocked && (
                  <div style={{ ...styles.verdictBadge, background: verdictColor + "22", border: `1px solid ${verdictColor}`, color: verdictColor }}>
                    {market.verdict}
                  </div>
                )}
              </div>

              <h3 style={styles.question}>{market.question}</h3>

              <div style={styles.probRow}>
                <div style={styles.probItem}>
                  <span style={styles.probLabel}>YES</span>
                  <span style={styles.probValue}>{(market.yes_price * 100).toFixed(0)}%</span>
                </div>
                <div style={styles.probBar}>
                  <div style={{ ...styles.probFill, width: `${(market.yes_price * 100).toFixed(0)}%` }} />
                </div>
                <div style={styles.probItem}>
                  <span style={styles.probLabel}>NO</span>
                  <span style={{ ...styles.probValue, color: "#ff6b6b" }}>{(market.no_price * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.meta}>📊 {formatVolume(market.volume)}</span>
                <span style={styles.meta}>💧 {formatVolume(market.liquidity)}</span>
              </div>

              {isLocked && (
                <div style={styles.lockedBox}>
                  <p style={styles.lockedText}>🔒 AI Analysis locked for Free users</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Les styles manquants indispensables pour éviter le crash de l'affichage
const styles = {
  app: { backgroundColor: "#0b0e14", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "40px" },
  header: { borderBottom: "1px solid #1e2530", padding: "15px 20px" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" },
  logo: { display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "20px" },
  logoIcon: { color: "#00ff88" },
  logoText: { letterSpacing: "1px" },
  headerRight: { display: "flex", alignItems: "center", gap: "15px" },
  premiumBtn: { background: "linear-gradient(90deg, #ffcc00, #ff6b6b)", border: "none", color: "#000", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" },
  liveTag: { color: "#00ff88", fontSize: "12px", fontWeight: "bold" },
  hero: { textAlign: "center", padding: "60px 20px", maxWidth: "800px", margin: "0 auto" },
  heroTitle: { fontSize: "40px", marginBottom: "15px", lineHeight: "1.2" },
  heroSub: { color: "#8a99ad", fontSize: "18px", marginBottom: "30px" },
  stats: { display: "flex", justifyContent: "center", alignItems: "center", gap: "30px" },
  stat: { display: "flex", flexDirection: "column", gap: "5px" },
  statNum: { fontSize: "24px", fontWeight: "bold", color: "#00ff88" },
  statLabel: { color: "#8a99ad", fontSize: "14px" },
  statDiv: { width: "1px", height: "30px", backgroundColor: "#1e2530" },
  filters: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" },
  filterBtn: { backgroundColor: "#1e2530", border: "1px solid #2d3748", color: "#8a99ad", padding: "10px 20px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" },
  filterActive: { backgroundColor: "#00ff88", color: "#000", borderColor: "#00ff88" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  loader: { textAlign: "center", width: "100%", color: "#8a99ad" },
  card: { backgroundColor: "#141a24", border: "1px solid #1e2530", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  scoreBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" },
  verdictBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" },
  question: { fontSize: "18px", lineHeight: "1.4", margin: 0 },
  probRow: { display: "flex", alignItems: "center", gap: "10px" },
  probItem: { display: "flex", flexDirection: "column", minWidth: "40px" },
  probLabel: { fontSize: "11px", color: "#8a99ad" },
  probValue: { fontSize: "14px", fontWeight: "bold", color: "#00ff88" },
  probBar: { flex: 1, height: "6px", backgroundColor: "#1e2530", borderRadius: "3px", overflow: "hidden" },
  probFill: { height: "100%", backgroundColor: "#00ff88" },
  metaRow: { display: "flex", gap: "15px", borderTop: "1px solid #1e2530", paddingTop: "12px" },
  meta: { fontSize: "13px", color: "#8a99ad" },
  lockedBox: { backgroundColor: "#1e141a", border: "1px dashed #ff6b6b", borderRadius: "8px", padding: "10px", textAlign: "center" },
  lockedText: { margin: 0, color: "#ff6b6b", fontSize: "13px" },
  blocked: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0b0e14", color: "#fff" },
  blockedCard: { textAlign: "center", padding: "40px", backgroundColor: "#141a24", borderRadius: "12px", border: "1px solid #1e2530" },
  blockedIcon: { fontSize: "48px", marginBottom: "20px" },
  blockedTitle: { fontSize: "24px", marginBottom: "10px" },
  blockedText: { color: "#8a99ad" },
  termsOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0b0e14", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  termsCard: { backgroundColor: "#141a24", border: "1px solid #1e2530", borderRadius: "16px", padding: "40px", maxWidth: "500px", width: "100%", textAlign: "center" },
  termsLogo: { fontSize: "40px", color: "#00ff88", marginBottom: "10px" },
  termsTitle: { fontSize: "32px", fontWeight: "bold", margin: 0, letterSpacing: "2px" },
  termsSubtitle: { color: "#8a99ad", fontSize: "14px", marginBottom: "30px" },
  termsBox: { backgroundColor: "#0b0e14", border: "1px solid #1e2530", borderRadius: "8px", padding: "20px", textAlign: "left", marginBottom: "20px" },
  termsText: { color: "#cbd5e1", fontSize: "14px", margin: 0, lineHeight: "1.6" },
  checkLabel: { display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "30px", cursor: "pointer", fontSize: "14px" },
  checkbox: { width: "16px", height: "16px", accentColor: "#00ff88" },
  termsBtn: { width: "100%", backgroundColor: "#00ff88", color: "#000", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", transition: "opacity 0.2s" }
};
