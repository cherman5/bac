import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const GATEWAY_URL = (__ENV.GATEWAY_URL || 'http://localhost:8080').replace(/\/$/, '');
export const FRONTEND_URL = (__ENV.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
export const TOKEN = __ENV.TOKEN;
export const AUTH_URL = (__ENV.AUTH_URL || `${GATEWAY_URL}/auth/login`).replace(/\/$/, '');
export const AUTH_USER = __ENV.AUTH_USER;
export const AUTH_PASSWORD = __ENV.AUTH_PASSWORD;
export const INCLUDE_FRONTEND = String(__ENV.INCLUDE_FRONTEND || 'false').toLowerCase() === 'true';

export const serverErrorsOrTimeouts = new Rate('server_errors_or_timeouts');
export const authRequiredResponses = new Rate('auth_required_responses');
export const routeNotFoundResponses = new Rate('route_not_found_responses');
export const backendChecks = new Rate('backend_checks');
export const backendReqFailed = new Rate('backend_req_failed');
export const backendReqDuration = new Trend('backend_req_duration');
export const backendServerErrorsOrTimeouts = new Rate('backend_server_errors_or_timeouts');
export const backendAuthRequiredResponses = new Rate('backend_auth_required_responses');
export const backendRouteNotFoundResponses = new Rate('backend_route_not_found_responses');
let cachedToken = null;

if (!TOKEN && !(AUTH_USER && AUTH_PASSWORD)) {
  console.warn('WARN: TOKEN no definido. Las rutas /api/** del gateway usan AuthFilter; respuestas 400/401/403 se registraran como autenticacion requerida.');
  http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 400, 401, 403));
}

export function authHeaders(token = TOKEN) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function jsonHeaders(token = TOKEN) {
  return { ...authHeaders(token), 'Content-Type': 'application/json' };
}

export function publicParams() {
  return { timeout: '10s' };
}

export function apiParams(token = TOKEN, timeout = '10s') {
  return { headers: authHeaders(token), timeout };
}

export function isSuccess(res) {
  return res.status >= 200 && res.status < 400;
}

export function isAuthRequired(res) {
  return res.status === 400 || res.status === 401 || res.status === 403;
}

export function isAcceptableApiResponse(res, token = TOKEN) {
  if (!token && isAuthRequired(res)) return true;
  return isSuccess(res);
}

export function recordResponse(res) {
  serverErrorsOrTimeouts.add(res.status >= 500 || !!res.error_code);
  authRequiredResponses.add(isAuthRequired(res));
  routeNotFoundResponses.add(res.status === 404);
}

export function recordBackendResponse(res, token = TOKEN) {
  const failed = !isAcceptableApiResponse(res, token) || !!res.error_code;
  backendReqDuration.add(res.timings.duration);
  backendReqFailed.add(failed);
  backendServerErrorsOrTimeouts.add(res.status >= 500 || !!res.error_code);
  backendAuthRequiredResponses.add(isAuthRequired(res));
  backendRouteNotFoundResponses.add(res.status === 404);
}

export function addBackendCheck(value) {
  backendChecks.add(value);
  return value;
}

export function checkPublic(res, name) {
  recordResponse(res);
  check(res, {
    [`${name}: responde 2xx/3xx`]: isSuccess,
    [`${name}: sin 5xx/timeouts`]: (r) => r.status < 500 && !r.error_code,
    [`${name}: ruta existe`]: (r) => r.status !== 404,
  });
}

export function checkApi(res, name, token = TOKEN) {
  recordResponse(res);
  check(res, {
    [`${name}: 2xx/3xx o auth requerida sin TOKEN`]: (r) => isAcceptableApiResponse(r, token),
    [`${name}: sin 5xx/timeouts`]: (r) => r.status < 500 && !r.error_code,
    [`${name}: ruta existe`]: (r) => r.status !== 404,
  });
}

export function checkBackendPublic(res, name) {
  recordResponse(res);
  recordBackendResponse(res, 'public');
  check(res, {
    [`${name}: responde 2xx/3xx`]: (r) => addBackendCheck(isSuccess(r)),
    [`${name}: sin 5xx/timeouts`]: (r) => addBackendCheck(r.status < 500 && !r.error_code),
    [`${name}: ruta existe`]: (r) => addBackendCheck(r.status !== 404),
  });
}

export function checkBackendApi(res, name, token = TOKEN) {
  recordResponse(res);
  recordBackendResponse(res, token);
  check(res, {
    [`${name}: 2xx/3xx o auth requerida sin TOKEN`]: (r) => addBackendCheck(isAcceptableApiResponse(r, token)),
    [`${name}: sin 5xx/timeouts`]: (r) => addBackendCheck(r.status < 500 && !r.error_code),
    [`${name}: ruta existe`]: (r) => addBackendCheck(r.status !== 404),
  });
}

export function getPublic(name, url) {
  const res = http.get(url, publicParams());
  checkPublic(res, name);
  return res;
}

export function getApi(name, path, token = TOKEN, timeout = '10s') {
  const res = http.get(`${GATEWAY_URL}${path}`, apiParams(token, timeout));
  checkApi(res, name, token);
  return res;
}

export function getBackendApi(name, path, token = TOKEN, timeout = '10s') {
  const res = http.get(`${GATEWAY_URL}${path}`, apiParams(token, timeout));
  checkBackendApi(res, name, token);
  return res;
}

export function loginIfConfigured() {
  if (TOKEN) return TOKEN;
  if (!(AUTH_USER && AUTH_PASSWORD)) return null;

  const payload = JSON.stringify({ userName: AUTH_USER, password: AUTH_PASSWORD });
  const res = http.post(AUTH_URL, payload, { headers: jsonHeaders(null), timeout: '10s' });
  checkPublic(res, 'auth login opcional');
  let token = null;
  try {
    token = res.json('token');
  } catch (error) {
    console.warn('WARN: login opcional no devolvio JSON valido. Revisa AUTH_URL y que ms-auth este respondiendo.');
  }
  if (!token) {
    console.warn('WARN: login opcional no devolvio token. Revisa AUTH_URL, AUTH_USER, AUTH_PASSWORD o si el token expiro/debe generarse uno nuevo.');
    return null;
  }
  return token;
}

export function setupAuth() {
  const token = loginIfConfigured();
  return {
    authConfigured: Boolean(TOKEN || (AUTH_USER && AUTH_PASSWORD)),
    tokenFromEnv: Boolean(TOKEN),
    autoLoginValidated: Boolean(token),
  };
}

export function resolveToken(data = {}) {
  if (TOKEN) return TOKEN;
  if (cachedToken) return cachedToken;
  if (data.authConfigured && !data.tokenFromEnv) {
    cachedToken = loginIfConfigured();
  }
  return cachedToken;
}

export const BUSINESS_ENDPOINTS = [
  ['categorias', '/api/categorias'],
  ['productos', '/api/productos'],
  ['stock', '/api/stock'],
  ['clientes', '/api/clientes'],
  ['proveedores', '/api/proveedores'],
  ['compras', '/api/compras'],
  ['ventas', '/api/ventas'],
];
