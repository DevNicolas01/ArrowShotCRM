// Vercel Function — GET /api/meta/campaigns
//
// Lista as campanhas ativas de uma conta de anúncios do Meta Ads.
//
// Query params:
//   account_id (obrigatório) — ID da conta de anúncios, sem o prefixo "act_"

const GRAPH_VERSION = 'v19.0'
const FIELDS = 'id,name,status,objective,daily_budget,lifetime_budget'

export default async function handler(req, res) {
  try {
    const { account_id } = req.query

    if (!account_id) {
      return res.status(400).json({ error: 'Parâmetro obrigatório ausente: account_id' })
    }

    const accessToken = process.env.META_ACCESS_TOKEN
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN não configurado no servidor' })
    }

    const params = new URLSearchParams({
      fields: FIELDS,
      effective_status: JSON.stringify(['ACTIVE']),
      access_token: accessToken,
    })

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/act_${account_id}/campaigns?${params.toString()}`
    const metaResponse = await fetch(url)
    const data = await metaResponse.json()

    if (!metaResponse.ok) {
      const status = metaResponse.status >= 400 && metaResponse.status < 600 ? metaResponse.status : 502
      return res.status(status).json({ error: data?.error?.message || 'Erro ao buscar campanhas do Meta Ads' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Erro em /api/meta/campaigns:', err)
    return res.status(500).json({ error: 'Erro interno ao buscar campanhas do Meta Ads' })
  }
}
