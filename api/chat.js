export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, type, imageBase64 } = req.body;
        const geminiKey1 = process.env.GEMINI_API_KEY;
        const geminiKey2 = process.env.GEMINI_API_KEY2;
        const tunnelUrl  = process.env.OLLAMA_URL || 'http://localhost:11434';

        const systemPersona = `Eres ALMA IA, Sabia de la Cábala, Astróloga y Psicóloga Sistémica. Responde con profundidad y exactitud a esto: ${prompt}`;

        // ── 1. PRIORIDAD: Ollama Local (solo texto, sin imagen) ──
        if (!imageBase64) {
            try {
                const ollamaRes = await fetch(`${tunnelUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                    body: JSON.stringify({ model: 'qwen3.5:0.8b', prompt: systemPersona, stream: false }),
                    signal: AbortSignal.timeout(20000)
                });
                if (ollamaRes.ok) {
                    const data = await ollamaRes.json();
                    return res.status(200).json({ response: data.response, source: 'ollama' });
                }
                console.log(`Ollama falló con status: ${ollamaRes.status}`);
            } catch (e) {
                console.log('Ollama inalcanzable. Pasando a Gemini...');
            }
        }

        // ── 2. RESPALDO: Gemini 1.5 Flash — cicla entre KEY1 y KEY2 ──
        const partsArray = [{ text: systemPersona }];
        if (imageBase64) {
            partsArray.push({
                inlineData: {
                    data: imageBase64.split(',')[1] || imageBase64,
                    mimeType: 'image/jpeg'
                }
            });
        }

        const geminiBody = JSON.stringify({ contents: [{ parts: partsArray }] });
        const geminiModel = 'gemini-1.5-flash';

        for (const key of [geminiKey1, geminiKey2]) {
            if (!key) continue;
            try {
                const gRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: geminiBody,
                        signal: AbortSignal.timeout(25000)
                    }
                );
                if (!gRes.ok) {
                    const errText = await gRes.text();
                    console.log(`Gemini key fallo (${gRes.status}): ${errText}`);
                    continue; // intentar con la siguiente key
                }
                const data = await gRes.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return res.status(200).json({ response: text, source: geminiModel });
                }
            } catch (e) {
                console.log(`Error con key Gemini: ${e.message}`);
            }
        }

        // ── 3. ÚLTIMO RECURSO: Pollinations / Mistral (solo texto) ──
        if (!imageBase64) {
            try {
                const pollRes = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [{ role: 'user', content: systemPersona }], model: 'mistral', seed: 42 }),
                    signal: AbortSignal.timeout(20000)
                });
                if (pollRes.ok) {
                    const pollText = await pollRes.text();
                    if (pollText) return res.status(200).json({ response: pollText, source: 'pollinations' });
                }
            } catch (e) {
                console.log(`Pollinations falló: ${e.message}`);
            }
        }

        // Si es Oráculo y todo falla, lanzar error en lugar de respuesta estática
        if (type === 'Oraculo') {
            return res.status(503).json({ error: 'Todos los servicios de IA están temporalmente no disponibles. Intenta de nuevo en unos minutos.' });
        }

        throw new Error('Todos los proveedores de IA fallaron.');

    } catch (error) {
        return res.status(200).json({ response: `🚨 Error de Conexión: ${error.message}`, source: 'error' });
    }
}
