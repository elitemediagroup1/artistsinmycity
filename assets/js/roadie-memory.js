/*
 * Roadie Memory (v3.0)
 * --------------------
 * Client-side memory for Roadie so the platform feels personal. Uses
 * localStorage now; the same interface will later be backed by Neon.
 *
 * Public API: window.RoadieMemory
 *   getMemory()                -> full memory object
 *   setMemory(key, value)      -> set a single key
 *   updateMemory(partial)      -> shallow-merge a partial object
 *   clearMemory()              -> reset to defaults
 *   rememberSearch(query)
 *   rememberCity(city)
 *   rememberArtForm(artForm)
 *   rememberTheme(theme)
 *   rememberRoadieMessage(message)
 *   getPersonalizedGreeting()  -> role-aware greeting string
 *
 * No backend required. No PII beyond what the user enters locally.
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'aimc.roadie.memory.v1';
  var MAX_LIST = 12;

  function defaults() {
    return {
      role: 'public',                 // 'public' | 'fan' | 'artist'
      preferredArtForms: [],
      selectedCities: [],
      favoriteThemes: [],
      recentSearches: [],
      recentRoadieMessages: [],
      onboardingProgress: { step: 0, completed: false },
      lastVisitedPages: [],
      artistPublishingHistory: [],    // placeholder
      fanFollowingInterests: [],      // placeholder
      updatedAt: null
    };
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { return defaults(); }
      var parsed = JSON.parse(raw);
      // merge with defaults so new keys are always present
      var base = defaults();
      for (var k in parsed) { if (Object.prototype.hasOwnProperty.call(parsed, k)) { base[k] = parsed[k]; } }
      return base;
    } catch (e) { return defaults(); }
  }

  function write(mem) {
    try {
      mem.updatedAt = new Date().toISOString();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
    } catch (e) { /* storage may be unavailable; fail silently */ }
    fireLoop('roadie_memory_updated', { keys: Object.keys(mem) });
    return mem;
  }

  function fireLoop(name, payload) {
    try {
      if (window.AIMCLoop && typeof window.AIMCLoop.track === 'function') {
        window.AIMCLoop.track(name, payload || {});
      } else if (typeof window.aimcTrack === 'function') {
        window.aimcTrack(name, payload || {});
      }
    } catch (e) {}
  }

  function pushUnique(list, value, max) {
    if (value == null || value === '') { return list; }
    list = list.filter(function (v) { return v !== value; });
    list.unshift(value);
    if (list.length > (max || MAX_LIST)) { list = list.slice(0, max || MAX_LIST); }
    return list;
  }

  // ---- Public methods ----
  function getMemory() { return read(); }

  function setMemory(key, value) {
    var mem = read();
    mem[key] = value;
    return write(mem);
  }

  function updateMemory(partial) {
    var mem = read();
    if (partial && typeof partial === 'object') {
      for (var k in partial) { if (Object.prototype.hasOwnProperty.call(partial, k)) { mem[k] = partial[k]; } }
    }
    return write(mem);
  }

  function clearMemory() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    return write(defaults());
  }

  function rememberSearch(query) {
    var mem = read();
    mem.recentSearches = pushUnique(mem.recentSearches, String(query || '').trim(), MAX_LIST);
    fireLoop('roadie_preference_saved', { type: 'search' });
    return write(mem);
  }

  function rememberCity(city) {
    var mem = read();
    mem.selectedCities = pushUnique(mem.selectedCities, city, MAX_LIST);
    fireLoop('roadie_preference_saved', { type: 'city' });
    return write(mem);
  }

  function rememberArtForm(artForm) {
    var mem = read();
    mem.preferredArtForms = pushUnique(mem.preferredArtForms, artForm, MAX_LIST);
    fireLoop('roadie_preference_saved', { type: 'art_form' });
    return write(mem);
  }

  function rememberTheme(theme) {
    var mem = read();
    mem.favoriteThemes = pushUnique(mem.favoriteThemes, theme, MAX_LIST);
    fireLoop('roadie_preference_saved', { type: 'theme' });
    return write(mem);
  }

  function rememberRoadieMessage(message) {
    var mem = read();
    mem.recentRoadieMessages = pushUnique(mem.recentRoadieMessages, String(message || '').slice(0, 280), MAX_LIST);
    return write(mem);
  }

  function getPersonalizedGreeting() {
    var mem = read();
    var role = mem.role || 'public';
    var hasHistory = (mem.recentSearches.length + mem.selectedCities.length + mem.preferredArtForms.length) > 0;
    if (role === 'artist') {
      return 'Welcome back. Ready to improve your exhibit today?';
    }
    if (role === 'fan') {
      if (mem.selectedCities.length) {
        return 'Welcome back. Want to see what\u2019s new in your favorite cities?';
      }
      return 'Welcome back. Want to see what\u2019s new near you?';
    }
    // public
    if (hasHistory) {
      return 'Hey again! Want to pick up where you left off?';
    }
    return '\uD83C\uDFB8 Hey! I\u2019m Roadie. Want to explore artists near you?';
  }

  // Track last visited page automatically (non-fatal).
  try {
    var mem = read();
    var here = window.location && window.location.pathname ? window.location.pathname : '';
    if (here) { mem.lastVisitedPages = pushUnique(mem.lastVisitedPages, here, 8); write(mem); }
  } catch (e) {}

  window.RoadieMemory = {
    getMemory: getMemory,
    setMemory: setMemory,
    updateMemory: updateMemory,
    clearMemory: clearMemory,
    rememberSearch: rememberSearch,
    rememberCity: rememberCity,
    rememberArtForm: rememberArtForm,
    rememberTheme: rememberTheme,
    rememberRoadieMessage: rememberRoadieMessage,
    getPersonalizedGreeting: getPersonalizedGreeting
  };

})(window);
