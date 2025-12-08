# Image Implementation - Quick Start Guide

> **Quick reference for implementing the image solution immediately**
> **Estimated Setup Time:** 2-3 hours

---

## TL;DR - Do This First

1. **Register for free API keys** (5 minutes)
2. **Install dependencies** (2 minutes)
3. **Copy provided service code** (10 minutes)
4. **Run image fetch script** (15 minutes)
5. **Use LazyImageComponent** in templates (ongoing)

**Total Cost:** $0-5 (optional DALL-E for custom hero)

---

## Step 1: Register for API Keys (5 min)

### Unsplash (Primary Source)
1. Go to [https://unsplash.com/developers](https://unsplash.com/developers)
2. Click "Register as a Developer"
3. Create a new application
4. Copy your **Access Key**
5. Save to `.env` file (create if doesn't exist):

```bash
# .env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### Pexels (Backup Source)
1. Go to [https://www.pexels.com/api/](https://www.pexels.com/api/)
2. Click "Get Started"
3. Generate API Key
4. Add to `.env`:

```bash
PEXELS_API_KEY=your_pexels_api_key_here
```

### Optional: OpenAI (Custom Heroes)
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create API key
3. Get $5 free credits (no credit card)
4. Add to `.env`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Step 2: Install Dependencies (2 min)

```bash
cd /Users/mohamedatef/Downloads/roaya/roaya-website

# For build scripts
npm install -D tsx node-fetch@2 @types/node

# For image optimization (optional, recommended)
npm install -D sharp @types/sharp
```

---

## Step 3: Create Environment Configuration (5 min)

**Update `src/environments/environment.ts`:**

```typescript
export const environment = {
  production: false,
  unsplashAccessKey: 'YOUR_UNSPLASH_KEY', // Replace with actual key
  pexelsApiKey: 'YOUR_PEXELS_KEY',
};
```

**Update `src/environments/environment.prod.ts`:**

```typescript
export const environment = {
  production: true,
  unsplashAccessKey: process.env['UNSPLASH_ACCESS_KEY'] || '',
  pexelsApiKey: process.env['PEXELS_API_KEY'] || '',
};
```

---

## Step 4: Create Image Directories (1 min)

```bash
mkdir -p src/assets/images/{hero,cloud,security,email,managed-it,finance,healthcare,government,manufacturing,retail,education,case-studies,fallback}
```

---

## Step 5: Copy Image Manager Service (5 min)

**Create: `src/app/core/services/image-manager.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@/environments/environment';

export interface ImageSource {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageManagerService {
  private readonly http = inject(HttpClient);

  getImageForSection(section: string, query: string): Observable<ImageSource> {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return of(this.getLocalFallback(section));
    }

    // Try Unsplash first
    return this.fetchFromUnsplash(query).pipe(
      catchError(() => this.fetchFromPexels(query)),
      catchError(() => of(this.getLocalFallback(section)))
    );
  }

  private fetchFromUnsplash(query: string): Observable<ImageSource> {
    return this.http.get('https://api.unsplash.com/photos/random', {
      headers: { 'Authorization': `Client-ID ${environment.unsplashAccessKey}` },
      params: { query, orientation: 'landscape' }
    }).pipe(
      map((response: any) => ({
        url: response.urls.regular,
        alt: response.alt_description || query,
        photographer: response.user.name,
        photographerUrl: response.user.links.html
      }))
    );
  }

  private fetchFromPexels(query: string): Observable<ImageSource> {
    return this.http.get('https://api.pexels.com/v1/search', {
      headers: { 'Authorization': environment.pexelsApiKey },
      params: { query, per_page: '1', orientation: 'landscape' }
    }).pipe(
      map((response: any) => ({
        url: response.photos[0].src.large,
        alt: query,
        photographer: response.photos[0].photographer,
        photographerUrl: response.photos[0].photographer_url
      }))
    );
  }

  private getLocalFallback(section: string): ImageSource {
    return {
      url: `/assets/images/fallback/${section}.jpg`,
      alt: `${section} image`
    };
  }
}
```

---

## Step 6: Create Lazy Image Component (10 min)

**Create: `src/app/shared/components/lazy-image/lazy-image.component.ts`**

```typescript
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden bg-surface rounded-lg">
      @if (!isLoaded()) {
        <div class="absolute inset-0 bg-gradient-to-br from-navy to-teal animate-pulse"></div>
      }

      <img
        [src]="src"
        [alt]="alt"
        [loading]="loading"
        (load)="onLoad()"
        (error)="onError()"
        [class.opacity-0]="!isLoaded()"
        class="w-full h-full object-cover transition-opacity duration-300"
      />

      @if (photographer && isLoaded()) {
        <div class="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          Photo by
          <a [href]="photographerUrl" target="_blank" rel="noopener" class="underline">
            {{ photographer }}
          </a>
        </div>
      }
    </div>
  `
})
export class LazyImageComponent {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) alt!: string;
  @Input() photographer?: string;
  @Input() photographerUrl?: string;
  @Input() loading: 'lazy' | 'eager' = 'lazy';

  isLoaded = signal(false);

  onLoad() {
    this.isLoaded.set(true);
  }

  onError() {
    console.error(`Failed to load image: ${this.src}`);
  }
}
```

---

## Step 7: Use in Components (Ongoing)

**Example: Hero Section**

```typescript
// features/home/home.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ImageManagerService } from '@/core/services/image-manager.service';
import { LazyImageComponent } from '@/shared/components/lazy-image/lazy-image.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LazyImageComponent],
  template: `
    <section class="relative h-screen">
      @if (heroImage) {
        <app-lazy-image
          [src]="heroImage.url"
          [alt]="heroImage.alt"
          [photographer]="heroImage.photographer"
          [photographerUrl]="heroImage.photographerUrl"
          loading="eager"
          class="absolute inset-0 w-full h-full"
        />
      }

      <div class="relative z-10 flex items-center justify-center h-full">
        <h1 class="text-6xl font-bold text-white">Roaya IT</h1>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private readonly imageManager = inject(ImageManagerService);
  heroImage: any;

  ngOnInit() {
    this.imageManager
      .getImageForSection('hero', 'abstract technology network')
      .subscribe(image => this.heroImage = image);
  }
}
```

---

## Step 8: Create Fallback Images (10 min)

**Option A: Simple Gradients (Quick)**

Create simple SVG gradients as fallbacks:

```bash
# Create fallback directory
mkdir -p src/assets/images/fallback
```

**Create: `src/assets/images/fallback/hero.svg`**

```svg
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3D5A80;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5DB7C2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad)" />
</svg>
```

**Option B: Download from Unsplash Manually (Better)**

1. Visit [https://unsplash.com/s/photos/abstract-technology](https://unsplash.com/s/photos/abstract-technology)
2. Download 1-2 images per section
3. Save to `src/assets/images/fallback/{section}.jpg`

---

## Step 9: Add Attribution Footer (5 min)

**Update: `src/app/layouts/main-layout/footer/footer.component.html`**

Add at the bottom of footer:

```html
<div class="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700 text-center">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    Images provided by
    <a href="https://unsplash.com" target="_blank" rel="noopener" class="underline hover:text-teal">
      Unsplash
    </a>
    and
    <a href="https://pexels.com" target="_blank" rel="noopener" class="underline hover:text-teal">
      Pexels
    </a>
  </p>
