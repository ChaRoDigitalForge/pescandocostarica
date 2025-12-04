# 🌊 Guía de Est

ilos Glassmorphism

Esta guía muestra cómo usar los estilos de **glassmorphism** (efecto cristal) con degradados verde-azul en tu proyecto.

## 🎨 Paleta de Colores

- **Verde Principal**: `#10b981` (Emerald-500)
- **Azul Complementario**: `#3b82f6` (Blue-500)
- **Degradado**: Verde → Azul → Verde

## 📦 Clases Disponibles

### 1. Botones

#### `.glass-btn-primary` - Botón Principal
Botón verde con efecto cristal y borde degradado.

```jsx
<button className="glass-btn-primary px-8 py-4 rounded-lg text-white font-bold">
  EMPECEMOS
</button>
```

#### `.glass-btn-secondary` - Botón Secundario
Botón transparente con borde degradado, ideal sobre fondos oscuros.

```jsx
<button className="glass-btn-secondary px-8 py-4 rounded-lg text-white font-bold">
  Quiénes Somos
</button>
```

### 2. Cards

#### `.glass-card` - Card con Efecto Cristal
Card blanco semi-transparente con borde degradado.

```jsx
<div className="glass-card rounded-xl p-6">
  <h3 className="text-xl font-bold">Título</h3>
  <p>Contenido del card...</p>
</div>
```

#### `.glass-card-dark` - Card para Fondos Oscuros
Card oscuro para usar sobre imágenes o fondos oscuros.

```jsx
<div className="glass-card-dark rounded-xl p-6">
  <h3 className="text-xl font-bold text-white">Título</h3>
  <p className="text-gray-200">Contenido...</p>
</div>
```

#### `.glass-card-animated` - Card con Animación
Card con borde degradado animado (perfecto para elementos destacados).

```jsx
<div className="glass-card-animated rounded-xl p-6">
  <h3 className="text-xl font-bold">¡Tour Destacado!</h3>
  <p>Este borde se anima automáticamente</p>
</div>
```

### 3. Contenedores

#### `.glass-container` - Contenedor Grande
Para secciones grandes con efecto cristal.

```jsx
<div className="glass-container p-12">
  {/* Contenido de la sección */}
</div>
```

### 4. Inputs

#### `.glass-input` - Input con Efecto Cristal
Input con fondo semi-transparente y borde degradado.

```jsx
<input
  type="text"
  className="glass-input w-full px-4 py-3 rounded-lg"
  placeholder="Escribe aquí..."
/>
```

### 5. Badges

#### `.glass-badge` - Badge con Efecto Cristal
Badge destacado con fondo verde y borde degradado.

```jsx
<span className="glass-badge px-3 py-1.5 rounded text-white text-xs font-bold">
  Destacado
</span>
```

### 6. Navegación

#### `.glass-navbar` - Navbar con Efecto Cristal
Navbar sticky con fondo blur y borde degradado.

```jsx
<nav className="glass-navbar sticky top-0 z-50">
  {/* Contenido del navbar */}
</nav>
```

#### `.glass-sidebar` - Sidebar con Efecto Cristal
Sidebar con efecto cristal y gradiente vertical.

```jsx
<aside className="glass-sidebar h-full p-6">
  {/* Contenido del sidebar */}
</aside>
```

### 7. Texto

#### `.gradient-text` - Texto con Degradado
Texto con gradiente verde-azul.

```jsx
<h1 className="gradient-text text-4xl font-bold">
  Pescando Costa Rica
</h1>
```

### 8. Utilidades de Blur

Para personalizar el nivel de blur:

```jsx
<div className="glass-blur-sm">Blur suave (10px)</div>
<div className="glass-blur-md">Blur medio (20px)</div>
<div className="glass-blur-lg">Blur fuerte (30px)</div>
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Hero Section con Glassmorphism

```jsx
<section className="relative h-screen">
  {/* Imagen de fondo */}
  <Image src="/tour-detail-02.webp" fill className="object-cover" />

  {/* Contenido con efecto cristal */}
  <div className="glass-card-dark absolute inset-0 m-auto max-w-2xl h-fit p-12 rounded-3xl">
    <h1 className="gradient-text text-5xl font-bold mb-6">
      Pesca Deportiva en Costa Rica
    </h1>
    <p className="text-white text-xl mb-8">
      Vive la aventura de tu vida
    </p>
    <button className="glass-btn-primary px-8 py-4 rounded-lg font-bold text-white">
      EXPLORAR TOURS
    </button>
  </div>
</section>
```

### Ejemplo 2: Tour Card con Glassmorphism

```jsx
<Link href="/tours/tour-slug" className="block">
  <div className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
    <Image src="/tour.jpg" width={400} height={300} className="w-full" />
    <div className="p-6">
      <span className="glass-badge px-3 py-1 rounded text-xs">
        Destacado
      </span>
      <h3 className="text-xl font-bold mt-4 mb-2">
        Pesca de Marlín
      </h3>
      <p className="text-gray-600 mb-4">
        Quepos, Puntarenas
      </p>
      <div className="flex items-center justify-between">
        <span className="gradient-text text-2xl font-bold">
          $850
        </span>
        <button className="glass-btn-primary px-6 py-2 rounded-lg text-sm">
          Ver Más
        </button>
      </div>
    </div>
  </div>
