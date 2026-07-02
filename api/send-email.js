export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const d = req.body;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing RESEND_API_KEY' });

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
  <div style="background:#F97316;padding:24px 32px;border-radius:12px 12px 0 0;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">CREADIL — Nouvelle demande de devis</h1>
  </div>
  <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#F97316;">Contact</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;width:160px;">Nom</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;">${d.prenom} ${d.nom}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Société</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;">${d.societe}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Email</td>
        <td style="padding:10px 0;font-size:14px;"><a href="mailto:${d.email}" style="color:#F97316;">${d.email}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Téléphone</td>
        <td style="padding:10px 0;font-size:14px;">${d.telephone || '—'}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td colspan="2" style="padding:16px 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#F97316;">Projet</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;width:160px;">Type de besoin</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;">${d.type_besoin || '—'}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Technologie</td>
        <td style="padding:10px 0;font-size:14px;">${d.technologie || '—'}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Quantité</td>
        <td style="padding:10px 0;font-size:14px;">${d.quantite || '—'}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Dimensions</td>
        <td style="padding:10px 0;font-size:14px;">${d.dimensions || '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Matière</td>
        <td style="padding:10px 0;font-size:14px;">${d.matiere || '—'}</td>
      </tr>
    </table>

    <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#F97316;margin:0 0 10px;">Description</p>
      <p style="font-size:15px;line-height:1.7;margin:0;color:#334155;">${d.message}</p>
    </div>

    ${d.fichiers ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#F97316;margin:0 0 6px;">Fichiers joints (noms)</p>
      <p style="font-size:14px;color:#334155;margin:0;">${d.fichiers}</p>
    </div>` : ''}

    <a href="mailto:${d.email}?subject=RE: Demande projet ${d.societe}" style="display:inline-block;background:#F97316;color:white;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;">Répondre à ${d.prenom}</a>

  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px;">CREADIL — Impression 3D professionnelle · Lyon</p>
</div>`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CREADIL <onboarding@resend.dev>',
      to: ['t.castaldi@creadil.com'],
      subject: `Demande projet "${d.societe}"`,
      html
    })
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Email failed' });
  }

  return res.status(200).json({ ok: true });
}