</div>
```

---

## Step 10: Test It (5 min)

```bash
npm run dev
```

Visit `http://localhost:4200` and check:
- ✅ Images load from Unsplash/Pexels
- ✅ Fallback works if API fails
- ✅ Attribution appears on images
- ✅ Smooth loading animation

---

## Quick Image Queries Reference

Use these queries when calling `ImageManagerService`:

```typescript
const IMAGE_QUERIES = {
  // Hero Sections
  hero: 'abstract technology network gradient',
  heroAlt1: 'digital transformation data visualization',
  heroAlt2: '3d geometric shapes technology',

  // Services
  cloud: 'cloud computing data center blue',
  security: 'cybersecurity digital shield lock',
  email: 'email communication collaboration',
  managedIT: 'IT support monitoring dashboard',

  // Industries
  finance: 'banking finance technology modern',
  healthcare: 'healthcare hospital medical technology',
  government: 'government building architecture modern',
  manufacturing: 'smart factory industry 4.0 automation',
  retail: 'retail store technology e-commerce',
  education: 'educational technology online learning',

  // Other
  team: 'diverse business team meeting modern office',
  office: 'modern office workspace technology',
  success: 'business success growth chart',
};
```

---

## Optional: Build-Time Image Fetching

**Create: `scripts/fetch-images.js`**

