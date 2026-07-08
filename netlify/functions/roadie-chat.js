// netlify/functions/roadie-chat.js
// Server-side Roadie endpoint for ArtistsInMyCity.
// Reads ANTHROPIC_API_KEY from the environment. The key is never sent to the browser.
'use strict';

var ANTHROPIC_HOST = 'https://' + 'api.anthropic.com' + '/v1/messages';
var PRIMARY_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
var FALLBACK_MODELS = ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307', 'claude-3-sonnet-20240229'];
var MAX_MESSAGE_LEN = 2000;
var ALLOWED_ROLES = ['public', 'artist', 'fan', 'creator', 'admin'];
var NL = String.fromCharCode(10);

var SYSTEM_PROMPT = [
  'You are Roadie, the AI Creative Guide and City Concierge for ArtistsInMyCity.',
  'You help fans discover artists, art forms, cities, exhibits, venues, galleries, museums, events, and creative experiences.',
  'You help artists build better digital exhibits, organize their work, write artist statements, improve discoverability, prepare launches, understand their audience, and grow their creative career.',
  'You are friendly, energetic, clear, and practical.',
  'You never say "as an AI".',
  'You never pretend to have live data unless it is provided in the context.',
  'You never invent real artists, real events, venues, or prices.',
  'If live data is not available, say that clearly and suggest the next action.',
  'Use simple language. Keep answers concise unless the user asks for detail.',
  'When helping artists, speak like a creative director and supportive tour manager.',
  'When helping fans, speak like a local arts concierge.',
  'Always use ArtistsInMyCity product language: Digital Exhibit, My Studio, Collections, Audience, Roadie, EMG LOOP.'
].join(NL);

var CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function respond(statusCode, obj) {
  return { statusCode: statusCode, headers: CORS, body: JSON.stringify(obj) };
}

function suggestFor(role) {
  if (role === 'artist' || role === 'creator') {
    return ['Review My Exhibit', 'Generate Artist Statement', 'Prepare For Launch'];
  }
  return ['Find Artists', 'Explore Cities', 'Find Events'];
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });

  var data;
  try { data = JSON.parse(event.body || '{}'); }
  catch (e) { return respond(400, { reply: 'I could not read that request. Please try again.', suggestions: [], mode: 'error' }); }

  var message = (typeof data.message === 'string') ? data.message.trim() : '';
  var role = (ALLOWED_ROLES.indexOf(data.role) !== -1) ? data.role : 'public';
  var page = (typeof data.page === 'string') ? data.page.slice(0, 300) : '';
  var context = (data.context && typeof data.context === 'object') ? data.context : {};
  var memory = (data.memory && typeof data.memory === 'object') ? data.memory : {};

  if (!message) return respond(400, { reply: 'Ask me anything about artists, cities, exhibits or events!', suggestions: [], mode: 'empty' });
  if (message.length > MAX_MESSAGE_LEN) return respond(400, { reply: 'That message is a bit long. Try trimming it down.', suggestions: [], mode: 'too_long' });

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return respond(200, {
      reply: 'Roadie live AI is not configured yet, but I can still point you to Artists, Cities and Events from the menu.',
      suggestions: ['Find Artists', 'Explore Cities', 'Find Events'],
      mode: 'preview'
    });
  }

  var ctxLines = [];
  ctxLines.push('User role: ' + role);
  if (page) ctxLines.push('Current page: ' + page);
  if (memory.selectedCities && memory.selectedCities.length) ctxLines.push('Recent cities: ' + memory.selectedCities.slice(0, 5).join(', '));
  if (memory.preferredArtForms && memory.preferredArtForms.length) ctxLines.push('Preferred art forms: ' + memory.preferredArtForms.slice(0, 5).join(', '));
  if (context && Object.keys(context).length) {
    try { ctxLines.push('Page context: ' + JSON.stringify(context).slice(0, 1400)); } catch (e) {}
  }
  var contextBlock = ctxLines.length ? (NL + NL + 'Current session context (do not invent anything beyond this):' + NL + ctxLines.join(NL)) : '';

  function callAnthropic(model){
    return fetch(ANTHROPIC_HOST, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: model, max_tokens: 800, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: message + contextBlock }] })
    }).then(function(res){ return res.json().then(function(body){ return { ok: res.ok, status: res.status, body: body }; }); });
  }

  var candidates = [PRIMARY_MODEL].concat(FALLBACK_MODELS);
  var result = null;
  var attempts = [];
  try {
    for (var ci = 0; ci < candidates.length; ci++){
      result = await callAnthropic(candidates[ci]);
      var et = (result.body && result.body.error && result.body.error.type) ? result.body.error.type : '';
      var em = (result.body && result.body.error && result.body.error.message) ? String(result.body.error.message).slice(0,80) : '';
      attempts.push({ model: candidates[ci], status: result.status, type: et, msg: em });
      if (result.ok) break;
      if (result.status !== 404 && et !== 'not_found_error') break;
    }
  } catch (e) {
    return respond(200, { reply: 'Roadie is tuning up backstage. Try again in a moment.', suggestions: [], mode: 'error', debug: { where: 'fetch', msg: String(e && e.message).slice(0,120), attempts: attempts } });
  }

  if (!result || !result.ok) {
    return respond(200, { reply: 'Roadie is tuning up backstage. Try again in a moment.', suggestions: [], mode: 'error', debug: { attempts: attempts } });
  }
  var payload = result.body;

  var reply = '';
  try {
    if (payload && Array.isArray(payload.content)) {
      reply = payload.content
        .filter(function (b) { return b && b.type === 'text'; })
        .map(function (b) { return b.text; })
        .join(NL)
        .trim();
    }
  } catch (e) {}
  if (!reply) reply = 'I am here to help. Could you rephrase that?';

  var mode = (role === 'artist' || role === 'creator') ? 'studio' : 'concierge';
  return respond(200, { reply: reply, suggestions: suggestFor(role), mode: mode });
};
