// Vercel Function — GET /api/meta/adsets
//
// Lista os conjuntos de anúncios (ad sets) de uma conta de anúncios do Meta
// Ads — opcionalmente filtrados por campanha.
//
// Query params:
//   account_id  (obrigatório) — ID da conta de anúncios, sem o prefixo "act_"
//   campaign_id (opcional)    — restringe aos conjuntos dessa campanha

const GRAPH_VERSION = 'v19.0'
const FIELDS = 'id,name,status,campaign_id,daily_budget,lifetime_budget,optimization_goal,targeting'

export default async function handler(req, res) {
  try {
    const { account_id, campaign_id } = req.query

    if (!account_id) {
      return res.status(400).json({ error: 'Parâmetro obrigatório ausente: account_id' })
    }

    const accessToken = process.env.META_ACCESS_TOKEN
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN não configurado no servidor' })
    }

    const params = new URLSearchParams({
      fields: FIELDS,
      access_token: accessToken,
    })
    if (campaign_id) params.set('filtering', JSON.stringify([{ field: 'campaign.id', operator: 'EQUAL', value: campaign_id }]))

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/act_${account_id}/adsets?${params.toString()}`
    const metaResponse = await fetch(url)
    const data = await metaResponse.json()

    if (!metaResponse.ok) {
      const status = metaResponse.status >= 400 && metaResponse.status < 600 ? metaResponse.status : 502
      return res.status(status).json({ error: data?.error?.message || 'Erro ao buscar conjuntos de anúncios do Meta Ads' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Erro em /api/meta/adsets:', err)
    return res.status(500).json({ error: 'Erro interno ao buscar conjuntos de anúncios do Meta Ads' })
  }
}
