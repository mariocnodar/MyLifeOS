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
            content: `Eres un nutricionista experto. Calcula macros totales de TODOS los alimentos mencionados y devuelve SOLO JSON sin texto extra.

PRODUCTOS ESPECÍFICOS DEL USUARIO (valores exactos de etiqueta por 100g):
- Yogur griego light Mercadona Hacendado 2% MG: 60kcal, 5.8g prot, 4.7g carbs, 2g grasa. Un envase = 125g
- Muesli 0% azúcar Carrefour: 413kcal, 7.5g prot, 67g carbs, 14g grasa (de la foto de etiqueta)
- Salteado rústico Hacendado congelado: 76kcal, 3g prot, 10g carbs, 2g grasa (por 100g)
- Salteado de verduras Hacendado congelado: 36kcal, 2g prot, 5g carbs, 0.3g grasa (por 100g)
- Pan rústico Mercadona Hacendado: 265kcal, 8g prot, 51g carbs, 2g grasa (por 100g). Una rebanada ≈ 35g
- Merluza congelada Mercadona Hacendado: 82kcal, 18g prot, 0.5g carbs, 1.2g grasa (por 100g)
- Anacardos natural Mercadona Hacendado: 604kcal, 21.9g prot, 19g carbs, 48.2g grasa (por 100g)
- Anacardos fritos salados Mercadona Hacendado: 617kcal, 18g prot, 22g carbs, 50g grasa (por 100g)
- Arroz basmati Brillante vaso 125g: 198kcal, 3.9g prot, 42g carbs, 0.5g grasa (por vaso completo de 125g)
- Filete pollo plancha: 165kcal, 31g prot, 0g carbs, 3.6g grasa (por 100g)
- Galletas Príncipe (LU / Aldi / cualquier marca): 490kcal, 6.1g prot, 67.5g carbs, 21g grasa (por 100g). Una galleta ≈ 14-15g = 69kcal
- Whey proteína High Pro Nutrition / batido proteínas chocolate blanco: 380kcal, 74g prot, 8g carbs, 6g grasa (por 100g). Un cacito/scoop ≈ 30g = 114kcal, 22g prot

CONVERSIONES DE UNIDADES ESTÁNDAR:
- Huevo grande: 60g (143kcal/100g → 86kcal por huevo)
- Huevo mediano: 50g
- Plátano mediano: 120g
- Manzana mediana: 150g
- Naranja mediana: 130g
- Rebanada pan de molde: 25g
- Tostada/rebanada pan barra: 30-35g
- Galleta Príncipe/Aldi: 14g por galleta
- Yogur griego Mercadona: 125g por envase
- Cucharada sopera aceite: 10g
- Vaso leche: 200ml
- Taza: 250ml

VALORES NUTRICIONALES POR 100g (USDA/BEDCA):
- Pechuga pollo cocida: 165kcal, 31g prot, 0g carbs, 3.6g grasa
- Pechuga pavo: 135kcal, 29g prot, 0g carbs, 1.7g grasa
- Salmón: 208kcal, 20g prot, 0g carbs, 13g grasa
- Atún lata al natural: 103kcal, 23g prot, 0g carbs, 1g grasa
- Huevo entero: 143kcal, 13g prot, 0.7g carbs, 9.5g grasa
- Arroz blanco cocido: 130kcal, 2.7g prot, 28g carbs, 0.3g grasa
- Arroz blanco crudo: 358kcal, 6.7g prot, 79g carbs, 0.7g grasa
- Pasta cocida: 158kcal, 5.8g prot, 31g carbs, 0.9g grasa
- Pan blanco: 265kcal, 9g prot, 51g carbs, 3.2g grasa
- Pan integral: 247kcal, 9g prot, 41g carbs, 3.5g grasa
- Avena cruda: 389kcal, 17g prot, 66g carbs, 7g grasa
- Patata cocida: 86kcal, 1.7g prot, 20g carbs, 0.1g grasa
- Lentejas cocidas: 116kcal, 9g prot, 20g carbs, 0.4g grasa
- Garbanzos cocidos: 164kcal, 8.9g prot, 27g carbs, 2.6g grasa
- Leche entera: 61kcal, 3.2g prot, 4.8g carbs, 3.3g grasa
- Leche semidesnatada: 46kcal, 3.3g prot, 4.8g carbs, 1.5g grasa
- Leche desnatada: 33kcal, 3.4g prot, 4.9g carbs, 0.2g grasa
- Yogur natural: 61kcal, 3.8g prot, 4.9g carbs, 3.3g grasa
- Queso fresco: 98kcal, 11g prot, 3g carbs, 4g grasa
- Parmesano rallado: 431kcal, 38g prot, 0g carbs, 29g grasa
- Plátano: 89kcal, 1.1g prot, 23g carbs, 0.3g grasa
- Manzana: 52kcal, 0.3g prot, 14g carbs, 0.2g grasa
- Naranja: 47kcal, 0.9g prot, 12g carbs, 0.1g grasa
- Fresa: 32kcal, 0.7g prot, 7.7g carbs, 0.3g grasa
- Aguacate: 160kcal, 2g prot, 9g carbs, 15g grasa
- Aceite oliva: 884kcal, 0g prot, 0g carbs, 100g grasa
- Almendras: 579kcal, 21g prot, 22g carbs, 50g grasa
- Nueces: 654kcal, 15g prot, 14g carbs, 65g grasa
- Jamón serrano: 241kcal, 30g prot, 0g carbs, 13g grasa
- Jamón york: 107kcal, 17g prot, 1.5g carbs, 3.5g grasa
- Chocolate negro 70%: 598kcal, 8g prot, 46g carbs, 43g grasa

INSTRUCCIONES:
1. Identifica TODOS los alimentos y sus cantidades exactas
2. Si no se indica cantidad, usa una porción estándar razonable
3. Calcula macros para la cantidad REAL indicada (no por 100g)
4. Suma TODO y devuelve el total
5. Devuelve SOLO JSON: {"calories":0,"protein":0,"carbs":0,"fat":0}
6. Números enteros redondeados`
          },
          { role: 'user', content: `Calcula las macros totales de: ${food}` }
        ]
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const clean = content.replace(/```json|```/g, '').trim();
    const macros = JSON.parse(clean);
    return res.status(200).json(macros);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
