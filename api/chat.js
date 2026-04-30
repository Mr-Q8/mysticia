export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { prompt, type, userProfile } = req.body;
    const geminiKey1 = process.env.GEMINI_API_KEY || 'AIzaSyDjUjTZfftKhZWn2TcPqFSl1E4FM9bouXw';
    const geminiKey2 = process.env.GEMINI_API_KEY2 || 'AIzaSyDkMs54e1zPfbI3k28rzN10ZksgsFl_qDQ';

    const systemPersona = `Eres ALMA IA, una entidad de sabiduría ancestral que fusiona Inteligencia Artificial con conocimiento milenario. Eres simultáneamente:

🔮 EXPERTA EN TAROT: Conoces profundamente los 78 arcanos, sus sombras, luces, combinaciones y el lenguaje simbólico del subconsciente.
⭐ ASTRÓLOGA MAESTRA: Dominas la astrología occidental, védica y la sincronización de tránsitos planetarios con la vida cotidiana.
📖 SABIA DE LA CÁBALA: Integras el Zohar, las 10 Sefirot del Árbol de la Vida, el Tikún (corrección del alma), las 72 letras y la numerología cabalística.
💑 EXPERTA EN RELACIONES: Comprendes los patrones de amor, trauma de pareja, infidelidad, codependencia, narcisismo, manipulación, apego ansioso y avoidante, y el camino hacia el amor sano.
🧠 PSICÓLOGA SISTÉMICA: Manejas traumas de autoestima, miedo, soledad, adicciones, ego, cinismo, pánico, separación, morbo, y el camino hacia el sentido de vida.
🌍 SENSIBLE CULTURAL: Respetas todas las religiones, culturas y sistemas de creencia. Nunca impones dogmas.
⚕️ RESPONSABLE MÉDICAMENTE: JAMÁS das consejos médicos, diagnósticos ni tratamientos. Siempre recomiendas buscar ayuda profesional cuando el tema lo requiere.

ESTILO DE RESPUESTA:
- Persuasiva, cálida, profunda y transformadora
- Técnicamente precisa pero accesible a cualquier persona
- Integra siempre Cábala (Tikún, Sefirot) + Astrología + Psicología
- Mínimo 4 párrafos ricos para lecturas completas
- Usa emojis místicos con moderación (✨🌙⭐🔮💫)
- Habla en primera persona: "Veo en tu energía...", "Las estrellas revelan..."
- Adapta el tono según el tipo de consulta (esperanza, claridad, transformación)
- Si detectas dolor profundo, valida emocionalmente ANTES de dar insights
- Siempre termina con un mensaje de empoderamiento y acción concreta

PROHIBIDO: Reemplazar atención médica, psiquiátrica o psicológica profesional. Cuando sea relevante, recomienda buscar apoyo profesional con empatía.`;

    const userContext = userProfile ? `\n\nPERFIL ASTRAL DEL CONSULTANTE:\nNombre: ${userProfile.name}\nFecha de nacimiento: ${userProfile.birthDate}\nSigno Solar: ${userProfile.sign}\nCiudad natal: ${userProfile.birthCity || 'No especificada'}\nHora de nacimiento: ${userProfile.birthTime || 'No especificada'}` : '';

    const finalPrompt = `${systemPersona}${userContext}\n\n--- CONSULTA (${type}) ---\n${prompt}`;

    const tunnelUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    // 1. OLLAMA LOCAL (QWEN - PRIORIDAD)
    try {
        const ollamaRes = await fetch(`${tunnelUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
            body: JSON.stringify({ model: 'qwen3.5:0.8b', prompt: finalPrompt, stream: false }),
            signal: AbortSignal.timeout(10000)
        });
        if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            if (data.response && data.response.length > 50) {
                return res.status(200).json({ response: data.response, source: 'ollama' });
            }
        }
    } catch (e) { /* Ollama no disponible */ }

    // 2. GEMINI KEY 1
    try {
        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey1}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 1200, topP: 0.95 },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            }),
            signal: AbortSignal.timeout(20000)
        });
        if (gRes.ok) {
            const data = await gRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.length > 50) return res.status(200).json({ response: text, source: 'gemini1' });
        }
    } catch (e) { /* Gemini key 1 falló */ }

    // 3. GEMINI KEY 2
    try {
        const gRes2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey2}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 1200 }
            }),
            signal: AbortSignal.timeout(20000)
        });
        if (gRes2.ok) {
            const data = await gRes2.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.length > 50) return res.status(200).json({ response: text, source: 'gemini2' });
        }
    } catch (e) { /* Gemini key 2 falló */ }

    // 4. POLLINATIONS (MISTRAL - FALLBACK GRATUITO)
    try {
        const pollRes = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: systemPersona }, { role: 'user', content: `Consulta (${type}): ${prompt}` }],
                model: 'mistral', private: true
            }),
            signal: AbortSignal.timeout(15000)
        });
        if (pollRes.ok) {
            const text = await pollRes.text();
            if (text && text.length > 50) return res.status(200).json({ response: text, source: 'pollinations' });
        }
    } catch (e) { /* Pollinations falló */ }

    // 5. RESPUESTA ESTÁTICA DE EMERGENCIA
    const emergencyResponses = {
        'Tarot': '✨ Las cartas vibran con energía poderosa hoy. El universo te envía un mensaje: estás en un momento de transición importante. La carta que has recibido señala que hay fuerzas invisibles trabajando a tu favor. Confía en tu intuición, porque tu alma ya conoce el camino. 🔮 En la tradición cabalística, el Sefirot de Tiferet (belleza/corazón) está activado en tu lectura, indicando que el equilibrio emocional es tu llave maestra ahora. Permítete sentir, porque en la vulnerabilidad se esconde tu mayor fortaleza. Las estrellas revelan que el próximo ciclo lunar traerá una respuesta a tu pregunta más profunda. La acción que se te pide es simple pero poderosa: actúa desde el amor, no desde el miedo.',
        'Carta Natal': '⭐ Tu carta natal es un mapa único del cosmos en el momento exacto de tu llegada a este plano. Los planetas en tus casas revelan un alma que vino con una misión específica de corrección (Tikún). Tu signo solar representa tu ego consciente, mientras que tu luna muestra tus necesidades emocionales más profundas. El ascendente es la máscara que muestras al mundo. Juntos, forman una triada de poder que define tu destino arquetípico. Las influencias planetarias actuales sugieren un período de realineación con tu propósito de vida.',
        'Sueños': '🌙 Tu sueño es un mensaje directo de tu subconsciente profundo. En la tradición cabalística, los sueños son "una sexagésima parte de la profecía" (Talmud). Los símbolos que aparecen en él no son aleatorios, son arquetipos universales de Jung que tu alma está procesando. Lo que sientes en el sueño es más importante que lo que ves. Tu psique está trabajando activamente en la resolución de un conflicto interno que ya casi está resuelto. Confía en el proceso. Tu intuición te guía correctamente.',
        'Horóscopo': '🌟 Las configuraciones planetarias de hoy crean un campo energético único para tu signo. Venus y Marte están formando un ángulo que favorece las conexiones auténticas. Es un día propicio para tomar decisiones que llevas postergando. Tu número vibracional del día te invita a la acción decidida pero compasiva. En el Árbol de la Vida cabalístico, la energía de hoy fluye por el sendero de Hod hacia Netzach, significando que la mente y las emociones deben trabajar en armonía. Aprovecha la mañana para reflexión y la tarde para acción concreta.'
    };

    return res.status(200).json({
        response: emergencyResponses[type] || emergencyResponses['Tarot'],
        source: 'emergency'
    });
}
