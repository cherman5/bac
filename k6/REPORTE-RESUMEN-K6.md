# Reporte Resumen K6 - Chinito Importaciones

## Carpetas Detectadas

- `config-data`
- `ms-auth`
- `ms-config-server`
- `ms-gateway-service`
- `ms-registry-server`
- `ms-categoria-prueba`
- `ms_producto-prueba`
- `ms_inventario-prueba`
- `ms_cliente-prueba`
- `ms_proveedor-prueba`
- `ms_compra-prueba`
- `ms_venta-prueba`
- `frontend-chinito-import-Despilegue-de-Software-2026-main`
- `Swager links.txt`
- `k6`

Nota: el nombre en disco es `config-data`, aunque en la solicitud se menciona `config_data`.

## Configuracion Real Detectada

| Componente | Servicio | Puerto | Observaciones |
| --- | --- | ---: | --- |
| Config Server | `ms-config-server` | 7071 | Config server protegido por credenciales locales; no documentar valores reales en reportes. |
| Registry Server | `ms-registry-server` | 8090 | Eureka en `http://localhost:8090/eureka`. |
| API Gateway | `ms-gateway-service` | 8080 | Rutas por `lb://` y discovery locator habilitado. |
| Auth | `ms-auth-service` | 8085 | Login y validacion JWT. Swagger correcto en `/swagger-ui/index.html`. |
| Categorias | `ms-categoria-service` | 8081 | Swagger en `/doc/swagger-ui.html`. |
| Productos | `ms-producto-service` | 8082 | Swagger en `/doc/swagger-ui.html`. |
| Inventario | `ms-inventario-service` | 8083 | Swagger en `/doc/swagger-ui.html`. |
| Ventas | `ms-venta-service` | 8084 | Swagger en `/doc/swagger-ui.html`. |
| Clientes | `ms-cliente-service` | 8086 | Swagger en `/doc/swagger-ui.html`. |
| Proveedores | `ms-proveedor-service` | 8087 | Swagger en `/doc/swagger-ui.html`. |
| Compras | `ms-compra-service` | 8088 | Swagger en `/doc/swagger-ui.html`. |

## Rutas Confirmadas Por Gateway

`config-data/ms-gateway-service.yml` confirma estas rutas:

| Gateway | Servicio destino | JWT |
| --- | --- | --- |
| `/auth/**` | `lb://ms-auth-service` | No, sin `AuthFilter` |
| `/api/clientes/**` | `lb://ms-cliente-service` | Si, `AuthFilter` |
| `/api/categorias/**` | `lb://ms-categoria-service` | Si, `AuthFilter` |
| `/api/proveedores/**` | `lb://ms-proveedor-service` | Si, `AuthFilter` |
| `/api/compras/**` | `lb://ms-compra-service` | Si, `AuthFilter` |
| `/api/stock/**` | `lb://ms-inventario-service` | Si, `AuthFilter` |
| `/api/productos/**` | `lb://ms-producto-service` | Si, `AuthFilter` |
| `/api/ventas/**` | `lb://ms-venta-service` | Si, `AuthFilter` |

El `AuthFilter` exige header `Authorization: Bearer ${TOKEN}`. Si falta el header o el formato no es Bearer, responde `400 Bad Request`. La validacion se delega a `ms-auth-service` usando `POST /auth/validate?token=...`.

## Endpoint Real De Login

- Directo: `POST http://localhost:8085/auth/login`
- Gateway: `POST http://localhost:8080/auth/login`
- Body:

```json
{
  "userName": "usuario_prueba",
  "password": "password_prueba"
}
```

- Respuesta esperada:

```json
{
  "token": "JWT_TEMPORAL"
}
```

No guardar ni imprimir tokens reales completos.

## Endpoints Detectados Por Microservicio

