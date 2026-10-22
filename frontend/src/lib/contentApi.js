import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

const endpoints = { services: '/api/services', portfolio: '/api/portfolio', blog: '/api/blog', careers: '/api/careers' };

export function useContentList(type, fallback, filters = {}) {
  const [items, setItems] = useState(fallback);
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(JSON.parse(filterKey));
    apiRequest(`${endpoints[type]}${query.toString() ? `?${query}` : ''}`)
      .then(result => { if (active && Array.isArray(result.items) && result.items.length) setItems(result.items); })
      .catch(() => { if (active) setItems(fallback); });
    return () => { active = false; };
  }, [type, filterKey, fallback]);
  return { items, source: items === fallback ? 'local-fallback' : 'api' };
}

export function useContentItem(type, slug, fallback) {
  const [item, setItem] = useState(() => fallback.find(entry => entry.slug === slug) || null);
  useEffect(() => {
    let active = true;
    setItem(fallback.find(entry => entry.slug === slug) || null);
    if (!slug || !endpoints[type]) return () => { active = false; };
    apiRequest(`${endpoints[type]}/${encodeURIComponent(slug)}`)
      .then(result => { if (active && result.item) setItem(result.item); })
      .catch(() => { if (active) setItem(fallback.find(entry => entry.slug === slug) || null); });
    return () => { active = false; };
  }, [type, slug, fallback]);
  return item;
}
