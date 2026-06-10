import http from 'k6/http';
import { group, sleep } from 'k6';
import {
  BUSINESS_ENDPOINTS,
  FRONTEND_URL,
  GATEWAY_URL,
  INCLUDE_FRONTEND,
  checkBackendPublic,
  getBackendApi,
  getPublic,
  resolveToken,
  setupAuth,
} from './common.js';

export const options = {
  vus: Number(__ENV.VUS || 3),
  duration: __ENV.DURATION || '1m',
  thresholds: {
    backend_req_duration: ['p(95)<3000'],
    backend_req_failed: ['rate<0.05'],
    backend_checks: ['rate>0.95'],
    backend_server_errors_or_timeouts: ['rate<0.01'],
    backend_route_not_found_responses: ['rate<0.01'],
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const token = resolveToken(data);

  if (INCLUDE_FRONTEND) {
    group('frontend opcional', () => {
      getPublic('frontend /', `${FRONTEND_URL}/`);
      getPublic('frontend /login', `${FRONTEND_URL}/login`);
    });
  }

  group('auth publico por gateway', () => {
    const res = http.options(`${GATEWAY_URL}/auth/login`, { timeout: '10s' });
    checkBackendPublic(res, 'gateway /auth/login OPTIONS');
  });

  group('gateway microservicios GET', () => {
    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getBackendApi(name, path, token);
    }
  });

  sleep(1);
}