| Microservicio | Endpoints |
| --- | --- |
| `ms-categoria-service` | `GET /api/categorias`, `GET /api/categorias/{id}`, `POST /api/categorias`, `PUT /api/categorias/{id}`, `DELETE /api/categorias/{id}` |
| `ms-producto-service` | `GET /api/productos`, `GET /api/productos/{id}`, `POST /api/productos`, `PUT /api/productos/{id}`, `DELETE /api/productos/{id}`, `PUT /api/productos/{id}/precio?precioVenta=...` |
| `ms-inventario-service` | `GET /api/stock`, `GET /api/stock/{productoId}`, `POST /api/stock`, `PUT /api/stock/{productoId}`, `PUT /api/stock/{productoId}/reservar?cantidad=...`, `PUT /api/stock/{productoId}/reponer` |
| `ms-cliente-service` | `GET /api/clientes`, `GET /api/clientes/{id}`, `POST /api/clientes`, `PUT /api/clientes/{id}`, `DELETE /api/clientes/{id}` |
| `ms-proveedor-service` | `GET /api/proveedores`, `GET /api/proveedores/{id}`, `POST /api/proveedores`, `PUT /api/proveedores/{id}`, `DELETE /api/proveedores/{id}` |
| `ms-compra-service` | `GET /api/compras`, `GET /api/compras/{id}`, `POST /api/compras`, `PUT /api/compras/{id}`, `DELETE /api/compras/{id}` |
| `ms-venta-service` | `GET /api/ventas`, `GET /api/ventas/{id}`, `POST /api/ventas` |
| `ms-auth-service` | `POST /auth/login`, `POST /auth/validate`, `POST /auth/create` |

## Links Swagger Correctos

| Servicio | Swagger UI | OpenAPI JSON | Estado |
| --- | --- | --- | --- |
| ms-categoria-service | http://localhost:8081/doc/swagger-ui.html | http://localhost:8081/v3/api-docs | Confirmado por config |
| ms-producto-service | http://localhost:8082/doc/swagger-ui.html | http://localhost:8082/v3/api-docs | Confirmado por config |
| ms-inventario-service | http://localhost:8083/doc/swagger-ui.html | http://localhost:8083/v3/api-docs | Confirmado por config |
| ms-venta-service | http://localhost:8084/doc/swagger-ui.html | http://localhost:8084/v3/api-docs | Confirmado por config |
| ms-cliente-service | http://localhost:8086/doc/swagger-ui.html | http://localhost:8086/v3/api-docs | Confirmado por config |
| ms-proveedor-service | http://localhost:8087/doc/swagger-ui.html | http://localhost:8087/v3/api-docs | Confirmado por config |
| ms-compra-service | http://localhost:8088/doc/swagger-ui.html | http://localhost:8088/v3/api-docs | Confirmado por config |
| ms-auth-service | http://localhost:8085/swagger-ui/index.html | http://localhost:8085/v3/api-docs | Confirmado visualmente por usuario |
| ms-gateway-service | No confirmado | No confirmado | Pendiente |

Ver detalle en `SWAGGER-LINKS.md`.

Titulos OpenAPI esperados:

| Servicio | Titulo |
| --- | --- |
| ms-categoria-service | `OPEN API MICROSERVICIO CATEGORIA` |
| ms-producto-service | `OPEN API MICROSERVICIO PRODUCTO` |
| ms-inventario-service | `OPEN API MICROSERVICIO INVENTARIO` |
| ms-venta-service | `OPEN API MICROSERVICIO VENTA` |
| ms-cliente-service | `OPEN API MICROSERVICIO CLIENTE` |
| ms-proveedor-service | `OPEN API MICROSERVICIO PROVEEDOR` |
| ms-compra-service | `OPEN API MICROSERVICIO COMPRA` |
| ms-auth-service | `OPEN API MICROSERVICIO AUTH` |

Comandos PowerShell para verificar titulos desde OpenAPI JSON:

```powershell
(Invoke-RestMethod http://localhost:8081/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8082/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8083/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8084/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8085/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8086/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8087/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8088/v3/api-docs).info.title
```

## Archivos K6 Actualizados

- `common.js`
- `smoke-test.js`
- `load-test.js`
- `load-test-sistema.js`
- `stress-test.js`
- `endurance-test.js`
- `spike-test.js`
- `README.md`
- `SWAGGER-LINKS.md`
- `ENDPOINTS-DESCRIPCION.md`
- `REPORTE-RESUMEN-K6.md`
- `resultados/`

## Cambios Para Login Automatico K6

- Si existe `TOKEN`, se usa `Authorization: Bearer ${TOKEN}`.
- Si no existe `TOKEN` pero existen `AUTH_URL`, `AUTH_USER` y `AUTH_PASSWORD`, K6 hace login automatico contra `/auth/login`.
- `setup()` valida que el login responda, pero no devuelve el JWT para evitar que `--summary-export` lo persista.
- Cada VU resuelve el JWT en memoria cuando necesita llamar rutas `/api/**`.
- No se guardan credenciales ni tokens reales en archivos de codigo o documentacion.

