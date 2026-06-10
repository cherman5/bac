# Pruebas K6 - Sistema Chinito Importaciones

Esta carpeta contiene pruebas de rendimiento para evaluar el sistema completo usando K6. La prueba anterior sobre `ms-categoria-prueba` validaba un microservicio aislado; estas pruebas integrales llaman al frontend y a los endpoints REST publicados por el API Gateway para observar el comportamiento conjunto de frontend, gateway, descubrimiento/configuracion, base de datos y microservicios.

La prueba principal de rendimiento se realiza por API Gateway. Esto es correcto porque K6 mide peticiones HTTP y el gateway representa la entrada real hacia los microservicios protegidos por JWT. El frontend se verifica aparte para que problemas del servidor Angular en `http://localhost:4200` no contaminen los thresholds del backend.

## Variables de entorno

Los scripts usan estos valores por defecto:

- `GATEWAY_URL=http://localhost:8080`
- `FRONTEND_URL=http://localhost:4200`
- `TOKEN` opcional para JWT
- `AUTH_URL` opcional para login automatico
- `AUTH_USER` opcional para usuario de prueba
- `AUTH_PASSWORD` opcional para password de prueba
- `INCLUDE_FRONTEND=false` por defecto en `smoke-test.js`

No guardar tokens reales en archivos `.js`, `.env`, README ni capturas. Los JWT deben tratarse como datos sensibles aunque sean temporales. Si `TOKEN` existe, K6 enviara:

```http
Authorization: Bearer ${TOKEN}
```

Si no existe `TOKEN` pero existen `AUTH_URL`, `AUTH_USER` y `AUTH_PASSWORD`, los scripts hacen login automatico contra `ms-auth` y usan el JWT solo en memoria durante la prueba. Si tampoco existen credenciales de login, los scripts muestran una advertencia; como el gateway usa `AuthFilter` en `/api/**`, una respuesta `400`, `401` o `403` se interpreta como autenticacion requerida y no como degradacion del sistema.

El login real detectado en `ms-auth` es:

- `http://localhost:8085/auth/login`
- `http://localhost:8080/auth/login` por API Gateway
- metodo: `POST`
- body esperado: `{ "userName": "usuario_prueba", "password": "password_prueba" }`
- respuesta esperada: `{ "token": "JWT_TEMPORAL" }`

Puedes usarlo manualmente en Postman/Swagger para obtener un token temporal, o probar login automatico con variables temporales de PowerShell:

```powershell
$env:AUTH_URL="http://localhost:8080/auth/login"
$env:AUTH_USER="usuario_prueba"
$env:AUTH_PASSWORD="password_prueba"
k6 run .\load-test-sistema.js
```

Si no defines `AUTH_URL`, `load-test-sistema.js` usa por defecto `${GATEWAY_URL}/auth/login` cuando existen `AUTH_USER` y `AUTH_PASSWORD`.

Nota de seguridad: `setup()` valida el login, pero no devuelve el JWT en el resumen de K6. Cada VU obtiene el token en memoria cuando lo necesita para evitar que `--summary-export` persista tokens reales.

## Endpoints detectados

Los controladores REST detectados en `src/main/java` son:

| Microservicio | Controller | Endpoints |
| --- | --- | --- |
| `ms-categoria-prueba` | `CategoriaController` | `GET /api/categorias`, `GET /api/categorias/{id}`, `POST /api/categorias`, `PUT /api/categorias/{id}`, `DELETE /api/categorias/{id}` |
| `ms_producto-prueba` | `ProductoController` | `GET /api/productos`, `GET /api/productos/{id}`, `POST /api/productos`, `PUT /api/productos/{id}`, `DELETE /api/productos/{id}`, `PUT /api/productos/{id}/precio?precioVenta=...` |
| `ms_inventario-prueba` | `InventarioController` | `GET /api/stock`, `GET /api/stock/{productoId}`, `POST /api/stock`, `PUT /api/stock/{productoId}`, `PUT /api/stock/{productoId}/reservar?cantidad=...`, `PUT /api/stock/{productoId}/reponer` |
| `ms_cliente-prueba` | `ClienteController` | `GET /api/clientes`, `GET /api/clientes/{id}`, `POST /api/clientes`, `PUT /api/clientes/{id}`, `DELETE /api/clientes/{id}` |
| `ms_proveedor-prueba` | `ProveedorController` | `GET /api/proveedores`, `GET /api/proveedores/{id}`, `POST /api/proveedores`, `PUT /api/proveedores/{id}`, `DELETE /api/proveedores/{id}` |
| `ms_compra-prueba` | `CompraController` | `GET /api/compras`, `GET /api/compras/{id}`, `POST /api/compras`, `PUT /api/compras/{id}`, `DELETE /api/compras/{id}` |
| `ms_venta-prueba` | `VentaController` | `GET /api/ventas`, `GET /api/ventas/{id}`, `POST /api/ventas` |

## URLs reales detectadas

Datos tomados de `config-data/*.yml`:

| Componente | Servicio | Puerto |
| --- | --- | ---: |
| Config Server | `ms-config-server` | 7071 |
| API Gateway | `ms-gateway-service` | 8080 |
| Auth | `ms-auth-service` | 8085 |
| Registry/Eureka | `ms-registry-server` | 8090 |
| Categorias | `ms-categoria-service` | 8081 |
| Productos | `ms-producto-service` | 8082 |
| Inventario | `ms-inventario-service` | 8083 |
| Ventas | `ms-venta-service` | 8084 |
| Clientes | `ms-cliente-service` | 8086 |
| Proveedores | `ms-proveedor-service` | 8087 |
| Compras | `ms-compra-service` | 8088 |
| Frontend | Angular | 4200 |

## Rutas reales del API Gateway

`config-data/ms-gateway-service.yml` confirma Spring Cloud Gateway con `lb://` y Eureka. Rutas publicas:

- `${GATEWAY_URL}/auth/**` -> `lb://ms-auth-service`

Rutas protegidas por `AuthFilter`:

- `${GATEWAY_URL}/api/categorias`
- `${GATEWAY_URL}/api/productos`
- `${GATEWAY_URL}/api/stock`
- `${GATEWAY_URL}/api/clientes`
- `${GATEWAY_URL}/api/proveedores`
- `${GATEWAY_URL}/api/compras`
- `${GATEWAY_URL}/api/ventas`

El gateway valida tokens llamando a `http://ms-auth-service/auth/validate?token=...` mediante `WebClient` con `@LoadBalanced`.

## Swagger/OpenAPI

La tabla completa esta en [SWAGGER-LINKS.md](./SWAGGER-LINKS.md). Los servicios de negocio tienen Swagger UI confirmado por config en `/doc/swagger-ui.html` y JSON en `/v3/api-docs`:

- `http://localhost:8081/doc/swagger-ui.html` categorias
- `http://localhost:8082/doc/swagger-ui.html` productos
- `http://localhost:8083/doc/swagger-ui.html` inventario
- `http://localhost:8084/doc/swagger-ui.html` ventas
- `http://localhost:8086/doc/swagger-ui.html` clientes
- `http://localhost:8087/doc/swagger-ui.html` proveedores
- `http://localhost:8088/doc/swagger-ui.html` compras

`ms-auth` fue actualizado con springdoc compatible con Spring Boot 2.x:

- `http://localhost:8085/swagger-ui/index.html`
- `http://localhost:8085/v3/api-docs`

En `ms-auth`, `/doc/swagger-ui.html` no aplica en la ejecucion actual; usar `/swagger-ui/index.html`.

`ms-gateway-service` no requiere Swagger propio para estas pruebas porque solo enruta; sus rutas estan documentadas en [ENDPOINTS-DESCRIPCION.md](./ENDPOINTS-DESCRIPCION.md).

