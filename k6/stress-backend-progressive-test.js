import http from 'k6/http';
import { group, sleep } from 'k6';
import {
  BUSINESS_ENDPOINTS,
  GATEWAY_URL,
  checkBackendPublic,
  getBackendApi,
  resolveToken,
  setupAuth,
} from './common.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    backend_checks: ['rate>0.95'],
    backend_req_failed: ['rate<0.05'],
    backend_req_duration: ['p(95)<3000'],
    backend_server_errors_or_timeouts: ['rate<0.01'],
    backend_route_not_found_responses: ['rate<0.01'],
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const token = resolveToken(data);

  group('auth publico por gateway', () => {
    const res = http.options(`${GATEWAY_URL}/auth/login`, { timeout: '10s' });
    checkBackendPublic(res, 'gateway /auth/login OPTIONS');
  });

  group('backend completo por gateway', () => {
    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getBackendApi(name, path, token, '15s');
    }
  });

  sleep(Math.random() * 2 + 1);
}
