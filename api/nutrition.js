export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { food } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un nutricionista experto. El usuario puede indicar alimentos con gramos (ej: 150g de pollo) o unidades (ej: 2 huevos). Si indica unidades, conviértelas a gramos usando pesos estándar. Usa valores de tablas USDA o BEDCA española. Devuelve EXCLUSIVAMENTE el JSON sin markdown. Formato: {"calories":0,"protein":0,"carbs":0,"fat":0,"grams":0}. Números enteros.' },
          { role: 'user', content: `Alimento: ${food}` }
        ]
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content;
    const macros = JSON.parse(content);
    return res.status(200).json(macros);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