## Separacion Backend Y Frontend

- La prueba principal de humo y rendimiento del backend ahora es `smoke-backend-test.js`.
- `smoke-backend-test.js` prueba solo `auth/login` por Gateway y los endpoints `/api/**` principales.
- `load-backend-sistema-test.js` mide carga normal backend-only por Gateway con 10, 25, 50 y 100 VUs.
- `stress-backend-progressive-test.js` mide carga progresiva backend-only hasta 300 VUs y no debe ejecutarse automaticamente.
- `stress-backend-limit-3000-test.js` mide carga progresiva backend-only hasta 3000 VUs y no debe ejecutarse automaticamente.
- `smoke-test.js` conserva compatibilidad, pero por defecto usa `INCLUDE_FRONTEND=false`.
- Si se define `INCLUDE_FRONTEND=true`, `smoke-test.js` agrega llamadas al frontend como verificacion opcional; los thresholds principales usan metricas `backend_*`, incluyendo `backend_req_duration`.
- `smoke-frontend-test.js` queda como prueba separada para `http://localhost:4200/` y `http://localhost:4200/login`.
- Esto evita que fallos del servidor Angular afecten la medicion del backend. K6 mide peticiones HTTP y el API Gateway representa la entrada real hacia los microservicios.

## Consumos Entre Servicios Detectados

| Componente | Consumo confirmado | Observacion |
| --- | --- | --- |
| `ms-gateway-service` | `ms-auth-service /auth/validate` | `AuthFilter` valida JWT antes de enrutar `/api/**`. |
| `ms-producto-service` | `ms-categoria-service` | Valida/consulta categorias desde cliente Feign. |
| `ms-inventario-service` | `ms-producto-service` | Consulta productos para operaciones de stock. |
| `ms-compra-service` | proveedor, producto e inventario | Registra compras y actualiza informacion relacionada. |
| `ms-venta-service` | cliente, producto e inventario | Registra ventas y valida/actualiza stock relacionado. |
| `ms-cliente-service` | API externa SUNAT-like | Cliente HTTP detectado para DNI/RUC; uso exacto pendiente de verificar. |
| `ms-proveedor-service` | API externa SUNAT-like | Cliente HTTP detectado para DNI/RUC; uso exacto pendiente de verificar. |

## Comandos Finales

```powershell
cd D:\k6-sistema-chinito\k6
$env:GATEWAY_URL="http://localhost:8080"
$env:AUTH_URL="http://localhost:8080/auth/login"
$env:AUTH_USER="USUARIO_DE_PRACTICA"
$env:AUTH_PASSWORD="PASSWORD_DE_PRACTICA"
k6 run --summary-export .\resultados\resultado-smoke-backend.json .\smoke-backend-test.js
```

Load backend sistema:

```powershell
k6 run --summary-export .\resultados\resultado-load-backend-sistema.json .\load-backend-sistema-test.js
```

Stress backend progresivo:

```powershell
k6 run --summary-export .\resultados\resultado-stress-backend-progressive.json .\stress-backend-progressive-test.js
```

Limite backend progresivo hasta 3000 usuarios:

```powershell
k6 run --summary-export .\resultados\resultado-stress-backend-limit-3000.json .\stress-backend-limit-3000-test.js
```

Frontend opcional:

```powershell
$env:FRONTEND_URL="http://localhost:4200"
$env:INCLUDE_FRONTEND="true"
k6 run --summary-export .\resultados\resultado-smoke-frontend.json .\smoke-frontend-test.js
```

Pruebas pesadas, solo con autorizacion:

```powershell
k6 run --summary-export .\resultados\resultado-stress.json .\stress-test.js
k6 run --summary-export .\resultados\resultado-spike.json .\spike-test.js
k6 run --summary-export .\resultados\resultado-endurance.json .\endurance-test.js
```

## Pruebas Ejecutadas

