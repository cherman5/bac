import { group, sleep } from 'k6';
import { FRONTEND_URL, getPublic } from './common.js';

export const options = {
  vus: Number(__ENV.VUS || 1),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.20'],
    checks: ['rate>0.80'],
    route_not_found_responses: ['rate<0.01'],
  },
};

export default function () {
  group('frontend opcional', () => {
    getPublic('frontend /', `${FRONTEND_URL}/`);
    getPublic('frontend /login', `${FRONTEND_URL}/login`);
  });

  sleep(1);
}
