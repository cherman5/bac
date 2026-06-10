import { group, sleep } from 'k6';
import { BUSINESS_ENDPOINTS, FRONTEND_URL, getApi, getPublic, resolveToken, setupAuth } from './common.js';

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

  group('carga normal sistema completo', () => {
    getPublic('frontend', `${FRONTEND_URL}/`);
    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getApi(name, path, token);
    }
  });
  sleep(Math.random() * 2 + 1);
}
