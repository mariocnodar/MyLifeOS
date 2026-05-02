export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { food } = req.body;
    if (!food) return res.status(400).json({ error: 'food is required' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content: `Eres un nutricionista experto. Tu única tarea es calcular las macros totales del alimento que te indiquen y responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones.

FORMATO DE RESPUESTA OBLIGATORIO (sustituye los números por los valores reales):
{"calories":450,"protein":12,"carbs":55,"fat":22}

REGLAS:
- Calcula siempre para la cantidad indicada, no por 100g
- Si no se indica cantidad, usa una porción estándar razonable
- NUNCA devuelvas todos los valores a 0 salvo que el alimento tenga 0 calorías realmente
- Usa bases de datos USDA o equivalente para alimentos no conocidos
- Para nachos: ~500kcal/100g. Para aguacate: 160kcal/100g
- Para productos Mercadona/Hacendado usa valores medios de productos españoles equivalentes

PRODUCTOS ESPECÍFICOS:
- Yogur griego light Mercadona: 60kcal/100g, 5.8g prot, 4.7g carbs, 2g grasa (envase=125g)
- Muesli 0% azúcar Carrefour: 413kcal/100g, 7.5g prot, 67g carbs, 14g grasa
- Arroz Brillante vaso 125g: 198kcal total, 3.9g prot, 42g carbs, 0.5g grasa
- Merluza congelada Mercadona: 82kcal/100g, 18g prot, 0.5g carbs, 1.2g grasa
- Anacardos Mercadona: 604kcal/100g, 21.9g prot, 19g carbs, 48.2g grasa
- Galletas Príncipe: 490kcal/100g, una galleta=14g=69kcal
- Whey High Pro chocolate blanco: 380kcal/100g, 74g prot (scoop 30g=114kcal)
- Pollo plancha: 165kcal/100g, 31g prot, 0g carbs, 3.6g grasa`
          },
          {
            role: 'user',
            content: `Calcula las macros de: ${food}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error('OpenAI error:', JSON.stringify(data));
      return res.status(500).json({ error: 'OpenAI API error', detail: data });
    }

    const content = data.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, '').trim();

    // Extract JSON even if there's surrounding text
    const match = clean.match(/\{[^}]+\}/);
    if (!match) {
      console.error('No JSON in response:', content);
      return res.status(500).json({ error: 'No JSON in response', content });
    }

    const macros = JSON.parse(match[0]);

    // Validate - if all zeros and food is not water/air, something went wrong
    if (macros.calories === 0 && macros.protein === 0 && macros.carbs === 0 && macros.fat === 0) {
      console.error('All zeros returned for:', food, 'Response:', content);
    }

    return res.status(200).json({
      calories: Math.round(macros.calories || 0),
      protein: Math.round(macros.protein || 0),
      carbs: Math.round(macros.carbs || 0),
      fat: Math.round(macros.fat || 0)
    });

  } catch(e) {
    console.error('Handler error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
