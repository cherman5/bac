import { group, sleep } from 'k6';
import { BUSINESS_ENDPOINTS, FRONTEND_URL, getApi, getPublic, resolveToken, setupAuth } from './common.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '3m', target: 200 },
    { duration: '3m', target: 300 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.95'],
    server_errors_or_timeouts: ['rate<0.05'],
    route_not_found_responses: ['rate<0.01'],
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const token = resolveToken(data);

  group('stress sistema completo por gateway', () => {
    getPublic('frontend', `${FRONTEND_URL}/`);
    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getApi(name, path, token, '15s');
    }
  });
  sleep(Math.random() * 2 + 1);
}
