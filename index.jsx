import { useState, useEffect } from "react";

// Note: "FR" est retiré de la liste des pays bloqués pour que tu puisses tester ton site en direct depuis la France
const BLOCKED_COUNTRIES = ["US", "GB", "DE", "NL", "IT", "ES", "BE", "PL", "PT"];

function formatVolume(n) {
  if (!n) return "$0";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  
  // Simulation de l'état de l'utilisateur (Premium ou Gratuit)
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function initPlatform() {
      // 1. Vérification de la géolocalisation (Gratuit)
      try {
        const res = await fetch("https://ip-api.com/json/?fields=countryCode");
        const data = await res.json();
        if (BLOCKED_COUNTRIES.includes(data.countryCode)) {
          setBlocked(true);
        }
      } catch (e) {
        // En cas d'échec de l'API géo, on laisse l'accès standard
      }

      // 2. Récupération en direct de tes vraies données de production Supabase
      try {
        const SUPABASE_URL = "https://ugwmggmhgijkyyrkjcyo.supabase.co/rest/v1/markets?select=*";
        const res = await fetch(SUPABASE_URL, {
          headers: {
            "apikey": "sb_publishable_2H3T1vKhaMVCvGMzpohCIQ_rktXCMHc",
            "Authorization": "Bearer sb_publishable_2H3T1vKhaMVCvGMzpohCIQ_rktXCMHc"
          }
        });
        const data = await res.json();
        
        // Tri dynamique par score IA décroissant
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
          <span>I confirm I am legally allowed to use this service</span>
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
      {/* Header */}
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

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find Your Edge.<br />Beat the Market.</h1>
        <p style={styles.heroSub}>AI analyzes every Polymarket opportunity in real-time so you don't have to.</p>
        <div style={styles.stats}>
          <div style={styles.stat}><span style={styles.statNum}>{markets.length}</span><span style={styles.statLabel}>Markets</span></div>
          <div style={styles.statDiv} />
          <div style={styles.stat}><span style={styles.statNum}>{markets.filter(m => m.score >= 70).length}</span><span style={styles.statLabel}>Hot Picks</span></div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {["all", "top", "medium"].map(f => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
            {f === "all" ? "All Markets" : f === "top" ? "🔥 Top Picks" : "📊 Medium"}
          </button>
        ))}
      </div>

      {/* Markets Grid */}
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loader}>Loading smart markets...</div>
        ) : filtered.map(market => {
          const scoreColor = market.score >= 70 ? "#00ff88" : market.score >= 50 ? "#ffcc00" : "#ff6b6b";
          const verdictColor = market.verdict === "BUY" ? "#00ff88" : market.verdict === "SELL" ? "#ff6b6b" : "#ffcc00";
          
          // PROTECTION PAYWALL : On cache l'analyse des "Top Picks" (Score >= 70) si l'utilisateur n'est pas premium
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

              {/* Affichage conditionnel Paywall selon le plan */}
              {isLocked ? (
                <div style={styles.lockedBox}>
                   <p style={styles.lockedText}>🔒 AI Analysis locked for Free users</p>
