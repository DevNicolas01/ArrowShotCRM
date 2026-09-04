// Vercel Function — GET /api/meta/test
//
// Endpoint de diagnóstico: confirma que as Vercel Functions estão no ar e
// que META_ACCESS_TOKEN foi configurado (sem nunca expor o valor em si).

export default function handler(req, res) {
  res.json({
    status: 'ok',
    message: 'Vercel Functions funcionando',
    env_configured: !!process.env.META_ACCESS_TOKEN,
  })
}
