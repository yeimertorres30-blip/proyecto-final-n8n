# 🛒 Proyecto Tienda - Menaje y Artículos de Cocina (en proceso)

Una aplicación web interactiva para una tienda en línea especializada en menaje, utensilios y electrodomésticos para la cocina. Permite a los usuarios explorar un catálogo de productos cargado dinámicamente, filtrar artículos, gestionar un carrito de compras y calcular el total en tiempo real.

---

## 🚀 Características Principales

- **Catálogo Dinámico:** Carga de productos desde un archivo estructurado `productos.json`.
- **Carrito de Compras:**
  - Agregar productos al carrito.
  - Modificar cantidades e incrementar/disminuir elementos.
  - Eliminación de productos seleccionados.
  - Cálculo automático e interactivo del subtotal y precio total.
- **Iconografía e Interfaz Moderna:** Uso de vectores SVG personalizados para representar cada producto (`batidora.svg`, `cafetera.svg`, `cuchillo.svg`, etc.).
- **Diseño Adaptativo (Responsive):** Diseñado con HTML5 y CSS3 para ofrecer una experiencia fluida tanto en dispositivos móviles como en pantallas de escritorio.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica de la aplicación.
- **CSS3:** Estilos visuales, distribución responsiva y animaciones.
- **JavaScript (ES6+):** Lógica de consumo de API/JSON, interacción con el DOM y gestión del carrito.
- **JSON:** Formato de almacenamiento de datos para el catálogo de productos.
- **SVG:** Gráficos vectoriales para la iconografía del catálogo.

---

## 📂 Estructura del Proyecto

```txt
proyecto-tienda-main/
│
├── assets/                  # Recurso gráfico e iconos vectoriales
│   ├── batidora.svg
│   ├── cafetera.svg
│   ├── cuchillo.svg
│   ├── molde.svg
│   ├── ollas.svg
│   ├── sarten.svg
│   ├── tabla.svg
│   └── vajilla.svg
│
├── index.html               # Archivo principal HTML
├── styles.css               # Hoja de estilos CSS
├── app.js                   # Lógica e interacción en JS
├── productos.json           # Base de datos local de productos
└── README.md                # Documentación del proyecto
