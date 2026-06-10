# Descripcion de Endpoints

Las rutas directas salen de los controladores de cada microservicio. Las rutas por gateway salen de `config-data/ms-gateway-service.yml`. El gateway usa `AuthFilter` en todas las rutas `/api/**`, por lo que requieren header `Authorization: Bearer ${TOKEN}`. La ruta `/auth/**` no tiene `AuthFilter`.

| Microservicio | Metodo | Ruta directa | Ruta por Gateway | JWT | Descripcion |
| --- | --- | --- | --- | --- | --- |
| ms-auth-service | POST | `http://localhost:8085/auth/login` | `http://localhost:8080/auth/login` | No | Autentica las credenciales de un usuario y devuelve un token JWT temporal para consumir rutas protegidas. Body: `{ "userName": "...", "password": "..." }`. |
| ms-auth-service | POST | `http://localhost:8085/auth/validate?token=...` | `http://localhost:8080/auth/validate?token=...` | No | Verifica si un token JWT enviado por el cliente es valido para autorizar solicitudes protegidas. Lo usa internamente el gateway. No imprimir tokens completos. |
| ms-auth-service | POST | `http://localhost:8085/auth/create` | `http://localhost:8080/auth/create` | No | Registra un nuevo usuario del sistema con sus credenciales de acceso. Usar solo datos de prueba si se ejecuta. |
| ms-categoria-service | GET | `http://localhost:8081/api/categorias` | `http://localhost:8080/api/categorias` | Si | Obtiene todas las categorias registradas para organizar productos segun tipo o clasificacion. Endpoint usado por K6. |
| ms-categoria-service | GET | `http://localhost:8081/api/categorias/{id}` | `http://localhost:8080/api/categorias/{id}` | Si | Obtiene una categoria por id. Requiere dato existente. |
| ms-categoria-service | POST | `http://localhost:8081/api/categorias` | `http://localhost:8080/api/categorias` | Si | Crea una nueva categoria para clasificar productos dentro del sistema. No usado por K6 por defecto para no alterar datos. |
| ms-categoria-service | PUT | `http://localhost:8081/api/categorias/{id}` | `http://localhost:8080/api/categorias/{id}` | Si | Actualiza categoria. |
| ms-categoria-service | DELETE | `http://localhost:8081/api/categorias/{id}` | `http://localhost:8080/api/categorias/{id}` | Si | Elimina categoria. |
| ms-producto-service | GET | `http://localhost:8082/api/productos` | `http://localhost:8080/api/productos` | Si | Obtiene todos los productos registrados junto con sus datos principales para gestion comercial. Endpoint usado por K6. |
| ms-producto-service | GET | `http://localhost:8082/api/productos/{id}` | `http://localhost:8080/api/productos/{id}` | Si | Obtiene producto por id. |
| ms-producto-service | POST | `http://localhost:8082/api/productos` | `http://localhost:8080/api/productos` | Si | Registra un nuevo producto y puede consultar categoria para validar la asociacion. Usar solo `K6_TEST_*` si se prueba. |
| ms-producto-service | PUT | `http://localhost:8082/api/productos/{id}` | `http://localhost:8080/api/productos/{id}` | Si | Actualiza producto. |
| ms-producto-service | DELETE | `http://localhost:8082/api/productos/{id}` | `http://localhost:8080/api/productos/{id}` | Si | Elimina producto. |
| ms-producto-service | PUT | `http://localhost:8082/api/productos/{id}/precio?precioVenta=...` | `http://localhost:8080/api/productos/{id}/precio?precioVenta=...` | Si | Actualiza el precio de venta de un producto especifico sin modificar el resto de sus datos. |
| ms-inventario-service | GET | `http://localhost:8083/api/stock` | `http://localhost:8080/api/stock` | Si | Obtiene el stock registrado de los productos disponibles en el sistema. Endpoint usado por K6. |
| ms-inventario-service | GET | `http://localhost:8083/api/stock/{productoId}` | `http://localhost:8080/api/stock/{productoId}` | Si | Consulta stock de un producto. |
| ms-inventario-service | POST | `http://localhost:8083/api/stock` | `http://localhost:8080/api/stock` | Si | Registra la informacion inicial de stock asociada a un producto; puede consultar producto para validar existencia. |
| ms-inventario-service | PUT | `http://localhost:8083/api/stock/{productoId}` | `http://localhost:8080/api/stock/{productoId}` | Si | Ajusta stock a una cantidad exacta. |
| ms-inventario-service | PUT | `http://localhost:8083/api/stock/{productoId}/reservar?cantidad=...` | `http://localhost:8080/api/stock/{productoId}/reservar?cantidad=...` | Si | Reserva una cantidad de stock para una venta, evitando vender mas unidades de las disponibles. |
| ms-inventario-service | PUT | `http://localhost:8083/api/stock/{productoId}/reponer` | `http://localhost:8080/api/stock/{productoId}/reponer` | Si | Incrementa el stock despues de una compra, reposicion o ingreso de mercaderia. Body `{ "cantidad": n }`. |
| ms-cliente-service | GET | `http://localhost:8086/api/clientes` | `http://localhost:8080/api/clientes` | Si | Lista clientes. Endpoint usado por K6. |
| ms-cliente-service | GET | `http://localhost:8086/api/clientes/{id}` | `http://localhost:8080/api/clientes/{id}` | Si | Obtiene cliente por id. |
| ms-cliente-service | POST | `http://localhost:8086/api/clientes` | `http://localhost:8080/api/clientes` | Si | Registra un nuevo cliente para operaciones de venta y emision de comprobantes. Tiene cliente Feign para API externa DNI/RUC cuando el servicio lo requiera. |
| ms-cliente-service | PUT | `http://localhost:8086/api/clientes/{id}` | `http://localhost:8080/api/clientes/{id}` | Si | Actualiza cliente. |
| ms-cliente-service | DELETE | `http://localhost:8086/api/clientes/{id}` | `http://localhost:8080/api/clientes/{id}` | Si | Elimina cliente. |
| ms-proveedor-service | GET | `http://localhost:8087/api/proveedores` | `http://localhost:8080/api/proveedores` | Si | Lista proveedores. Endpoint usado por K6. |
| ms-proveedor-service | GET | `http://localhost:8087/api/proveedores/{id}` | `http://localhost:8080/api/proveedores/{id}` | Si | Obtiene proveedor por id. |
| ms-proveedor-service | POST | `http://localhost:8087/api/proveedores` | `http://localhost:8080/api/proveedores` | Si | Registra un nuevo proveedor para operaciones de compra y abastecimiento. Tiene cliente Feign para API externa DNI/RUC cuando el servicio lo requiera. |
| ms-proveedor-service | PUT | `http://localhost:8087/api/proveedores/{id}` | `http://localhost:8080/api/proveedores/{id}` | Si | Actualiza proveedor. |
| ms-proveedor-service | DELETE | `http://localhost:8087/api/proveedores/{id}` | `http://localhost:8080/api/proveedores/{id}` | Si | Elimina proveedor. |
| ms-compra-service | GET | `http://localhost:8088/api/compras` | `http://localhost:8080/api/compras` | Si | Lista compras. Endpoint usado por K6. |
| ms-compra-service | GET | `http://localhost:8088/api/compras/{id}` | `http://localhost:8080/api/compras/{id}` | Si | Obtiene compra por id. |
| ms-compra-service | POST | `http://localhost:8088/api/compras` | `http://localhost:8080/api/compras` | Si | Registra una compra a un proveedor y puede consultar proveedor, producto e inventario para actualizar informacion relacionada. No usado por K6 por defecto. |
| ms-compra-service | PUT | `http://localhost:8088/api/compras/{id}` | `http://localhost:8080/api/compras/{id}` | Si | Actualiza compra. |
| ms-compra-service | DELETE | `http://localhost:8088/api/compras/{id}` | `http://localhost:8080/api/compras/{id}` | Si | Elimina compra. |
| ms-venta-service | GET | `http://localhost:8084/api/ventas` | `http://localhost:8080/api/ventas` | Si | Lista ventas. Endpoint usado por K6. |
| ms-venta-service | GET | `http://localhost:8084/api/ventas/{id}` | `http://localhost:8080/api/ventas/{id}` | Si | Obtiene venta por id. |
| ms-venta-service | POST | `http://localhost:8084/api/ventas` | `http://localhost:8080/api/ventas` | Si | Registra una venta validando cliente, producto y stock disponible; puede consultar cliente, producto e inventario. No usado por K6 por defecto. |

