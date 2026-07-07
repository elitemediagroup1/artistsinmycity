exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 200, body: JSON.stringify({mode:'preview', message:'ANTHROPIC_API_KEY not set. Using preview assistant.'}) };
  return { statusCode: 501, body: JSON.stringify({message:'Wire Anthropic SDK here after installing dependencies.'}) };
};
