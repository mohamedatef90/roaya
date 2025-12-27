# Loading Screen Code Snippets Reference

Quick reference for key code patterns used in the Earth from Space loading screen.

---

## Stars Background Pattern

### Three-Layer Twinkling Stars

```css
/* Small distant stars */
.stars-small {
  background-image:
    radial-gradient(1px 1px at 5% 10%, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(1px 1px at 12% 25%, rgba(93, 183, 194, 0.7), transparent),
    /* ... more stars ... */
  background-size: 100% 100%;
  animation: twinkle-small 3s ease-in-out infinite;
}

@keyframes twinkle-small {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
```

**Key Features:**
- Uses `radial-gradient` for stars
- Percentage positioning for responsive scaling
- Independent twinkle animations per layer
- Brand color accents mixed with white

---

## Three.js Earth Setup

### Basic Scene Initialization

```javascript
// Create scene
scene = new THREE.Scene();

// Setup camera
camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.z = 6;

// Create renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

### Earth Sphere

```javascript
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0x2d5a7b,        // Deep ocean blue
  emissive: 0x0a1929,     // Dark emissive glow
  emissiveIntensity: 0.3,
  shininess: 10
});
earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
```

### Atmosphere Glow

```javascript
const atmosphereGeometry = new THREE.SphereGeometry(2.3, 32, 32);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x5DB7C2,        // Roaya Teal
  transparent: true,
  opacity: 0.15,
  side: THREE.BackSide    // Render from inside
});
atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);
```

### Lighting Setup

```javascript
// Ambient light for overall illumination
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

// Directional light for highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);
```

### Animation Loop

```javascript
function animate() {
  animationId = requestAnimationFrame(animate);

  // Rotate Earth slowly
  earth.rotation.y += 0.001;

  // Pulse atmosphere
  atmosphere.material.opacity = 0.12 + Math.sin(Date.now() * 0.001) * 0.05;

  renderer.render(scene, camera);
}
```

---

## Logo Reveal Animation

### Slide-Up with Elastic Bounce

```css
.roaya-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 100px)) scale(0.8);
  opacity: 0;
  z-index: 20;
  animation: logo-reveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) 2s forwards;
}

@keyframes logo-reveal {
  from {
    transform: translate(-50%, calc(-50% + 100px)) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    filter: drop-shadow(0 0 40px rgba(93, 183, 194, 0.8))
            drop-shadow(0 0 80px rgba(93, 183, 194, 0.4));
  }
}
```

**Key Features:**
- `cubic-bezier(0.34, 1.56, 0.64, 1)` creates elastic bounce
- Dual `drop-shadow` for layered glow effect
- `calc(-50% + 100px)` for precise offset positioning

---

## Loading Text with Animated Dots

```css
.loading-text {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0;
  animation: text-fade-in 0.6s ease-out 1s forwards;
}

.loading-text::after {
  content: '';
  animation: loading-dots 1.5s steps(4, end) infinite;
}

@keyframes loading-dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}
```

**Key Features:**
- Uses `::after` pseudo-element for dots
- `steps(4, end)` for discrete dot animation
- Wide letter-spacing for premium look

---

## Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .stars-small,
  .stars-medium,
  .stars-large,
  #earth-canvas-container,
  .roaya-logo,
  .loading-text {
    animation: none !important;
    opacity: 1 !important;
  }

  .roaya-logo {
    transform: translate(-50%, -50%) scale(1);
  }

  .loading-text::after {
    animation: none;
    content: '...';
  }
}
```

```javascript
// In Three.js script
if (!config.reducedMotion) {
  animate(); // Start animation loop
} else {
  renderer.render(scene, camera); // Render once, static
}
```

**Key Features:**
- Disables all animations
- Sets final state immediately
- Renders static Three.js frame
- Shows static dots for loading text

---

## Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
  #earth-canvas {
    width: 300px;
    height: 300px;
  }
  .roaya-logo {
    width: 100px;
    height: 100px;
  }
  .loading-text {
    font-size: 12px;
    bottom: 12%;
  }
}

/* Mobile */
@media (max-width: 480px) {
  #earth-canvas {
    width: 250px;
    height: 250px;
  }
  .roaya-logo {
    width: 80px;
    height: 80px;
  }
  .loading-text {
    font-size: 11px;
    bottom: 10%;
  }
}
```

**Key Features:**
- Proportional scaling for all elements
- Maintains aspect ratios
- Adjusts positioning percentages
- Font size scales down gracefully

---

## Cleanup Pattern

```javascript
function cleanup() {
  // Cancel animation frame
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
  }

  // Dispose scene objects
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

// Expose globally for Angular
window.cleanupEarthAnimation = cleanup;

// Auto-cleanup on unload
window.addEventListener('beforeunload', cleanup);
```

**Key Features:**
- Proper Three.js memory cleanup
- Traverses scene for all objects
- Handles array and single materials
- Global function for Angular integration

---

## Window Resize Handler

```javascript
function onWindowResize() {
  if (!canvas || !camera || !renderer) return;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);
```

**Key Features:**
- Updates camera aspect ratio
- Recalculates projection matrix
- Resizes renderer to match canvas
- Defensive null checks

---

## Color Reference

```javascript
// Earth Colors
const earthBlue = 0x2d5a7b;      // Deep ocean blue
const earthEmissive = 0x0a1929;  // Dark emissive glow

// Atmosphere Colors
const atmosphereTeal = 0x5DB7C2; // Roaya brand teal