```javascript
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const IMAGES_DIR = 'src/assets/images';

const IMAGE_CONFIGS = [
  { section: 'hero', query: 'abstract technology network', count: 3 },
  { section: 'cloud', query: 'cloud computing data center', count: 3 },
  { section: 'security', query: 'cybersecurity shield lock', count: 3 },
  // Add more as needed
];

async function fetchImages() {
  console.log('Fetching images from Unsplash...\n');

  for (const config of IMAGE_CONFIGS) {
    const sectionDir = path.join(IMAGES_DIR, config.section);

    // Create directory if it doesn't exist
    if (!fs.existsSync(sectionDir)) {
      fs.mkdirSync(sectionDir, { recursive: true });
    }

    console.log(`Fetching ${config.count} images for ${config.section}...`);

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(config.query)}&per_page=${config.count}&orientation=landscape`,
      {
        headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` }
      }
    );

    const data = await response.json();

    for (let i = 0; i < data.results.length; i++) {
      const photo = data.results[i];
      const imageUrl = photo.urls.regular;
      const filename = `${config.section}-${i + 1}.jpg`;
      const filepath = path.join(sectionDir, filename);

      const imageResponse = await fetch(imageUrl);
      await pipeline(
        imageResponse.body,
        fs.createWriteStream(filepath)
      );

      console.log(`  ✓ Downloaded ${filename}`);
    }
  }

  console.log('\n✅ All images downloaded successfully!');
}

fetchImages().catch(err => {
  console.error('Error fetching images:', err);
  process.exit(1);
});
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "fetch-images": "node scripts/fetch-images.js",
    "prebuild": "npm run fetch-images"
  }
}
```

**Run manually:**

```bash
npm run fetch-images
```

---

## Troubleshooting

### Issue: API Returns 401 Unauthorized
**Solution:** Check API key in `environment.ts` is correct

### Issue: Images Not Loading
**Solution:** Check browser console, verify CORS is allowed (should be by default)

### Issue: Fallback Images Not Showing
**Solution:** Ensure fallback images exist in `src/assets/images/fallback/`

### Issue: Attribution Not Appearing
**Solution:** Verify `photographer` and `photographerUrl` are passed to component

---

## Next Steps

1. ✅ **Immediate:** Implement basic image loading (Steps 1-9)
2. 🔄 **This Week:** Add build-time fetching script
3. 📊 **Next Week:** Add image optimization (WebP/AVIF)
4. 🎨 **Future:** Consider DALL-E for custom branded heroes

---

## Cost Breakdown

| Item | Cost | When |
|------|------|------|
| Unsplash API | $0 | Always free |
| Pexels API | $0 | Always free |
| Development Time | 2-3 hours | One-time |
| DALL-E Custom Heroes (optional) | $5-10 | One-time |
| **Total** | **$0-10** | **One-time** |

---

## Support & Resources

- **Unsplash API Docs:** https://unsplash.com/documentation
- **Pexels API Docs:** https://www.pexels.com/api/documentation/
- **Full Guide:** `/docs/IMAGE_IMPLEMENTATION_GUIDE.md`
- **Questions:** Check comprehensive guide for detailed technical implementation

---

**Last Updated:** 2025-12-06
**Maintained By:** Super Tech Lead + UI Design Expert
