const URLS = {
  auth: 'https://functions.poehali.dev/2da86bc8-90d0-4539-9c22-0b2081feff00',
  cabinet: 'https://functions.poehali.dev/df5e50b4-0833-41ec-9193-c55b262d0922',
  bookings: 'https://functions.poehali.dev/5d581a6a-5e9f-4cd1-acb3-e58d1b4e4b13',
  orders: 'https://functions.poehali.dev/e55be9b4-4175-45e0-a24b-564dbaf9b77b',
};

async function post(url: string, body: object, userId?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['X-User-Id'] = userId;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return res.json();
}

async function get(url: string, params?: Record<string, string>, userId?: string) {
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(url + query, { headers });
  return res.json();
}

async function put(url: string, body: object, userId?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['X-User-Id'] = userId;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  return res.json();
}

// Auth
export const authApi = {
  login: (phone: string, password: string) =>
    post(URLS.auth, { action: 'login', phone, password }),
  register: (phone: string, password: string, name: string) =>
    post(URLS.auth, { action: 'register', phone, password, name }),
};

// Cabinet
export const cabinetApi = {
  getCar: (userId: string) =>
    get(URLS.cabinet, { action: 'get_car' }, userId),
  getHistory: (userId: string) =>
    get(URLS.cabinet, { action: 'get_history' }, userId),
  saveCar: (userId: string, car: object) =>
    post(URLS.cabinet + '?action=save_car', car, userId),
};

// Bookings
export const bookingsApi = {
  create: (data: { name: string; phone: string; service: string; date: string; time: string; comment?: string }, userId?: string) =>
    post(URLS.bookings, data, userId),
};

// Orders (admin)
export const ordersApi = {
  getAll: (status?: string) =>
    get(URLS.orders, status && status !== 'all' ? { status } : undefined),
  create: (data: object) =>
    post(URLS.orders, data),
  updateStatus: (id: number, status: string) =>
    put(URLS.orders, { action: 'status', id, status }),
  update: (id: number, data: object) =>
    put(URLS.orders, { action: 'update', id, ...data }),
};
