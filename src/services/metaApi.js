// Cliente do frontend para o backend seguro do Meta Ads (Vercel Functions em
// /api/meta/*). O access_token nunca passa por aqui — fica só no servidor
// (process.env.META_ACCESS_TOKEN), configurado nas Environment Variables do
// Vercel. Nunca chame graph.facebook.com diretamente do frontend.

export async function getMetaInsights(accountId, datePreset) {
  const response = await fetch(`/api/meta/insights?account_id=${accountId}&date_preset=${datePreset}`)
  if (!response.ok) throw new Error('Erro ao buscar dados do Meta')
  return response.json()
}

export async function getMetaCampaigns(accountId) {
  const response = await fetch(`/api/meta/campaigns?account_id=${accountId}`)
  if (!response.ok) throw new Error('Erro ao buscar campanhas')
  return response.json()
}

export async function getMetaAdSets(accountId, campaignId) {
  const params = new URLSearchParams({ account_id: accountId })
  if (campaignId) params.set('campaign_id', campaignId)
  const response = await fetch(`/api/meta/adsets?${params.toString()}`)
  if (!response.ok) throw new Error('Erro ao buscar conjuntos de anúncios')
  return response.json()
}

export async function getMetaAds(accountId, adSetId) {
  const params = new URLSearchParams({ account_id: accountId })
  if (adSetId) params.set('adset_id', adSetId)
  const response = await fetch(`/api/meta/ads?${params.toString()}`)
  if (!response.ok) throw new Error('Erro ao buscar anúncios')
  return response.json()
}