## Ejemplos Seguros

PowerShell con JWT temporal:

```powershell
$env:GATEWAY_URL="http://localhost:8080"
$env:TOKEN="PEGAR_AQUI_TOKEN_TEMPORAL_DE_PRUEBA"
k6 run .\smoke-test.js
```

Ejemplo de login manual:

```json
{
  "userName": "usuario_prueba",
  "password": "password_prueba"
}
```

No guardar el token devuelto en archivos. Si se hacen pruebas con `POST`, usar nombres `K6_TEST_*` y limpiar desde Swagger/Postman o SQL al terminar.

## Consumos Entre Servicios Y APIs Externas Detectados

| Componente | Cliente detectado | Consume | Observacion |
| --- | --- | --- | --- |
| `ms-gateway-service` | `WebClient` con `@LoadBalanced` | `ms-auth-service /auth/validate` | El `AuthFilter` valida tokens JWT antes de permitir rutas `/api/**`. |
| `ms-producto-service` | `CategoriaClient` | `ms-categoria-service /api/categorias/{id}` | Se usa para validar/consultar categoria asociada a productos. |
| `ms-inventario-service` | `ProductoClient` | `ms-producto-service /api/productos/{id}` | Se usa para validar/consultar producto antes de operaciones de stock. |
| `ms-cliente-service` | `SunatClient` | `https://api.apis.net.pe/v1/dni` y `/ruc` | API externa para datos de documento. Uso exacto pendiente de verificar en servicio. |
| `ms-proveedor-service` | `SunatClient` | `https://api.apis.net.pe/v1/dni` y `/ruc` | API externa para datos de documento. Uso exacto pendiente de verificar en servicio. |
| `ms-compra-service` | `ProveedorClient` | `ms-proveedor-service /api/proveedores/{id}` | Se usa en operaciones de compra para validar/consultar proveedor. |
| `ms-compra-service` | `ProductoClient` | `ms-producto-service /api/productos/{id}/precio` y `/api/productos/{id}/compra` | Se usa para actualizar informacion relacionada del producto durante compras. |
| `ms-compra-service` | `InventarioClient` | `ms-inventario-service /api/stock/{productoId}/reservar` y `/reponer` | Se usa para actualizar stock durante compras. |
| `ms-venta-service` | `ClienteClient` | `ms-cliente-service /api/clientes/{id}` | Se usa para validar/consultar cliente antes de registrar una venta. |
| `ms-venta-service` | `ProductoClient` | `ms-producto-service /api/productos/{id}` | Se usa para validar/consultar producto antes de registrar una venta. |
| `ms-venta-service` | `InventarioClient` | `ms-inventario-service /api/stock/{productoId}/reservar` | Se usa para reservar stock durante ventas. |
