# 🧶 Conexión de Maraña Crochet con XAMPP & MySQL

Este proyecto ha sido conectado con **XAMPP** y cuenta con una base de datos **MySQL** completa y funcional.

---

## 🗄️ Información de la Base de Datos

* **Nombre de la Base de Datos:** `marana_crochet`
* **Codificación:** `utf8mb4_unicode_ci`
* **Host:** `127.0.0.1` (o `localhost`)
* **Puerto:** `3306`
* **Usuario:** `root`
* **Contraseña:** `root` (o en blanco según configuración XAMPP)
* **Script SQL de respaldo:** [`database/marana_crochet.sql`](file:///c:/Users/Alvaro/Mara%C3%B1a-AiStudio/Mara-aCrochet/database/marana_crochet.sql)

---

## 📊 Tablas Creadas y Estructura

| Tabla | Registros | Descripción |
| :--- | :---: | :--- |
| `productos` | 7 | Catálogo de amigurumis, precios en COP, costo de hilaza, stock actual y alertas de stock mínimo. |
| `pedidos` | 3 | Órdenes de compra con clientes, estados (`preparacion`, `listo`, `transito`, `entregado`), guías de envío y notas de taller. |
| `pedido_items` | 6 | Relación de artículos y especificaciones por cada pedido. |
| `comprobantes` | 3 | Vouchers de pago (Bancolombia, Nequi, Daviplata), códigos de aprobación y estados de validación. |
| `usuarios` | 3 | Cuentas de administradoras (Lucía Montoya) y clientas (Sofia Restrepo, Mariana Duque). |

---

## 🌐 Gestión Visual en phpMyAdmin

Puedes inspeccionar y editar las tablas directamente desde tu navegador:

👉 **[Abrir phpMyAdmin - marana_crochet](http://localhost/phpmyadmin/index.php?route=/database/structure&db=marana_crochet)**

---

## 🚀 API REST en XAMPP Apache

El backend PHP se encuentra desplegado en `C:\xampp\htdocs\marana-api\` (y versionado en [`backend-php/`](file:///c:/Users/Alvaro/Mara%C3%B1a-AiStudio/Mara-aCrochet/backend-php)):

* **Diagnóstico de Conexión:**  
  `GET http://localhost/marana-api/test.php`
* **Productos & Stock:**  
  `GET http://localhost/marana-api/products.php` (listar)  
  `POST http://localhost/marana-api/products.php` (actualizar stock / guardar)
* **Pedidos & Envíos:**  
  `GET http://localhost/marana-api/orders.php` (listar con items)  
  `POST http://localhost/marana-api/orders.php` (crear pedido)  
  `PUT http://localhost/marana-api/orders.php` (cambiar estado / guía)
* **Comprobantes de Pago:**  
  `GET http://localhost/marana-api/vouchers.php` (listar)  
  `PUT http://localhost/marana-api/vouchers.php` (aprobar / rechazar)

---

## ⚡ En la Aplicación Frontend

* **Indicador en Cabecera:** En la esquina superior derecha verás un icono de base de datos con un punto verde intermitente indicando que la conexión a MySQL está activa.
* **Banner en Panel de Control:** En la pestaña "Panel", dispones de una tarjeta dedicada para gestionar y diagnosticar la base de datos en 1 clic.
* **Sincronización Automática:**
  * Al iniciar la app, los datos se leen directamente de MySQL.
  * Cuando se edita el stock en el taller, se guarda en MySQL.
  * Cuando una clienta genera un pedido, se registra en MySQL con su comprobante.
  * Cuando la administradora aprueba un comprobante, el estado se actualiza en MySQL.