// Lighting Colors
const ambientGray = 0x404040;    // Neutral ambient
const directionalWhite = 0xffffff; // Pure white

// CSS Star Colors (RGBA)
rgba(255, 255, 255, 0.9)  // White stars
rgba(93, 183, 194, 0.7)   // Teal accent stars
rgba(107, 76, 154, 0.6)   // Purple accent stars
rgba(61, 90, 128, 0.7)    // Navy accent stars
```

---

## Performance Tips

### GPU Acceleration
```css
/* Use transform and opacity for animations */
.roaya-logo {
  will-change: transform, opacity; /* Hint to browser */
  transform: translate3d(-50%, -50%, 0); /* Force GPU layer */
}
```

### Three.js Performance
```javascript
// Limit pixel ratio for performance
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Use appropriate geometry segments
SphereGeometry(2, 64, 64)  // Earth: High quality
SphereGeometry(2.3, 32, 32) // Atmosphere: Lower (transparent)
```

### Animation Performance
```javascript
// Use requestAnimationFrame (automatic 60fps throttling)
function animate() {
  animationId = requestAnimationFrame(animate);
  // ... rendering code
}

// Cancel on cleanup
cancelAnimationFrame(animationId);
```

---

## Accessibility Patterns

### ARIA Attributes
```html
<div id="loading-screen"
     role="status"
     aria-live="polite"
     aria-label="Loading Roaya IT">
  <span class="sr-only">Loading application, please wait...</span>
</div>
```

### Screen Reader Only Class
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Integration with Angular

### Fade Out on App Ready
```javascript
// In Angular component (app.component.ts)
ngOnInit() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');

    // Cleanup after fade
    setTimeout(() => {
      if (window.cleanupEarthAnimation) {
        window.cleanupEarthAnimation();
      }
      loadingScreen.remove();
    }, 600); // Match CSS transition duration
  }
}
```

### TypeScript Global Declaration
```typescript
// In typings.d.ts or component file
declare global {
  interface Window {
    cleanupEarthAnimation?: () => void;
  }
}
```

---

## Brand Color Hex to THREE.js Conversion

```javascript
// CSS Hex → THREE.js Hex
'#5DB7C2' → 0x5DB7C2  // Roaya Teal
'#3D5A80' → 0x3D5A80  // Roaya Navy
'#6B4C9A' → 0x6B4C9A  // Roaya Purple
'#2d5a7b' → 0x2d5a7b  // Deep Ocean Blue
'#0a1929' → 0x0a1929  // Dark Emissive
```

**Pattern:** Drop the `#`, prefix with `0x`

---

## Common Customizations

### Change Earth Rotation Speed
```javascript
// Slower
earth.rotation.y += 0.0005;

// Faster
earth.rotation.y += 0.002;

// Reverse direction
earth.rotation.y -= 0.001;
```

### Change Atmosphere Pulse Speed
```javascript
// Slower pulse
atmosphere.material.opacity = 0.12 + Math.sin(Date.now() * 0.0005) * 0.05;

// Faster pulse
atmosphere.material.opacity = 0.12 + Math.sin(Date.now() * 0.002) * 0.05;

// No pulse (static)
atmosphere.material.opacity = 0.15;
```

### Change Logo Reveal Timing
```css
/* Faster reveal */
animation: logo-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards;

/* Slower reveal */
animation: logo-reveal 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 2.5s forwards;

/* Less bounce */
animation: logo-reveal 1s cubic-bezier(0.4, 0, 0.2, 1) 2s forwards;
```

---

## Debugging Tips

### Check Three.js Initialization
```javascript
console.log('Scene:', scene);
console.log('Camera position:', camera.position);
console.log('Renderer size:', renderer.getSize(new THREE.Vector2()));
console.log('Earth rotation:', earth.rotation.y);
```

### Check Animation Performance
```javascript
let frameCount = 0;
let lastTime = Date.now();

function animate() {
  frameCount++;
  const now = Date.now();

  if (now - lastTime >= 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }

  // ... rest of animation code
}
```

### Check CSS Animations
```javascript
const stars = document.querySelector('.stars-small');
const computed = window.getComputedStyle(stars);
console.log('Animation:', computed.animation);
console.log('Opacity:', computed.opacity);
```

---

## File References

**Main File:** `/roaya-website/src/index.html`

**Key Sections:**
- Lines 51-302: CSS Styles
- Lines 926-949: HTML Structure
- Lines 979-1142: Three.js JavaScript

**Documentation:**
- `LOADING_SCREEN_IMPLEMENTATION.md` - Full implementation guide
- `LOADING_SCREEN_CODE_SNIPPETS.md` - This file

---

## Quick Copy-Paste Patterns

### Add New Star Layer
```css
.stars-extra {
  background-image:
    radial-gradient(1px 1px at 15% 20%, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(1px 1px at 35% 60%, rgba(93, 183, 194, 0.8), transparent);
  background-size: 100% 100%;
  animation: twinkle-extra 6s ease-in-out infinite 1.5s;
}

@keyframes twinkle-extra {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
```

### Add Another Glow Effect
```css
.roaya-logo::before {
  content: '';
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(93, 183, 194, 0.4) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite alternate;
  z-index: -1;
}

@keyframes glow-pulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(1.2); }
}
```

### Add Fade-In Effect
```css
@keyframes fade-in-slow {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element {
  opacity: 0;
  animation: fade-in-slow 1s ease-out 0.5s forwards;
}
```

---

**End of Code Snippets Reference**