- `k6 inspect .\smoke-test.js`: exitoso, valida opciones/imports.
- `k6 inspect .\smoke-backend-test.js`: exitoso, valida opciones/imports y thresholds `backend_*`.
- `k6 inspect .\smoke-frontend-test.js`: exitoso, valida opciones/imports del frontend opcional.
- `k6 inspect .\load-backend-sistema-test.js`: exitoso, valida stages 10/25/50/100 VUs y thresholds `backend_*`.
- `k6 inspect .\stress-backend-progressive-test.js`: exitoso, valida stages 10/25/50/100/150/200/300 VUs y thresholds `backend_*`.
- `k6 inspect .\stress-backend-limit-3000-test.js`: exitoso, valida stages 100/300/500/1000/1500/2000/2500/3000 VUs y thresholds `backend_*`.
- `k6 inspect .\load-test-sistema.js`: exitoso, valida opciones/imports.
- `k6 inspect .\load-test.js`: exitoso, valida opciones/imports.
- `k6 inspect .\stress-test.js`: exitoso, valida opciones/imports.
- `k6 inspect .\spike-test.js`: exitoso, valida opciones/imports.
- `k6 inspect .\endurance-test.js`: exitoso, valida opciones/imports.
- `k6 run --summary-export .\resultados\resultado-smoke.json .\smoke-test.js`: ejecutado previamente con login automatico antes de separar frontend/backend.

No se ejecutaron pruebas pesadas automaticamente. `stress-backend-progressive-test.js`, `stress-backend-limit-3000-test.js`, endurance y spike requieren autorizacion explicita.

## Resultados Obtenidos

- K6 instalado: `C:\ProgramData\chocolatey\bin\k6.exe`.
- Login por gateway: exitoso, `POST http://localhost:8080/auth/login` devolvio token valido.
- Gateway y rutas `/api/**`: respondieron sin 401/403, sin 404 y sin errores 5xx en los checks del smoke.
- Frontend local: `http://localhost:4200/` y `http://localhost:4200/login` rechazaron conexion durante la prueba.
- Carpeta de resultados creada: `k6/resultados`.
- JSON de resultados: `k6/resultados/resultado-smoke.json`.

Metricas principales del smoke:

| Metrica | Resultado |
| --- | ---: |
| `checks` | 86.70% |
| `http_req_failed` | 19.94% |
| `http_req_duration p95` | 33.93 ms |
| `vus_max` | 3 |
| `iterations` | 156 |
| `http_reqs` | 1564 |
| `server_errors_or_timeouts` | 19.94% |
| `route_not_found_responses` | 0.00% |
| `auth_required_responses` | 0.00% |

Resultados backend-only reportados:

| Prueba | VUs max | Duracion | backend_checks | backend_req_failed | backend_server_errors_or_timeouts | backend_req_duration p95 |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| `smoke-backend-test.js` | 3 | 1 min | 100% | 0% | 0% | Pendiente de registrar |
| `load-backend-sistema-test.js` | 100 | 8 min | 100% | 0% | 0% | ~15.40 ms |
| `stress-backend-progressive-test.js` | 300 | 8 min | 100% | 0% | 0% | ~43.19 ms |

Interpretacion: el backend por Gateway con JWT funciono correctamente en smoke, carga hasta 100 VUs y stress progresivo hasta 300 VUs. La nueva prueba `stress-backend-limit-3000-test.js` queda preparada para buscar el limite aproximado entre 100 y 3000 VUs.

## Advertencias

- Las rutas `/api/**` requieren JWT por `AuthFilter`.
- Sin `TOKEN`, el gateway puede responder `400`, `401` o `403`; eso indica autenticacion requerida, no necesariamente falla del microservicio.
- Los scripts usan principalmente `GET` para evitar alterar datos reales.
- `POST /api/compras` y `POST /api/ventas` pueden afectar inventario/stock; no se ejecutan por defecto.
- Confirmar manualmente Swagger de `ms-auth` abriendo `http://localhost:8085/swagger-ui/index.html` con el servicio levantado. En este servicio no aplica `/doc/swagger-ui.html`.
- Confirmar que el frontend Angular permanezca levantado en `http://localhost:4200` solo antes de ejecutar `smoke-frontend-test.js`.
- Confirmar datos semilla antes de activar endpoints por ID.

## Conclusion Modelo

> "El sistema soporto aproximadamente X usuarios virtuales concurrentes manteniendo una tasa de errores menor al 5% y un tiempo de respuesta p95 aceptable. Al incrementar la carga a Y usuarios, se observo degradacion en el tiempo de respuesta y aumento de errores HTTP, por lo que se considera que el limite aproximado del sistema se encuentra antes de ese punto."
