# Swagger/OpenAPI - Chinito Importaciones

Links revisados contra `config-data/*.yml` y `Swager links.txt`.

| Servicio | Puerto | URL Swagger UI | URL OpenAPI JSON | Estado | Observaciones |
| --- | ---: | --- | --- | --- | --- |
| ms-categoria-service | 8081 | http://localhost:8081/doc/swagger-ui.html | http://localhost:8081/v3/api-docs | Confirmado por config | `springdoc.swagger-ui.path=/doc/swagger-ui.html` en `config-data/ms-categoria-service.yml`. |
| ms-producto-service | 8082 | http://localhost:8082/doc/swagger-ui.html | http://localhost:8082/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-inventario-service | 8083 | http://localhost:8083/doc/swagger-ui.html | http://localhost:8083/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-venta-service | 8084 | http://localhost:8084/doc/swagger-ui.html | http://localhost:8084/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-auth-service | 8085 | http://localhost:8085/swagger-ui/index.html | http://localhost:8085/v3/api-docs | Confirmado visualmente por usuario | En este servicio no aplica `/doc/swagger-ui.html`; la UI correcta abre en `/swagger-ui/index.html`. Endpoints reales: `/auth/login`, `/auth/validate`, `/auth/create`. |
| ms-cliente-service | 8086 | http://localhost:8086/doc/swagger-ui.html | http://localhost:8086/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-proveedor-service | 8087 | http://localhost:8087/doc/swagger-ui.html | http://localhost:8087/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-compra-service | 8088 | http://localhost:8088/doc/swagger-ui.html | http://localhost:8088/v3/api-docs | Confirmado por config | Coincide con `Swager links.txt`. |
| ms-gateway-service | 8080 | No expuesto en config | No confirmado | Pendiente de verificar | Gateway usa Spring Cloud Gateway y rutas `lb://`; se documentan rutas en Markdown en lugar de agregar agregacion Swagger. |
| ms-registry-server | 8090 | No aplica | No aplica | Confirmado por config | Eureka dashboard esperado: http://localhost:8090. |
| ms-config-server | 7071 | No aplica | No aplica | Confirmado por config | Config Server con usuario `root`; no expone Swagger. |

## Rutas Swagger Alternativas A Probar Manualmente

Si algun Swagger UI no abre con `/doc/swagger-ui.html`, probar:

- `/swagger-ui.html`
- `/swagger-ui/index.html`
- `/v3/api-docs`

Para los servicios de negocio, la configuracion real apunta primero a `/doc/swagger-ui.html`.
Para `ms-auth-service`, la ruta confirmada es `http://localhost:8085/swagger-ui/index.html`.

## Titulos OpenAPI Esperados

| Servicio | Titulo esperado | Descripcion general |
| --- | --- | --- |
| ms-categoria-service | `OPEN API MICROSERVICIO CATEGORIA` | Documentacion de endpoints para registrar, consultar, actualizar y eliminar categorias usadas para clasificar productos. |
| ms-producto-service | `OPEN API MICROSERVICIO PRODUCTO` | Documentacion de endpoints para registrar, consultar, actualizar, eliminar productos y administrar precios de venta. |
| ms-inventario-service | `OPEN API MICROSERVICIO INVENTARIO` | Documentacion de endpoints para consultar, registrar, actualizar, reservar y reponer stock de productos. |
| ms-venta-service | `OPEN API MICROSERVICIO VENTA` | Documentacion de endpoints para registrar y consultar ventas, validando cliente, producto y disponibilidad de stock. |
| ms-cliente-service | `OPEN API MICROSERVICIO CLIENTE` | Documentacion de endpoints para registrar, consultar, actualizar y eliminar clientes del sistema. |
| ms-proveedor-service | `OPEN API MICROSERVICIO PROVEEDOR` | Documentacion de endpoints para registrar, consultar, actualizar y eliminar proveedores del sistema. |
| ms-compra-service | `OPEN API MICROSERVICIO COMPRA` | Documentacion de endpoints para registrar, consultar, actualizar y eliminar compras, permitiendo la reposicion de inventario. |
| ms-auth-service | `OPEN API MICROSERVICIO AUTH` | Documentacion de endpoints para iniciar sesion, crear usuarios y validar tokens JWT. |

## Verificacion Rapida Por OpenAPI JSON

```powershell
(Invoke-RestMethod http://localhost:8083/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8084/v3/api-docs).info.title
(Invoke-RestMethod http://localhost:8085/v3/api-docs).info.title
```

lINKS DE CADA MICROSERVICIO EN SWAGGER: 
http://localhost:8085/swagger-ui/index.html
http://localhost:8081/doc/swagger-ui/index.html
http://localhost:8082/doc/swagger-ui/index.html
http://localhost:8083/doc/swagger-ui/index.html
http://localhost:8084/doc/swagger-ui/index.html
http://localhost:8086/doc/swagger-ui/index.html#/
http://localhost:8087/doc/swagger-ui/index.html
http://localhost:8088/doc/swagger-ui/index.html
    