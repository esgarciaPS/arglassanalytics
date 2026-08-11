# Glass Analytics Hub

## Plataforma de Analítica Operativa para Fabricación de Envases de Vidrio (Arglass)

> Copiar y pegar este documento directamente en Lovable como prompt inicial del proyecto.

---

## Contexto del proyecto

Construir una aplicación web de demostración: una plataforma corporativa de dashboards para una fábrica de envases de vidrio. La plataforma cubre cuatro dominios operativos — abastecimiento de materia prima, producción, calidad/liberación positiva y distribución/ventas — con un panel administrativo para configuración de metas y gestión de usuarios. Todos los datos son de muestra (mock), representativos y realistas; no se requiere backend productivo ni integración externa.

Interfaz completamente en ingles. Tono visual corporativo, industrial-moderno, orientado a comité directivo — no lúdico, no genérico tipo plantilla SaaS.

## Estilo visual

- Paleta: azules corporativos (marino/acero) como color primario, grises neutros para fondo, un color de acento (verde/ámbar/rojo) reservado exclusivamente para estados (ok / alerta / crítico).
- Tipografía limpia, alta legibilidad, jerarquía visual clara entre KPI, título y detalle.
- Densidad de datos alta pero ordenada: tarjetas de KPI, gráficos y tablas con espaciado generoso, sin saturar la pantalla.
- Evitar iconografía infantil o ilustraciones decorativas; preferir iconos lineales simples.

## Estructura de navegación

1. **Login** — pantalla de acceso corporativo (autenticación simulada: cualquier credencial válida ingresa).
2. **Header superior** (fijo, visible en todas las pantallas post-login):
  - Logo / nombre de la plataforma a la izquierda.
  - Buscador global centrado: filtra por línea de producción, producto, lote, materia prima o período; al buscar, resalta o filtra los resultados dentro del dashboard activo.
  - Menú de usuario a la derecha (nombre, rol, cerrar sesión).
3. **Menú lateral** (fijo, colapsable):
  - Panel Ejecutivo (inicio)
  - Abastecimiento y Materia Prima
  - Producción
  - Calidad y Liberación Positiva
  - Distribución y Ventas
  - Administración (submenú: Configuración de Metas · Usuarios y Roles) — visible solo para rol Administrador

## Pantallas y componentes por módulo

### 1. Panel Ejecutivo (Home)
- Fila de tarjetas KPI: % cumplimiento de producción, días de cobertura de stock, % capacidad de venta cubierta, % liberación positiva.
- Gráfico de tendencia consolidado (últimos 6 meses).
- Lista de alertas/desviaciones recientes (ej. "Materia prima X bajo umbral mínimo").

### 2. Abastecimiento y Materia Prima
- Tabla de materias primas: nombre, categoría, stock actual, stock mínimo, meta de cobertura, proveedor, almacén, estado (badge ok/alerta/crítico).
- Gráfico de evolución de stock por insumo en el tiempo.
- Filtros: almacén, categoría, proveedor.

### 3. Producción
- Selector de línea / planta.
- Gráfico de eficiencia por línea (real vs. meta).
- Gráfico de tiempos muertos (tipo pareto, por causa).
- Tabla de lotes producidos con cantidad, meta y estado.

### 4. Calidad y Liberación Positiva
- Gráfico de tasa de aprobación / rechazo en el tiempo.
- Gráfico de correlación (dispersión) entre una variable de proceso y tasa de defecto, con selector de variable.
- Tabla de inspecciones: lote, punto de inspección, resultado, fecha.

### 5. Distribución y Ventas
- Gráfico comparativo: stock disponible vs. demanda proyectada.
- Indicador de cumplimiento de meta de venta (barra o gauge).
- Tabla de desempeño por canal o región.

### 6. Administración
- **Configuración de Metas**: formulario/tabla editable para definir metas por materia prima, por línea de producción y por canal de distribución.
- **Usuarios y Roles**: tabla de usuarios con asignación de rol (Administrador, Supervisor de Producción, Analista de Calidad, Ejecutivo — solo lectura).

## Comportamiento transversal

- Cada dashboard incluye un botón **Exportar** con opciones **Excel** y **PDF**, que genera el reporte a partir de los datos visibles en pantalla (filtros aplicados).
- El rol del usuario determina qué módulos son visibles; el módulo Administración solo es visible para el rol Administrador.
- El buscador global opera de forma consistente en todos los dashboards.

## Modelo de datos (mock)

```
RawMaterial       { id, nombre, categoria, stockActual, stockMinimo, metaCobertura, proveedor, almacen }
ProductionLine     { id, nombre, planta }
ProductionBatch    { id, lineaId, fecha, cantidadProducida, metaProduccion, eficiencia, tiempoMuerto }
QualityInspection  { id, loteId, variableProceso, valorVariable, resultado, fecha }
SalesTarget        { id, periodo, meta, ventaReal, canal }
User               { id, nombre, email, rol }
```

## Datos de muestra

Generar 2 a 3 líneas de producción y un histórico de 6 meses, con variación realista (no aleatoria plana) para que las tendencias y correlaciones entre variables resulten creíbles frente a una audiencia técnica.

## Notas de alcance

- Todos los datos son estáticos/mock; no se requiere conexión a sistemas reales (MES, SCADA, ERP).
- Prioridad: claridad ejecutiva sobre densidad de datos.
- La exportación puede implementarse con librerías del lado del cliente sobre los datos mock visibles.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/401eab14-9a08-4337-b767-c8d9e50fdafb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
