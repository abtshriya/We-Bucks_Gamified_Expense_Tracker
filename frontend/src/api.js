// backend api helper functions
const BASE_URL = 'http://127.0.0.1:8000/api';

// generic fetch wrapper with error parsing
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Request failed [${res.status}]:`, errorText);
    let parsed;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      // If error is HTML (e.g. Django debug page), extract title or friendly message
      const match = errorText.match(/<title>(.*?)<\/title>/i);
      const friendlyTitle = match ? match[1].replace(/&amp;/g, '&') : null;
      parsed = { detail: friendlyTitle || `Server error (${res.status})` };
    }
    throw new Error(parsed.detail || parsed.error || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// user settings
export function getSettings() {
  return request('/settings/');
}

export function updateSettings(data) {
  return request('/settings/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function resetDefaults() {
  return request('/settings/reset/', {
    method: 'POST',
  });
}

// dashboard summary stats
export function getDashboardSummary() {
  return request('/dashboard/summary/');
}

// expenses
export function getExpenses(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, v);
    }
  });
  const qs = query.toString();
  return request(`/expenses/${qs ? `?${qs}` : ''}`);
}

export function createExpense(data) {
  return request('/expenses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateExpense(id, data) {
  return request(`/expenses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}/`, {
    method: 'DELETE',
  });
}

// subscriptions
export function getSubscriptions() {
  return request('/subscriptions/');
}

export function createSubscription(data) {
  return request('/subscriptions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSubscription(id, data) {
  return request(`/subscriptions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteSubscription(id) {
  return request(`/subscriptions/${id}/`, {
    method: 'DELETE',
  });
}

export function rateSubscription(id, ratingData) {
  return request(`/subscriptions/${id}/rate/`, {
    method: 'POST',
    body: JSON.stringify(ratingData),
  });
}
