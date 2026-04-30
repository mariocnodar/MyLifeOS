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
          {
            role: 'system',
            content: `Eres un nutricionista experto. El usuario puede indicar uno o varios alimentos en el mismo mensaje (ej: "1 plátano y 22g de anacardos", "150g de pollo y 200g de arroz cocido").

INSTRUCCIONES:
1. Identifica TODOS los alimentos mencionados.
2. Para cada alimento, determina la cantidad exacta indicada (en gramos o unidades).
3. Si se indican unidades (2 huevos, 1 plátano, 3 galletas), conviértelas a gramos usando pesos estándar (huevo grande=60g, plátano mediano=120g, galleta príncipe=14g, rebanada pan=30g, etc.).
4. Calcula las macros para la cantidad REAL indicada de cada alimento usando valores USDA o BEDCA.
5. Suma las macros de TODOS los alimentos y devuelve el total.

Devuelve EXCLUSIVAMENTE el JSON sin markdown ni texto extra.
Formato: {"calories":0,"protein":0,"carbs":0,"fat":0}
Todos los valores son números enteros redondeados.`
          },
          { role: 'user', content: `Alimentos: ${food}` }
        ]
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    // Strip markdown if present
    const clean = content.replace(/```json|```/g, '').trim();
    const macros = JSON.parse(clean);
    return res.status(200).json(macros);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
