// Vercel Function — GET /api/google/insights
//
// Placeholder — integração com a API do Google Ads ainda não implementada.
// Estrutura de rota já reservada para quando as credenciais
// (GOOGLE_ADS_CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN / DEVELOPER_TOKEN,
// ver .env.example) forem configuradas.

export default function handler(req, res) {
  res.status(501).json({ error: 'Integração com Google Ads ainda não implementada' })
}
