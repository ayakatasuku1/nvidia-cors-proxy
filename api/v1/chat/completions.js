export default async function handler(req, res) {
  // Add CORS Headers for JanitorAI
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle browser CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // Forward the request to NVIDIA NIM
    const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(req.body)
    });

    // Get the response text first instead of assuming it's JSON
    const responseText = await nvidiaResponse.text();

    // Set the status code matching NVIDIA's response
    res.status(nvidiaResponse.status);
    res.setHeader('Content-Type', nvidiaResponse.headers.get('content-type') || 'application/json');

    // Return the text directly (whether it's JSON or an error string)
    return res.send(responseText);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
