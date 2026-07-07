/*
 * Recommendation Engine (v3.0) - placeholder foundation
 * -----------------------------------------------------
 * Provides a reusable, clearly-labeled recommendation surface. All results are
 * placeholders for now; hooks are ready for EMG LOOP + Neon later. No fake
 * artists are ever fabricated.
 *
 * Public API: window.Recommendations
 *   getRecommendations(context)
 *   getRoadiePicks(context)
 *   getTrendingCities()
 *   getFeaturedArtForms()
 *   getEmptyRecommendationState()
 */
(function (window) {
  'use strict';

  // Real place/category vocabulary only - never fabricated artist names.
  var TRENDING_CITIES = [
    'Nashville', 'New York', 'Los Angeles', 'Miami', 'Chicago', 'Austin',
    'Atlanta', 'New Orleans', 'Seattle', 'Portland', 'Denver', 'Detroit'
  ];

  var FEATURED_ART_FORMS = [
    'Music', 'Painting', 'Photography', 'Film', 'Dance', 'Comedy',
    'Digital Art', 'Murals', 'Street Art', 'Tattoo', 'Sculpture', 'Poetry'
  ];

  function mem() {
    try { return (window.RoadieMemory && window.RoadieMemory.getMemory()) || null; } catch (e) { return null; }
  }

  function placeholderCard(title, note) {
    return { placeholder: true, title: title, note: note || 'Recommendations will improve as artists join.' };
  }

  function getEmptyRecommendationState() {
    return {
      placeholder: true,
      cards: [
        placeholderCard('First exhibits opening soon', 'Your city is getting its first local artists.'),
        placeholderCard('Roadie is learning your taste', 'Follow artists and save exhibits to personalize this.'),
        placeholderCard('Recommendations will improve as artists join', 'EMG LOOP will power this once live.')
      ]
    };
  }

  function getRoadiePicks(context) {
    var m = mem();
    var basis = m && m.preferredArtForms && m.preferredArtForms.length ? m.preferredArtForms : (context && context.artForms) || [];
    fire('recommendation_viewed', { section: 'roadie_picks' });
    return {
      placeholder: true,
      label: "Roadie's Picks",
      basis: basis,
      cards: [
        placeholderCard("Roadie's Picks are warming up", basis.length
          ? 'Based on your interest in ' + basis.slice(0, 3).join(', ') + '.'
          : 'Tell Roadie what you love and these will sharpen.')
      ]
    };
  }

  function getTrendingCities() {
    return { placeholder: true, label: 'Trending Near You', cities: TRENDING_CITIES.slice() };
  }

  function getFeaturedArtForms() {
    return { placeholder: true, label: 'Featured Art Forms', artForms: FEATURED_ART_FORMS.slice() };
  }

  /**
   * getRecommendations - unified surface used by fan/discovery components.
   * context: { role, city, artForms, section }
   * Returns grouped, clearly-labeled placeholder sections.
   */
  function getRecommendations(context) {
    context = context || {};
    var m = mem();
    var city = context.city || (m && m.selectedCities && m.selectedCities[0]) || null;
    fire('recommendation_viewed', { section: context.section || 'all' });
    return {
      placeholder: true,
      generatedAt: new Date().toISOString(),
      sections: [
        { key: 'because_you_liked', label: 'Because You Liked', cards: getEmptyRecommendationState().cards.slice(0, 1) },
        { key: 'roadie_picks', label: "Roadie's Picks", cards: getRoadiePicks(context).cards },
        { key: 'trending_near_you', label: 'Trending Near You', cities: TRENDING_CITIES.slice(0, 6) },
        { key: 'similar_exhibits', label: 'Similar Exhibits', cards: [placeholderCard('Similar exhibits coming soon')] },
        { key: 'new_in_your_city', label: city ? ('New in ' + city) : 'New in Your City', cards: [placeholderCard('First exhibits opening soon')] },
        { key: 'featured_art_forms', label: 'Featured Art Forms', artForms: FEATURED_ART_FORMS.slice(0, 8) }
      ]
    };
  }

  function fire(name, payload) {
    try {
      if (window.AIMCLoop && typeof window.AIMCLoop.track === 'function') {
        window.AIMCLoop.track(name, payload || {});
      }
    } catch (e) {}
  }

  window.Recommendations = {
    getRecommendations: getRecommendations,
    getRoadiePicks: getRoadiePicks,
    getTrendingCities: getTrendingCities,
    getFeaturedArtForms: getFeaturedArtForms,
    getEmptyRecommendationState: getEmptyRecommendationState
  };

})(window);
