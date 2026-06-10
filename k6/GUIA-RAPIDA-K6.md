# Guia Rapida K6 - Chinito Importaciones

Esta guia resume como ejecutar las pruebas K6 backend-only del sistema Chinito Importaciones. Las pruebas principales usan el API Gateway y los microservicios; el frontend Angular se valida aparte porque en modo desarrollo no representa un despliegue productivo.

## 1. Requisitos Previos

- Tener Java/Maven si se levantan microservicios manualmente.
- Tener Node.js/npm si se desea levantar frontend.
- Tener K6 instalado.
- En Windows se puede instalar K6 con Chocolatey:

```powershell
choco install k6 -y
```

Verificar K6:

```powershell
k6 version
```

## 2. Servicios Necesarios Antes De K6

Levantar estos servicios antes de ejecutar pruebas K6 backend-only:

1. MySQL
2. `ms-registry-server`
3. `ms-config-server`
4. `ms-auth`
5. `ms-categoria`
6. `ms-producto`
7. `ms-inventario`
8. `ms-cliente`
9. `ms-proveedor`
10. `ms-compra`
11. `ms-venta`
12. `ms-gateway-service`

El frontend no es necesario para las pruebas principales de rendimiento backend.

## 3. Abrir PowerShell En La Carpeta K6

```powershell
cd "D:\k6-sistema-chinito\k6"
```

## 4. Configurar Variables De Entorno

```powershell
$env:GATEWAY_URL="http://localhost:8080"
$env:AUTH_URL="http://localhost:8080/auth/login"
$env:AUTH_USER="admin2"
$env:AUTH_PASSWORD="123456"
```

Tambien puedes usar `TOKEN` si ya tienes un JWT temporal:

```powershell
$env:TOKEN="PEGAR_AQUI_TOKEN_TEMPORAL_DE_PRUEBA"
```

No guardar tokens reales en archivos ni imprimirlos completos en consola.

## 5. Prueba Basica Backend

```powershell
k6 run --summary-export .\resultados\resultado-smoke-backend.json .\smoke-backend-test.js
```

## 6. Carga Normal Hasta 100 Usuarios

```powershell
k6 run --summary-export .\resultados\resultado-load-backend-sistema.json .\load-backend-sistema-test.js
```

## 7. Estres Progresivo Hasta 300 Usuarios

```powershell
k6 run --summary-export .\resultados\resultado-stress-backend-progressive.json .\stress-backend-progressive-test.js
```

## 8. Limite Progresivo Hasta 3000 Usuarios

Ejecutar esta prueba solo cuando se quiera buscar el limite aproximado del backend.

```powershell
k6 run --summary-export .\resultados\resultado-stress-backend-limit-3000.json .\stress-backend-limit-3000-test.js
```

## 9. Interpretar Resultados

- `backend_checks` debe ser mayor a 95%.
- `backend_req_failed` debe ser menor a 5%.
- `backend_server_errors_or_timeouts` debe ser menor a 1%.
- `backend_req_duration p95` debe ser menor a 3000 ms.
- `vus_max` indica la cantidad maxima de usuarios virtuales alcanzados.
- `http_reqs` indica cantidad total de peticiones.
- `iterations` indica cuantas veces se repitio el flujo.

Si aparece aumento de errores HTTP, timeouts o crecimiento fuerte de `backend_req_duration p95`, el limite aproximado del sistema se encuentra antes de ese escalon de usuarios.

## 10. Conclusion Modelo

> "El backend del sistema Chinito Importaciones soporto hasta X usuarios virtuales concurrentes manteniendo 0% de errores HTTP y tiempos de respuesta aceptables. Al incrementar la carga hasta Y usuarios, se evaluo si existia degradacion, errores 5xx, timeouts o aumento del p95."

## 11. Links Swagger

- Auth: http://localhost:8085/swagger-ui/index.html
- Categoria: http://localhost:8081/doc/swagger-ui/index.html
- Producto: http://localhost:8082/doc/swagger-ui/index.html
- Inventario: http://localhost:8083/doc/swagger-ui/index.html
- Venta: http://localhost:8084/doc/swagger-ui/index.html
- Cliente: http://localhost:8086/doc/swagger-ui/index.html#/
- Proveedor: http://localhost:8087/doc/swagger-ui/index.html
- Compra: http://localhost:8088/doc/swagger-ui/index.html

## 12. Validar Sintaxis Sin Ejecutar Carga

```powershell
k6 inspect .\stress-backend-limit-3000-test.js
```
