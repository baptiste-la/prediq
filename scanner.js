import fetch from 'node-fetch';

const SUPABASE_URL = "https://ugwmggmhgijkyyrkjcyo.supabase.co/rest/v1/markets";
const SUPABASE_KEY = "sb_publishable_2H3T1vKhaMVCvGMzpohCIQ_rktXCMHc";

// Liste de paris ultra-frais et passionnants pour de faux (exemples de gros volume)
const mockPolymarketData = [
  { question: "Will Bitcoin hit $150,000 in 2026?", score: 88, verdict: "BUY", yes_price: 0.62, no_price: 0.38, volume: 14500000, liquidity: 1200000 },
  { question: "Will Apple announce an AI Robot this year?", score: 45, verdict: "HOLD", yes_price: 0.25, no_price: 0.75, volume: 2100000, liquidity: 340000 },
  { question: "Will France win the next Football World Cup?", score: 74, verdict: "BUY", yes_price: 0.55, no_price: 0.45, volume: 8900000, liquidity: 950000 },
  { question: "Will OpenAI release GPT-6 before December?", score: 92, verdict: "BUY", yes_price: 0.78, no_price: 0.22, volume: 19400000, liquidity: 2500000 },
  { question: "Will Taylor Swift announce a new stadium tour?", score: 61, verdict: "BUY", yes_price: 0.68, no_price: 0.32, volume: 4300000, liquidity: 500000 },
  { question: "Will SpaceX land Starship on Mars this year?", score: 35, verdict: "SELL", yes_price: 0.12, no_price: 0.88, volume: 12000000, liquidity: 800000 }
];

async function updateSupabase() {
  console.log("🚀 Démarrage du scan Polymarket...");
  
  try {
    // Étape 1 : On nettoie l'ancienne liste pour repartir à neuf
    await fetch(`${SUPABASE_URL}?select=*`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("🗑️ Anciens marchés nettoyés.");

    // Étape 2 : On insère nos super opportunités toutes neuves
    const res = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(mockPolymarketData)
    });

    if (res.ok) {
      console.log("✅ Supabase mis à jour avec succès avec " + mockPolymarketData.length + " paris exceptionnels !");
    } else {
      console.error("❌ Erreur Supabase:", await res.text());
    }

  } catch (error) {
    console.error("💥 Erreur lors de l'exécution du robot:", error);
  }
}

updateSupabase();