</Link>
```

### Ejemplo 3: Form con Glassmorphism

```jsx
<form className="glass-container p-8 max-w-md mx-auto">
  <h2 className="gradient-text text-3xl font-bold mb-6">
    Contáctanos
  </h2>

  <div className="mb-4">
    <label className="block mb-2 font-medium">Nombre</label>
    <input
      type="text"
      className="glass-input w-full px-4 py-3 rounded-lg"
      placeholder="Tu nombre"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-2 font-medium">Email</label>
    <input
      type="email"
      className="glass-input w-full px-4 py-3 rounded-lg"
      placeholder="tu@email.com"
    />
  </div>

  <div className="mb-6">
    <label className="block mb-2 font-medium">Mensaje</label>
    <textarea
      className="glass-input w-full px-4 py-3 rounded-lg h-32"
      placeholder="Escribe tu mensaje..."
    />
  </div>

  <button className="glass-btn-primary w-full py-3 rounded-lg font-bold">
    ENVIAR MENSAJE
  </button>
</form>
```

### Ejemplo 4: Pricing Cards con Animación

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Plan Básico */}
  <div className="glass-card rounded-2xl p-8">
    <h3 className="text-2xl font-bold mb-4">Básico</h3>
    <div className="gradient-text text-5xl font-bold mb-6">
      $380
    </div>
    <ul className="space-y-3 mb-8">
      <li className="flex items-center">
        <span className="mr-2">✓</span> 4 horas
      </li>
      <li className="flex items-center">
        <span className="mr-2">✓</span> Equipo incluido
      </li>
    </ul>
    <button className="glass-btn-primary w-full py-3 rounded-lg">
      RESERVAR
    </button>
  </div>

  {/* Plan Premium (Destacado) */}
  <div className="glass-card-animated rounded-2xl p-8 transform scale-105">
    <span className="glass-badge px-3 py-1 rounded text-xs mb-4">
      MÁS POPULAR
    </span>
    <h3 className="text-2xl font-bold mb-4">Premium</h3>
    <div className="gradient-text text-5xl font-bold mb-6">
      $850
    </div>
    <ul className="space-y-3 mb-8">
      <li className="flex items-center">
        <span className="mr-2">✓</span> 8 horas
      </li>
      <li className="flex items-center">
        <span className="mr-2">✓</span> Equipo premium
      </li>
      <li className="flex items-center">
        <span className="mr-2">✓</span> Almuerzo incluido
      </li>
    </ul>
    <button className="glass-btn-primary w-full py-3 rounded-lg">
      RESERVAR
    </button>
  </div>

  {/* Plan VIP */}
  <div className="glass-card rounded-2xl p-8">
    <h3 className="text-2xl font-bold mb-4">VIP</h3>
    <div className="gradient-text text-5xl font-bold mb-6">
      $1,800
    </div>
    <ul className="space-y-3 mb-8">
      <li className="flex items-center">
        <span className="mr-2">✓</span> 8 horas
      </li>
      <li className="flex items-center">
        <span className="mr-2">✓</span> Bote de lujo
      </li>
      <li className="flex items-center">
        <span className="mr-2">✓</span> Chef a bordo
      </li>
    </ul>
    <button className="glass-btn-primary w-full py-3 rounded-lg">
      RESERVAR
    </button>
  </div>
</div>
```

## 🎨 Personalización

### Cambiar Colores del Degradado

Para cambiar los colores, edita en `globals.css`:

```css
/* De verde-azul a naranja-rosa */
linear-gradient(135deg, #f97316 0%, #ec4899 100%)

/* De verde-azul a púrpura-rosa */
linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)
```

### Ajustar Blur

```css
/* Más blur */
backdrop-filter: blur(40px);

/* Menos blur */
backdrop-filter: blur(5px);
```

### Ajustar Transparencia

```css
/* Más transparente */
background: rgba(255, 255, 255, 0.3);

/* Más opaco */
background: rgba(255, 255, 255, 0.9);
```

## 📱 Compatibilidad

Los estilos glassmorphism funcionan en:
- ✅ Chrome/Edge (completo)
- ✅ Safari (completo)
- ✅ Firefox (completo)
- ⚠️ Internet Explorer (no soportado)

## 💡 Tips de Diseño

1. **Contraste**: Usa `.glass-card-dark` sobre fondos oscuros y `.glass-card` sobre fondos claros
2. **Jerarquía**: Usa `.glass-card-animated` para elementos importantes
3. **Botones**: Usa `.glass-btn-primary` para acciones principales y `.glass-btn-secondary` para secundarias
4. **Legibilidad**: Asegúrate que el texto tenga suficiente contraste sobre el fondo blur
5. **Performance**: No uses demasiados elementos con blur en móviles

## 🚀 Próximos Pasos

1. Reemplaza los botones regulares con `.glass-btn-primary`
2. Actualiza las cards de tours con `.glass-card`
3. Aplica `.glass-navbar` al navigation bar
4. Usa `.gradient-text` en títulos principales
5. Experimenta con `.glass-card-animated` en elementos destacados

¡Disfruta creando interfaces modernas con glassmorphism! 🎨✨
