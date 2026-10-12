export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // Log what headers and body we received to debug
    console.log("Authorization Header present:", !!req.headers.authorization);

    const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(req.body)
    });

    const responseText = await nvidiaResponse.text();

    // If NVIDIA returned an error, wrap it nicely so JanitorAI displays it readable instead of crashing
    if (!nvidiaResponse.ok) {
      return res.status(nvidiaResponse.status).json({
        error: `NVIDIA API Error (${nvidiaResponse.status}): ${responseText}`
      });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    return res.send(responseText);

  } catch (error) {
    return res.status(500).json({ error: "Proxy Crash: " + error.message });
  }
}
