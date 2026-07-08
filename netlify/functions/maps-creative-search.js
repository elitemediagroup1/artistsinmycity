// netlify/functions/maps-creative-search.js
// Server-side Google Places Text Search for local creative places.
// Reads GOOGLE_MAPS_API_KEY from the environment. Never exposed to the browser.
'use strict';

var TEXT_URL = 'https://' + 'maps.googleapis.com' + '/maps/api/place/textsearch/json';
var MAP_PLACE = 'https://' + 'www.google.com' + '/maps/place/?q=place_id:';
var MAX_RESULTS = 12;
var DEFAULT_RADIUS = 8000;
var MAX_RADIUS = 50000;

var CATEGORY_QUERIES = {
  art_gallery: 'art gallery',
  museum: 'museum',
  music_venue: 'live music venue',
  performing_arts: 'performing arts theater',
  art_supply: 'art supply store',
  recording_studio: 'recording studio',
  dance_studio: 'dance studio',
  photography_studio: 'photography studio',
  coffee_shop: 'coffee shop',
  coworking: 'coworking space',
  frame_shop: 'framing shop',
  print_shop: 'print shop'
};

var CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function respond(statusCode, obj) {
  return { statusCode: statusCode, headers: CORS, body: JSON.stringify(obj) };
}

function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }

function normalize(p, category) {
  var loc = (p.geometry && p.geometry.location) ? p.geometry.location : {};
  return {
    name: p.name || '',
    address: p.formatted_address || p.vicinity || '',
    rating: (typeof p.rating === 'number') ? p.rating : null,
    user_ratings_total: (typeof p.user_ratings_total === 'number') ? p.user_ratings_total : null,
    place_id: p.place_id || null,
    lat: num(loc.lat),
    lng: num(loc.lng),
    google_maps_url: p.place_id ? (MAP_PLACE + p.place_id) : null,
    category: category
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });

  var data;
  try { data = JSON.parse(event.body || '{}'); }
  catch (e) { return respond(400, { places: [], error: 'Invalid request' }); }

  var category = (typeof data.category === 'string') ? data.category : '';
  var location = (typeof data.location === 'string') ? data.location.trim().slice(0, 120) : '';
  var lat = num(data.lat);
  var lng = num(data.lng);
  var radius = num(data.radius) || DEFAULT_RADIUS;
  if (radius > MAX_RADIUS) radius = MAX_RADIUS;

  if (!CATEGORY_QUERIES[category]) {
    return respond(400, { places: [], error: 'Unknown category' });
  }
  if (!location && (lat === null || lng === null)) {
    return respond(400, { places: [], error: 'A location or coordinates are required.' });
  }

  var key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return respond(200, { places: [], mode: 'preview', message: 'Local search is not configured yet.' });
  }

  var query = CATEGORY_QUERIES[category];
  if (location) query += ' in ' + location;

  var params = new URLSearchParams();
  params.set('query', query);
  params.set('key', key);
  if (lat !== null && lng !== null) {
    params.set('location', lat + ',' + lng);
    params.set('radius', String(radius));
  }

  var res, payload;
  try {
    res = await fetch(TEXT_URL + '?' + params.toString());
    payload = await res.json();
  } catch (e) {
    return respond(200, { places: [], message: 'Local search is unavailable right now. Please try again.' });
  }

  if (!payload || (payload.status && payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS')) {
    return respond(200, { places: [], message: 'No results found. Try a nearby city or a wider search.' });
  }

  var results = Array.isArray(payload.results) ? payload.results : [];
  var places = results.slice(0, MAX_RESULTS).map(function (p) { return normalize(p, category); });

  if (!places.length) {
    return respond(200, { places: [], message: 'No results found nearby. Try a nearby city or a wider search.' });
  }
  return respond(200, { places: places, category: category });
};