## Servicios que deben estar levantados

Orden recomendado:

1. MySQL.
2. `ms-registry-server` en `http://localhost:8090`.
3. `ms-config-server` en `http://localhost:7071`.
4. `ms-auth` en `http://localhost:8085`.
5. Microservicios de negocio: categorias, productos, inventario, clientes, proveedores, compras y ventas.
6. `ms-gateway-service` en `http://localhost:8080`.
7. Frontend Angular en `http://localhost:4200`.
8. K6.

## Pruebas incluidas

- `smoke-backend-test.js`: prueba principal de humo del backend por Gateway. Valida `auth/login` y los GET principales de categorias, productos, stock, clientes, proveedores, compras y ventas. No incluye frontend.
- `load-backend-sistema-test.js`: prueba de carga normal backend-only del sistema completo por Gateway, con escalones de 10, 25, 50 y 100 VUs. No incluye frontend.
- `stress-backend-progressive-test.js`: prueba progresiva backend-only para detectar limite aproximado del backend, con escalones hasta 300 VUs. No ejecutarla automaticamente.
- `stress-backend-limit-3000-test.js`: prueba progresiva backend-only hasta 3000 VUs para buscar el limite aproximado del sistema. No ejecutarla automaticamente.
- `smoke-frontend-test.js`: verificacion opcional del frontend Angular en `/` y `/login`.
- `smoke-test.js`: smoke mixto compatible. Por defecto usa `INCLUDE_FRONTEND=false` y prueba solo backend; si `INCLUDE_FRONTEND=true`, agrega frontend como verificacion opcional sin cambiar los thresholds principales del backend.
- `load-test.js`: prueba antigua de carga. Preferir `load-backend-sistema-test.js` para medicion principal.
- `load-test-sistema.js`: prueba antigua de flujo integral que puede incluir frontend. No usar para medir el backend principal.
- `stress-test.js`: incrementa carga hasta 100, 200, 300 y 500 VUs para encontrar degradacion. No ejecutarlo sin autorizacion.
- `endurance-test.js`: mantiene 50 VUs por 15 minutos para observar estabilidad. No ejecutarlo sin autorizacion.
- `spike-test.js`: sube de 10 a 200 VUs rapidamente para observar picos. No ejecutarlo sin autorizacion.

Los scripts usan principalmente `GET` para no modificar datos reales. Los ejemplos `POST`, `PUT` y `DELETE` detectados estan documentados arriba, pero no se ejecutan por defecto. Si agregas `POST` de prueba, usa nombres como `K6_TEST_*`, ejecutalo en ambiente de pruebas y luego limpia esos registros desde Swagger/Postman o SQL.

## Criterios de aceptacion

Los thresholds principales son:

- `backend_req_failed < 5%` para smoke de backend
- `backend_req_duration p95 < 3000 ms` para smoke/load/stress backend-only
- `http_req_duration p95 < 3000 ms` para load y frontend separado
- `http_req_duration p95 < 5000 ms` para stress/endurance/spike
- `backend_checks > 95%` para smoke de backend
- `backend_server_errors_or_timeouts` bajo para detectar `500`, `502`, `503` o timeouts en backend

## Comandos PowerShell

Desde esta carpeta:

```powershell
cd D:\k6-sistema-chinito\k6
```

Smoke backend sin JWT:

```powershell
$env:GATEWAY_URL="http://localhost:8080"
k6 run .\smoke-backend-test.js
```

Smoke backend con login automatico sin guardar credenciales:

