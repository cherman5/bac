import http from 'k6/http';
import { group, sleep } from 'k6';
import {
  BUSINESS_ENDPOINTS,
  FRONTEND_URL,
  GATEWAY_URL,
  apiParams,
  checkApi,
  checkPublic,
  getApi,
  getPublic,
  resolveToken,
  setupAuth,
} from './common.js';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '3m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.95'],
    server_errors_or_timeouts: ['rate<0.01'],
    route_not_found_responses: ['rate<0.01'],
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const token = resolveToken(data);

  group('flujo usuario sistema completo', () => {
    getPublic('frontend login', `${FRONTEND_URL}/login`);
    getPublic('frontend dashboard', `${FRONTEND_URL}/dashboard`);

    const authProbe = http.options(`${GATEWAY_URL}/auth/login`, { timeout: '10s' });
    checkPublic(authProbe, 'auth login por gateway');

    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getApi(`listar ${name}`, path, token);
    }

    // GET por id solo si se conoce que existen datos semilla:
    // const producto = http.get(`${GATEWAY_URL}/api/productos/1`, apiParams(token));
    // checkApi(producto, 'producto id 1', token);
    // const stock = http.get(`${GATEWAY_URL}/api/stock/1`, apiParams(token));
    // checkApi(stock, 'stock producto 1', token);
  });
  sleep(Math.random() * 3 + 1);
}
