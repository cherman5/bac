import { group, sleep } from 'k6';
import { BUSINESS_ENDPOINTS, FRONTEND_URL, getApi, getPublic, resolveToken, setupAuth } from './common.js';

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '15m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.95'],
    server_errors_or_timeouts: ['rate<0.02'],
    route_not_found_responses: ['rate<0.01'],
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const token = resolveToken(data);

  group('resistencia sistema completo', () => {
    getPublic('frontend', `${FRONTEND_URL}/`);
    for (const [name, path] of BUSINESS_ENDPOINTS) {
      getApi(name, path, token, '15s');
    }
  });
  sleep(Math.random() * 4 + 1);
}