```powershell
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

Smoke backend con JWT:

```powershell
$env:GATEWAY_URL="http://localhost:8080"
$env:TOKEN="PEGAR_AQUI_TOKEN_TEMPORAL_DE_PRUEBA"
k6 run .\smoke-backend-test.js
```

Smoke compatible, backend por defecto:

```powershell
$env:INCLUDE_FRONTEND="false"
k6 run --summary-export .\resultados\resultado-smoke.json .\smoke-test.js
```

Frontend opcional:

```powershell
$env:FRONTEND_URL="http://localhost:4200"
$env:INCLUDE_FRONTEND="true"
k6 run --summary-export .\resultados\resultado-smoke-frontend.json .\smoke-frontend-test.js
```

Smoke compatible incluyendo frontend como verificacion opcional:

```powershell
$env:INCLUDE_FRONTEND="true"
k6 run --summary-export .\resultados\resultado-smoke-con-frontend.json .\smoke-test.js
```

Validar sintaxis:

```powershell
k6 inspect .\load-backend-sistema-test.js
k6 inspect .\stress-backend-progressive-test.js
k6 inspect .\stress-backend-limit-3000-test.js
```

Ejecutar flujo integral:

```powershell
k6 run --summary-export .\resultados\resultado-load-sistema.json .\load-test-sistema.js
```

Pruebas pesadas, solo con autorizacion:

```powershell
k6 run --summary-export .\resultados\resultado-stress.json .\stress-test.js
k6 run --summary-export .\resultados\resultado-endurance.json .\endurance-test.js
k6 run --summary-export .\resultados\resultado-spike.json .\spike-test.js
```

## Metricas clave

- `http_req_failed`: porcentaje de requests fallidos segun K6. Si supera 5%, la carga ya no es aceptable.
- `http_req_duration`: tiempo total de respuesta. Revisar especialmente `p(95)`, que indica que el 95% de requests respondio por debajo de ese valor.
- `checks`: validaciones funcionales definidas en los scripts. Deben estar sobre 95%.
- `vus`: usuarios virtuales concurrentes activos.
- `iterations`: cantidad de recorridos completos ejecutados por los VUs.

## Como interpretar resultados

1. Ejecuta primero `smoke-backend-test.js`. Si falla, no continuar con carga.
2. Ejecuta `load-backend-sistema-test.js` y revisa cada etapa de VUs: 10, 25, 50 y 100.
3. El backend soporta una carga si mantiene `backend_req_failed < 5%`, `backend_checks > 95%` y `backend_req_duration p95` dentro del umbral.
4. Para estimar el limite inicial, ejecuta `stress-backend-progressive-test.js` solo con autorizacion y ubica el primer escalon donde aparezcan errores HTTP, timeouts o `p95` excesivo.
5. Si el backend mantiene estabilidad hasta 300 VUs, ejecuta `stress-backend-limit-3000-test.js` solo con autorizacion para buscar degradacion entre 100 y 3000 VUs.
6. Confirma en logs del gateway y microservicios si los errores son de aplicacion, base de datos, red, discovery o agotamiento de recursos.

Conclusion modelo para informe:

> "El sistema soporto aproximadamente X usuarios virtuales concurrentes manteniendo una tasa de errores menor al 5% y un tiempo de respuesta p95 aceptable. Al incrementar la carga a Y usuarios, se observo degradacion en el tiempo de respuesta y aumento de errores HTTP, por lo que se considera que el limite aproximado del sistema se encuentra antes de ese punto."

## Rutas que deben verificarse manualmente

- Abrir Swagger de `ms-auth` en `http://localhost:8085/swagger-ui/index.html` tras levantar el servicio para confirmar visualmente la nueva documentacion.
- Swagger de `ms-gateway-service`; no se implemento agregacion Swagger porque puede complicar el gateway.
- Que el token temporal usado en `TOKEN` tenga vigencia suficiente para toda la prueba.
- El frontend se valida por separado con `smoke-frontend-test.js`; si falla `localhost:4200`, revisar el servidor Angular sin bloquear la medicion del backend por Gateway.
- Existencia de datos semilla para endpoints por ID, por ejemplo `/api/productos/1` o `/api/stock/1`.
- Swagger/OpenAPI de cada microservicio para confirmar si hay endpoints adicionales fuera de los controladores revisados.
