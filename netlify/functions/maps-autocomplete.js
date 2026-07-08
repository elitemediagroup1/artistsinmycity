// netlify/functions/maps-autocomplete.js
// Server-side Google Places Autocomplete for city / ZIP suggestions.
// Reads GOOGLE_MAPS_API_KEY from the environment. Never exposed to the browser.
'use strict';

var AC_URL = 'https://' + 'maps.googleapis.com' + '/maps/api/place/autocomplete/json';
var MIN_LEN = 3;
var MAX_LEN = 120;

var CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function respond(statusCode, obj) {
  return { statusCode: statusCode, headers: CORS, body: JSON.stringify(obj) };
}

// Map requested types to a single Google-supported type.
function googleType(types) {
  if (!Array.isArray(types)) return '(regions)';
  if (types.indexOf('zip') !== -1 || types.indexOf('postal_code') !== -1) return 'geocode';
  if (types.indexOf('city') !== -1 || types.indexOf('cities') !== -1) return '(cities)';
  return '(regions)';
}

function looksLikeState(v) {
  return typeof v === 'string' && v.length === 2 && v === v.toUpperCase();
}

function normalize(pred) {
  var terms = Array.isArray(pred.terms) ? pred.terms.map(function (t) { return t.value; }) : [];
  var city = terms.length ? terms[0] : null;
  var state = null;
  var zip = null;
  for (var i = 0; i < terms.length; i++) {
    if (looksLikeState(terms[i])) state = terms[i];
    if (/^[0-9]{5}$/.test(terms[i])) zip = terms[i];
  }
  var main = (pred.structured_formatting && pred.structured_formatting.main_text) || pred.description || '';
  return {
    label: main,
    place_id: pred.place_id || null,
    description: pred.description || main,
    city: city,
    state: state,
    zip: zip
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });

  var data;
  try { data = JSON.parse(event.body || '{}'); }
  catch (e) { return respond(400, { predictions: [], error: 'Invalid request' }); }

  var input = (typeof data.input === 'string') ? data.input.trim().slice(0, MAX_LEN) : '';
  var country = (typeof data.country === 'string') ? data.country.slice(0, 2).toLowerCase() : 'us';
  var type = googleType(data.types);

  if (input.length < MIN_LEN) return respond(200, { predictions: [] });

  var key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return respond(200, { predictions: [], mode: 'preview' });

  var params = new URLSearchParams();
  params.set('input', input);
  params.set('key', key);
  params.set('types', type);
  params.set('components', 'country:' + country);

  var res, payload;
  try {
    res = await fetch(AC_URL + '?' + params.toString());
    payload = await res.json();
  } catch (e) {
    return respond(200, { predictions: [], error: 'Suggestions are unavailable right now.' });
  }

  if (!payload || (payload.status && payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS')) {
    return respond(200, { predictions: [] });
  }

  var preds = Array.isArray(payload.predictions) ? payload.predictions.slice(0, 6).map(normalize) : [];
  return respond(200, { predictions: preds });
};
