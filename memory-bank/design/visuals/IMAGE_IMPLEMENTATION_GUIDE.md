# Roaya IT Website - Image Implementation Guide

> **Author:** UI Design Expert + Super Tech Lead
> **Date:** 2025-12-06
> **Status:** Comprehensive Research & Recommendations

---

## Executive Summary

This guide provides comprehensive recommendations for automatically implementing real images and AI-generated images for the Roaya IT corporate website. After extensive research into stock APIs and AI image generation platforms, we recommend a **hybrid approach** combining free stock APIs with selective AI generation for custom branded content.

**Recommended Solution:** Unsplash API (primary) + Pexels API (backup) + Canva API (custom graphics) + Build-time generation

**Estimated Monthly Cost:** $0-$50 (depending on custom graphic needs)

---

## Table of Contents

1. [Stock Image APIs Research](#stock-image-apis-research)
2. [AI Image Generation APIs Research](#ai-image-generation-apis-research)
3. [Hybrid Solutions](#hybrid-solutions)
4. [Implementation Strategies](#implementation-strategies)
5. [Section-Specific Recommendations](#section-specific-recommendations)
6. [Technical Implementation](#technical-implementation)
7. [Budget Comparison](#budget-comparison)
8. [Final Recommendation](#final-recommendation)

---

## Stock Image APIs Research

### 1. Unsplash API ⭐ RECOMMENDED

**Overview:** Free, high-quality photo API with millions of images from talented photographers.

#### Pricing & Limits
- **Demo Mode:** 50 requests/hour (FREE)
- **Production Mode:** 5,000 requests/hour (FREE with approval)
- **Requirements:** Must attribute photographers and Unsplash
- **Enterprise:** Small monthly fee for high-volume partners (95%+ partners get free access)

#### Image Quality
- **Resolution:** High-quality, professional photography
- **Variety:** Extensive tech, business, abstract, and corporate imagery
- **Curation:** Hand-picked, trending photos

#### Search Capabilities
- Full-text search by keywords
- Color-based filtering
- Orientation (landscape, portrait, square)
- Collections and curated sets

#### Angular Integration
```typescript
// service/unsplash.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api.unsplash.com';
  private readonly ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

  searchPhotos(query: string, perPage = 10): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Client-ID ${this.ACCESS_KEY}`
    });

    return this.http.get(`${this.API_URL}/search/photos`, {
      headers,
      params: { query, per_page: perPage.toString() }
    });
  }

  getRandomPhoto(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Client-ID ${this.ACCESS_KEY}`
    });

    return this.http.get(`${this.API_URL}/photos/random`, {
      headers,
      params: { query }
    });
  }
}
```

#### Rate Limits
- **50 requests/hour** (Demo) - Perfect for development
- **5,000 requests/hour** (Production) - More than sufficient
- Image file requests do NOT count against limit (only JSON API requests)

#### Pros
- Completely free for most use cases
- Excellent image quality
- Large library of business/tech images
- Simple RESTful API
- No watermarks

#### Cons
- Must provide attribution
- Limited to stock photography (no custom branded imagery)

#### Best For
- Hero sections, service backgrounds, industry imagery

---

### 2. Pexels API ⭐ BACKUP OPTION

**Overview:** Free stock photo and video API with over 1 million assets.

#### Pricing & Limits
- **Default:** 200 requests/hour, 20,000 requests/month (FREE)
- **Unlimited:** Available FREE if you provide acceptable attribution
- **No fees:** Truly free for commercial and personal use

#### Image Quality
- High-quality curated photos and videos
- Similar quality to Unsplash
- Excellent for tech and business content

#### Search Capabilities
- RESTful JSON API
- Search by keywords
- Filter by orientation, size, color
- Video search available

#### Angular Integration
```typescript
// service/pexels.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PexelsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api.pexels.com/v1';
  private readonly API_KEY = 'YOUR_PEXELS_API_KEY';

  searchPhotos(query: string, perPage = 15): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.API_KEY
    });

    return this.http.get(`${this.API_URL}/search`, {
      headers,
      params: { query, per_page: perPage.toString() }
    });
  }

  getCuratedPhotos(perPage = 15): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.API_KEY
    });

    return this.http.get(`${this.API_URL}/curated`, {
      headers,
      params: { per_page: perPage.toString() }
    });
  }
}
```

#### Rate Limits
- 200 requests/hour (default)
- 20,000 requests/month (default)
- Can be increased to unlimited for free with proper attribution

#### Pros
- Completely free
- Video support
- Simpler attribution requirements
- Good mobile app photos

#### Cons
- Smaller library than Unsplash
- Requires API key for all requests

#### Best For
- Case study imagery, team photos, industry-specific visuals

---

### 3. Pixabay API

**Overview:** Free images, videos, and illustrations API.

#### Pricing & Limits
- **Free:** 100 requests per minute
- **Requirements:** 24-hour caching, attribution recommended
- **No hotlinking:** Must download images to your server

#### Image Quality
- Good variety of stock photos and illustrations
- Mix of professional and amateur photography
- Some lower quality compared to Unsplash/Pexels

#### Search Capabilities
- Keyword search
- Filter by image type, orientation, category, color
- Minimum image size filtering

#### Rate Limits
- 100 requests per minute
- Must cache results for 24 hours

#### Pros
- Completely free
- No attribution required (but recommended)
- Includes illustrations and vectors

#### Cons
- Cannot hotlink images (must download to server)
- Variable image quality
- Smaller selection of business/tech images

#### Best For
- Illustrations, icons, supplementary imagery

---

### 4. Shutterstock API

**Overview:** Premium stock photo service with enterprise API.

#### Pricing
- **Subscription-based:** Plans start around $29/month for 10 images
- **Enterprise API:** Custom pricing, contact sales
- **Pay-per-download:** Variable pricing

#### Image Quality
- Professional, high-quality stock photography
- Largest library (over 178,000+ cloud security images alone)
- Consistent quality standards

#### Search Capabilities
- Advanced search with AI-powered recommendations
- Extensive metadata and categorization
- Similar image search

#### Pros
- Highest quality images
- No attribution required
- Comprehensive library
- Enterprise support

#### Cons
- Expensive for small projects
- Subscription or per-image cost
- Overkill for MVP website

#### Best For
- Enterprise clients with budget, mission-critical branded content

---

### 5. Getty Images API

**Overview:** Premium stock imagery with enterprise-grade licensing.

#### Pricing
- **Enterprise-only:** Custom pricing
- **High cost:** Not suitable for small businesses
- **Subscription required:** Annual contracts

#### Image Quality
- Highest professional standards
- Exclusive content
- Editorial and creative imagery

#### Pros
- Premium brand imagery
- Comprehensive licensing
- No AI-generated content

#### Cons
- Very expensive
- Complex licensing
- Not practical for Roaya IT budget

#### Best For
- Large enterprises, Fortune 500 companies

---

## AI Image Generation APIs Research

### 1. OpenAI DALL-E 3

**Overview:** State-of-the-art text-to-image AI from OpenAI.

#### Pricing (2025)
- **Standard 1024x1024:** $0.040/image
- **Standard 1024x1792 or 1792x1024:** $0.080/image
- **HD 1024x1024:** $0.080/image
- **HD 1024x1792 or 1792x1024:** $0.120/image
- **Free Credits:** $5 for new users (no credit card required)

#### Image Quality for Tech/Business
- **Excellent** for UI mockups and interface prototypes
- Superior understanding of UI elements and design principles
- Photorealistic business imagery
- Good prompt adherence

#### API Availability
- Available through OpenAI API
- RESTful API with Python/Node.js SDKs
- Real-time generation (30-60 seconds per image)

#### Best Use Cases
- Custom hero graphics with specific branding
- Abstract tech visualizations
- 3D mockups and device screenshots
- Conceptual illustrations

#### Pros
- Best-in-class prompt understanding
- Photorealistic results
- Good for UI/UX mockups
- Available via API

#### Cons
- Expensive for volume use ($4-12 per 100 images)
- Can't guarantee brand consistency
- May require multiple attempts for perfect results

#### Estimated Cost for Roaya IT
- 50 custom images (standard quality): $2.00
- 20 HD hero images: $1.60
- **Total one-time cost:** ~$3.60-$10

---

### 2. Stability AI (Stable Diffusion)

**Overview:** Open-source AI image generation with flexible licensing.

#### Pricing (2025)
- **Community License:** FREE for individuals and businesses under $1M annual revenue
- **Enterprise License:** Custom pricing for businesses over $1M
- **Third-party APIs:** $0.01-0.05 per image (via providers like Replicate)

#### Image Quality
- Excellent for artistic and abstract imagery
- Good for tech backgrounds and patterns
- Can be less photorealistic than DALL-E 3

#### API Availability
- Official Stability AI API
- Third-party providers (Replicate, Hugging Face)
- Self-hosted option (requires GPU)

#### Best Use Cases
- Abstract backgrounds and gradients
- Tech-themed patterns
- Artistic hero sections
- Custom textures

#### Pros
- Free for small businesses (Roaya IT qualifies)
- Open-source model
- Self-hosting option
- Fast generation

#### Cons
- Requires more prompt engineering
- Less consistent quality than DALL-E
- May need multiple iterations

#### Estimated Cost for Roaya IT
- **FREE** (under Community License)
- Infrastructure costs only if self-hosting

---

### 3. Adobe Firefly

**Overview:** Enterprise-grade AI image generation with commercial safety.

#### Pricing (2025)
- **Teams Plan:** ~$50+/month with generative credits
- **Enterprise:** Custom pricing (contact sales)
- **API Access:** $0.04-0.12 per image (similar to DALL-E 3)

#### Image Quality
- Excellent for business and marketing content
- Commercial-safe (trained on Adobe Stock)
- Consistent brand-safe results

#### API Availability
- Firefly Services API (30+ generative AI APIs)
- RESTful API with SDKs
- Integration with Adobe Creative Cloud

#### Best Use Cases
- Branded marketing materials
- Product visualizations
- Custom branded graphics
- On-brand content at scale

#### Pros
- Commercial-safe (no copyright issues)
- Excellent for business use
- IP indemnification available
- Integration with Adobe ecosystem

#### Cons
- Expensive ($50+/month minimum)
- Requires subscription
- Overkill for website imagery

#### Estimated Cost for Roaya IT
- **Minimum:** $50/month (Teams plan)
- **Not cost-effective** for simple website images

---

### 4. Leonardo.ai

**Overview:** Gaming and tech-focused AI image generation.

#### Pricing
- **Free Tier:** 10 slow credits/day
- **Basic Plan:** $8/month (400 priority credits)
- **Plus Plan:** $20/month (1,000 credits)
- **Pro Plan:** $60/month (3,000 credits)

#### Image Quality
- Excellent for tech and gaming aesthetics
- Good for futuristic and abstract designs
- Strong character consistency features

#### API Availability
- API available for enterprise (1M+ images/month minimum)
- Contact sales for API access

#### Best Use Cases
- Tech-themed illustrations
- Futuristic backgrounds
- Gaming/IT visualizations

#### Pros
- Affordable subscription plans
- Good for tech aesthetics
- Fast generation

#### Cons
- API requires enterprise volume
- More suited for gaming than corporate
- UI subscription model (not API)

---

### 5. Ideogram

**Overview:** AI image generation with superior text rendering in images.

#### Pricing
- **Free Plan:** 10 slow credits/day
- **Basic:** $8/month (400 credits)
- **Plus:** $20/month (1,000 credits)
- **Pro:** $60/month (3,000 credits)
- **Enterprise API:** 1M images/month minimum

#### Image Quality
- **Best-in-class** for readable text in images
- Excellent for infographics and diagrams
- Good for design-focused imagery

#### API Availability
- Available for enterprise (high volume required)
- RESTful API access

#### Best Use Cases
- Infographics with text
- Diagrams and flowcharts
- Branded graphics with company name
- Social media graphics

#### Pros
- Unmatched text rendering
- Good for diagrams
- Competitive pricing

#### Cons
- Enterprise API requires 1M images/month
- Consumer plans don't include API
- High minimum for API access

---

## Hybrid Solutions

### 1. Canva API ⭐ RECOMMENDED FOR CUSTOM GRAPHICS

**Overview:** Design automation platform with free API access.

#### Pricing
- **Connect APIs:** FREE for public integrations
- **Private Integrations:** FREE for teams on Canva Enterprise plan
- **No API fees:** Completely free to use

#### Features
- **Design Editing API:** Automate design creation and editing
- **Autofill API:** Populate templates with data
- **Brand Templates API:** Generate on-brand designs at scale
- **Data Connectors:** Pull in business data automatically

#### Angular Integration Example
```typescript
// service/canva.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanvaService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api.canva.com/v1';
  private readonly ACCESS_TOKEN = 'YOUR_CANVA_ACCESS_TOKEN';

  createDesign(templateId: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.API_URL}/designs`, {
      template_id: templateId,
      data
    }, { headers });
  }

  exportDesign(designId: string, format = 'png'): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.ACCESS_TOKEN}`
    });

    return this.http.get(`${this.API_URL}/designs/${designId}/export`, {
      headers,
      params: { format },
      responseType: 'blob'
    });
  }
}
```

#### Best Use Cases
- Custom hero graphics with Roaya branding
- Industry-specific illustrations
- Service card backgrounds
- Case study visuals

#### Pros
- **Completely FREE**
- On-brand design automation
- No design skills required
- Template-based consistency

#### Cons
- Requires Canva Enterprise for private integrations
- Learning curve for API setup
- Need to create templates first

---

### 2. Adobe Express API

**Overview:** Creative automation from Adobe.

#### Pricing
- **Subscription-based:** Part of Adobe Creative Cloud
- **Not standalone:** Requires broader Adobe subscription

#### Pros
- Professional design tools
- Adobe ecosystem integration

#### Cons
- Expensive
- Complex setup
- Overkill for simple website images

---

### 3. Designs.ai

**Overview:** AI design platform for automation.

#### Pricing
- **Subscription-based:** Starting at $29/month

#### Pros
- All-in-one design automation
- Multiple content types

#### Cons
- Monthly cost
- Less established than competitors

---

## Implementation Strategies

### Strategy A: Build-Time Image Generation ⭐ RECOMMENDED

**Concept:** Generate and download images during the build process, store in `src/assets/images/`.

#### How It Works
1. Create a Node.js script that runs during `npm run build`
2. Script fetches images from Unsplash/Pexels based on predefined queries
3. Downloads images to `src/assets/images/{section}/`
4. Generates WebP/AVIF versions for performance
5. Creates a JSON manifest with image metadata

#### Implementation
```typescript
// scripts/fetch-images.ts
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';

interface ImageConfig {
  section: string;
  query: string;
  count: number;
  size: 'small' | 'medium' | 'large';
}

const IMAGE_CONFIGS: ImageConfig[] = [
  { section: 'hero', query: 'abstract technology network', count: 3, size: 'large' },
  { section: 'cloud', query: 'cloud computing data center', count: 5, size: 'medium' },
  { section: 'security', query: 'cybersecurity shield lock', count: 5, size: 'medium' },
  { section: 'email', query: 'email communication collaboration', count: 3, size: 'medium' },
  { section: 'managed-it', query: 'IT support monitoring dashboard', count: 3, size: 'medium' },
  { section: 'finance', query: 'banking finance technology', count: 3, size: 'medium' },
  { section: 'healthcare', query: 'healthcare hospital medical', count: 3, size: 'medium' },
  { section: 'government', query: 'government building official', count: 3, size: 'medium' },
];

async function fetchImages() {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  for (const config of IMAGE_CONFIGS) {
    console.log(`Fetching ${config.count} images for ${config.section}...`);

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(config.query)}&per_page=${config.count}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    const data = await response.json();

    for (let i = 0; i < data.results.length; i++) {
      const photo = data.results[i];
      const imageUrl = photo.urls[config.size];
      const filePath = `src/assets/images/${config.section}/image-${i + 1}.jpg`;

      // Download image
      const imageResponse = await fetch(imageUrl);
      await pipeline(
        imageResponse.body,
        createWriteStream(filePath)
      );

      console.log(`  Downloaded ${filePath}`);
    }
  }

  console.log('All images downloaded successfully!');
}

fetchImages().catch(console.error);
```

#### Add to package.json
```json
{
  "scripts": {
    "fetch-images": "tsx scripts/fetch-images.ts",
    "prebuild": "npm run fetch-images",
    "build": "ng build"
  }
}
```

#### Pros
- No runtime API calls (faster page load)
- Images cached in version control (optional)
- Predictable performance
- Works offline after build
- No CORS issues

#### Cons
- Larger repository size if images committed
- Manual rebuild needed for new images
- Not dynamic

#### Best For
- Production websites with stable imagery
- SEO-critical pages
- Performance-first approach

---

### Strategy B: Runtime API Calls

**Concept:** Fetch images from APIs when pages load, with caching and fallbacks.

#### How It Works
1. Angular service fetches images from Unsplash/Pexels on page load
2. Cache responses in localStorage/IndexedDB
3. Display loading skeletons while fetching
4. Fall back to local placeholder if API fails

#### Implementation
```typescript
// service/image-loader.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';

interface CachedImage {
  url: string;
  timestamp: number;
  photographer: string;
}

@Injectable({ providedIn: 'root' })
export class ImageLoaderService {
  private readonly http = inject(HttpClient);
  private readonly CACHE_KEY_PREFIX = 'roaya_image_';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  getImage(section: string, query: string): Observable<CachedImage> {
    // Check cache first
    const cached = this.getFromCache(section);
    if (cached) {
      return of(cached);
    }

    // Fetch from API
    return this.fetchFromUnsplash(query).pipe(
      tap(image => this.saveToCache(section, image)),
      catchError(() => of(this.getFallbackImage(section)))
    );
  }

  private fetchFromUnsplash(query: string): Observable<CachedImage> {
    const headers = {
      'Authorization': 'Client-ID YOUR_ACCESS_KEY'
    };

    return this.http.get('https://api.unsplash.com/photos/random', {
      headers,
      params: { query }
    }).pipe(
      map((response: any) => ({
        url: response.urls.regular,
        timestamp: Date.now(),
        photographer: response.user.name
      }))
    );
  }

  private getFromCache(section: string): CachedImage | null {
    const cached = localStorage.getItem(`${this.CACHE_KEY_PREFIX}${section}`);
    if (!cached) return null;

    const parsed: CachedImage = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > this.CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(`${this.CACHE_KEY_PREFIX}${section}`);
      return null;
    }

    return parsed;
  }

  private saveToCache(section: string, image: CachedImage): void {
    localStorage.setItem(
      `${this.CACHE_KEY_PREFIX}${section}`,
      JSON.stringify(image)
    );
  }

  private getFallbackImage(section: string): CachedImage {
    return {
      url: `/assets/images/fallback/${section}.jpg`,
      timestamp: Date.now(),
      photographer: 'Roaya IT'
    };
  }
}
```

#### Component Usage
```typescript
// feature/services/cloud.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ImageLoaderService } from '@/core/services/image-loader.service';

@Component({
  selector: 'app-cloud',
  template: `
    <section class="hero">
      @if (heroImage) {
        <img
          [src]="heroImage.url"
          alt="Cloud Computing"
          loading="eager"
          class="hero-image"
        />
        <p class="attribution">Photo by {{ heroImage.photographer }}</p>
      } @else {
        <div class="skeleton"></div>
      }
    </section>
  `
})
export class CloudComponent implements OnInit {
  private readonly imageLoader = inject(ImageLoaderService);
  heroImage: { url: string; photographer: string } | null = null;

  ngOnInit() {
    this.imageLoader.getImage('cloud', 'cloud computing data center')
      .subscribe(image => this.heroImage = image);
  }
}
```

#### Pros
- Dynamic image updates
- Smaller codebase
- Fresh content

#### Cons
- Slower initial page load
- Requires internet connection
- CORS configuration needed
- More complex error handling

#### Best For
- Admin panels
- Internal tools
- Frequently updated content

---

### Strategy C: CMS Integration with Strapi ⭐ FUTURE CONSIDERATION

**Concept:** Use headless CMS with built-in image management and AI-powered recommendations.

#### Strapi Benefits
- **Built-in Media Library:** Upload, organize, and optimize images
- **AI-Generated Captions:** Automatic alt text for accessibility and SEO
- **Responsive Images:** Automatic generation of different sizes
- **Cloud Storage:** Integrate with AWS S3, Cloudinary
- **WebP/AVIF Support:** Automatic format conversion

#### When to Consider
- Content team needs to manage images
- Frequent content updates required
- Multi-language asset management
- Larger team collaboration

#### Pros
- Full content management
- AI-powered alt text
- Team collaboration
- Version control for assets

#### Cons
- Additional infrastructure
- Hosting costs
- Setup complexity
- Overkill for static website

#### Best For
- Post-MVP with content team
- Websites with frequent updates
- Enterprise content management

---

## Section-Specific Recommendations

### 1. Hero Section - Abstract Tech Visuals, 3D Renders

**Image Requirements:**
- **Dimensions:** 1920x1080 (landscape, full-width)
- **Style:** Abstract, futuristic, tech-focused
- **Colors:** Navy (#3D5A80), Teal (#5DB7C2), Purple (#6B4C9A) gradients
- **Count:** 3 variations for rotation

**Recommended Sources:**
1. **Unsplash Keywords:** "abstract technology network", "digital transformation", "tech background gradient"
2. **AI Generation (DALL-E 3):** Custom branded hero with Roaya colors
   - Prompt: "Abstract 3D network visualization with navy blue, teal, and purple gradient, floating geometric shapes, clean modern corporate style, depth of field"
   - Cost: $0.08 per image (HD quality)

**Example Images from Research:**
- Awwwards 3D hero sections: Interactive 3D meshes, gradient backgrounds
- Geometric shapes, waves, layered color blocks

**Implementation:**
```typescript
// hero.component.ts
heroImages = [
  '/assets/images/hero/abstract-network-1.webp',
  '/assets/images/hero/abstract-network-2.webp',
  '/assets/images/hero/abstract-network-3.webp'
];

currentHeroIndex = 0;

ngOnInit() {
  // Rotate hero images every 8 seconds
  setInterval(() => {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }, 8000);
}
```

---

### 2. Cloud Services - Cloud Infrastructure, Servers, Data Centers

**Image Requirements:**
- **Dimensions:** 800x600 (landscape, medium)
- **Style:** Professional, tech-focused, data center imagery
- **Count:** 5 images

**Unsplash Keywords:**
- "cloud computing data center"
- "server room technology"
- "network infrastructure"
- "cloud storage visualization"

**Pexels Keywords:**
- "cloud computing"
- "data center"
- "server technology"

**Example Image Characteristics:**
- Blue/teal lighting (matches brand)
- Server racks, cables, infrastructure
- Cloud network diagrams
- Modern, clean, professional

**Fallback:** Abstract cloud network illustrations from Pixabay (free, no attribution)

---

### 3. Cybersecurity - Security Shields, Locks, Networks

**Image Requirements:**
- **Dimensions:** 800x600
- **Style:** Secure, trustworthy, protective
- **Count:** 5 images

**Unsplash Keywords:**
- "cybersecurity shield"
- "digital security lock"
- "network security"
- "data protection"

**Stock Sites with Security Images:**
- Shutterstock: 178,000+ cloud security images
- iStock: 5,500+ security-themed photos
- Unsplash: Thousands of security visuals (free)

**Color Palette:**
- Navy blue (trust, security)
- Teal accents (technology)
- Red for alerts/warnings (sparingly)

**AI Alternative (Stable Diffusion - FREE):**
- Prompt: "Digital security shield hologram, navy blue and teal colors, corporate IT security, clean modern style"

---

### 4. Email Services - Communication, Collaboration

**Image Requirements:**
- **Dimensions:** 800x600
- **Style:** Collaborative, productive, professional
- **Count:** 3 images

**Unsplash Keywords:**
- "email communication business"
- "team collaboration office"
- "digital communication"
- "workplace productivity"

**Image Themes:**
- People working together (diverse, professional)
- Email interface mockups
- Communication icons and symbols
- Office collaboration spaces

---

### 5. Managed IT - Support Teams, Monitoring Dashboards

**Image Requirements:**
- **Dimensions:** 800x600
- **Style:** Supportive, reliable, technical
- **Count:** 3 images

**Unsplash Keywords:**
- "IT support team"
- "network monitoring dashboard"
- "help desk support"
- "technical support professional"

**Image Themes:**
- IT professionals at work
- Dashboard screenshots (can use DALL-E to generate branded dashboards)
- Server monitoring visualizations

**DALL-E Custom Option:**
- Generate custom dashboard mockups with Roaya branding
- Prompt: "Modern IT monitoring dashboard, dark mode, navy and teal color scheme, network statistics, clean UI design"
- Cost: $0.04 per image

---

### 6. Industries - Sector-Specific Imagery

#### Finance & Banking
- **Unsplash:** "banking finance technology", "fintech", "financial data visualization"
- **Themes:** Modern bank buildings, financial charts, secure transactions
- **Colors:** Navy (trust), teal (innovation)

#### Healthcare
- **Unsplash:** "healthcare technology hospital", "medical IT systems", "health data"
- **Themes:** Modern hospitals, medical professionals, health tech
- **Avoid:** Stock photo clichés (stethoscope on keyboard)

#### Government & Public Sector
- **Unsplash:** "government building modern", "civic technology", "public sector IT"
- **Themes:** Government buildings, civic engagement, public services
- **Style:** Professional, trustworthy, accessible

#### Manufacturing & Logistics
- **Unsplash:** "smart factory industry 4.0", "logistics technology", "warehouse automation"
- **Themes:** Smart factories, IoT sensors, automated warehouses
- **Colors:** Industrial blues, teal technology accents

#### Retail & E-commerce
- **Unsplash:** "retail technology", "e-commerce shopping", "point of sale"
- **Themes:** Modern retail stores, online shopping, payment systems
- **Style:** Consumer-friendly, vibrant, accessible

#### Education
- **Unsplash:** "educational technology", "online learning", "digital classroom"
- **Themes:** Students using technology, online education, digital learning
- **Style:** Approachable, inspiring, modern

---

### 7. About Us - Team Photos, Office, Culture

**Image Requirements:**
- **Dimensions:** Various (team photos, office shots)
- **Style:** Authentic, professional, Egyptian context
- **Count:** 5-10 images

**Options:**
1. **Custom Photography:** Hire local photographer for authentic team photos
2. **Unsplash Diverse Teams:** "diverse business team", "modern office Egypt"
3. **Canva Custom Graphics:** Create illustrated team representations

**Recommendation:** Invest in custom photography for authenticity
- **Estimated Cost:** $200-500 for professional photo session
- **Value:** Genuine, relatable, builds trust

---

### 8. Case Studies - Client Success, Metrics Visualization

**Image Requirements:**
- **Dimensions:** 1200x800 (landscape)
- **Style:** Professional, data-driven, success-focused
- **Count:** 5 (one per case study)

**Sources:**
1. **Unsplash:** Industry-specific imagery for each case study
2. **Canva API:** Generate custom infographics with metrics
3. **DALL-E:** Create branded success visualization graphics

**Canva Approach (RECOMMENDED):**
- Create reusable Canva template for case study cards
- Autofill with case study data (metrics, industry, outcomes)
- Generate on-brand graphics via API
- **Cost:** FREE

**Example Canva Template Data:**
```json
{
  "industry": "Finance",
  "metric1": "99.9% Uptime",
  "metric2": "40% Cost Reduction",
  "metric3": "2,000+ Users",
  "brandColor": "#3D5A80"
}
```

---

## Technical Implementation

### 1. Angular Service for Image Fetching

```typescript
// core/services/image-manager.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ImageSource {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: 'unsplash' | 'pexels' | 'local';
}

@Injectable({ providedIn: 'root' })
export class ImageManagerService {
  private readonly http = inject(HttpClient);
  private readonly unsplashKey = 'YOUR_UNSPLASH_KEY';
  private readonly pexelsKey = 'YOUR_PEXELS_KEY';

  /**
   * Get image for a specific section with fallback chain:
   * 1. Try Unsplash
   * 2. Fallback to Pexels
   * 3. Fallback to local placeholder
   */
  getImageForSection(section: string, query: string): Observable<ImageSource> {
    return this.fetchFromUnsplash(query).pipe(
      catchError(() => this.fetchFromPexels(query)),
      catchError(() => of(this.getLocalFallback(section)))
    );
  }

  /**
   * Get multiple images for a section (e.g., gallery)
   */
  getImagesForSection(section: string, query: string, count: number): Observable<ImageSource[]> {
    return forkJoin([
      this.fetchMultipleFromUnsplash(query, count),
      this.fetchMultipleFromPexels(query, count)
    ]).pipe(
      map(([unsplash, pexels]) => [...unsplash, ...pexels].slice(0, count)),
      catchError(() => of(this.getLocalFallbacks(section, count)))
    );
  }

  private fetchFromUnsplash(query: string): Observable<ImageSource> {
    return this.http.get('https://api.unsplash.com/photos/random', {
      headers: { 'Authorization': `Client-ID ${this.unsplashKey}` },
      params: { query }
    }).pipe(
      map((response: any) => ({
        url: response.urls.regular,
        alt: response.alt_description || query,
        photographer: response.user.name,
        photographerUrl: response.user.links.html,
        source: 'unsplash' as const
      }))
    );
  }

  private fetchFromPexels(query: string): Observable<ImageSource> {
    return this.http.get('https://api.pexels.com/v1/search', {
      headers: { 'Authorization': this.pexelsKey },
      params: { query, per_page: '1' }
    }).pipe(
      map((response: any) => ({
        url: response.photos[0].src.large,
        alt: query,
        photographer: response.photos[0].photographer,
        photographerUrl: response.photos[0].photographer_url,
        source: 'pexels' as const
      }))
    );
  }

  private fetchMultipleFromUnsplash(query: string, count: number): Observable<ImageSource[]> {
    return this.http.get('https://api.unsplash.com/search/photos', {
      headers: { 'Authorization': `Client-ID ${this.unsplashKey}` },
      params: { query, per_page: count.toString() }
    }).pipe(
      map((response: any) => response.results.map((photo: any) => ({
        url: photo.urls.regular,
        alt: photo.alt_description || query,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        source: 'unsplash' as const
      })))
    );
  }

  private fetchMultipleFromPexels(query: string, count: number): Observable<ImageSource[]> {
    return this.http.get('https://api.pexels.com/v1/search', {
      headers: { 'Authorization': this.pexelsKey },
      params: { query, per_page: count.toString() }
    }).pipe(
      map((response: any) => response.photos.map((photo: any) => ({
        url: photo.src.large,
        alt: query,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        source: 'pexels' as const
      })))
    );
  }

  private getLocalFallback(section: string): ImageSource {
    return {
      url: `/assets/images/fallback/${section}.jpg`,
      alt: `${section} placeholder`,
      source: 'local'
    };
  }

  private getLocalFallbacks(section: string, count: number): ImageSource[] {
    return Array.from({ length: count }, (_, i) => ({
      url: `/assets/images/fallback/${section}-${i + 1}.jpg`,
      alt: `${section} placeholder ${i + 1}`,
      source: 'local' as const
    }));
  }
}
```

---

### 2. Lazy Loading with Placeholders

```typescript
// shared/components/lazy-image/lazy-image.component.ts
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lazy-image-container" [class.loaded]="isLoaded()">
      <!-- Blur placeholder -->
      @if (!isLoaded()) {
        <div class="placeholder" [style.background-image]="placeholderUrl"></div>
      }

      <!-- Actual image -->
      <img
        [src]="src"
        [alt]="alt"
        [loading]="loading"
        (load)="onLoad()"
        (error)="onError()"
        class="lazy-image"
      />

      <!-- Attribution -->
      @if (photographer && isLoaded()) {
        <p class="attribution">
          Photo by <a [href]="photographerUrl" target="_blank" rel="noopener">{{ photographer }}</a>
        </p>
      }
    </div>
  `,
  styles: [`
    .lazy-image-container {
      position: relative;
      overflow: hidden;
      background: var(--color-surface);
    }

    .placeholder {
      position: absolute;
      inset: 0;
      filter: blur(20px);
      transform: scale(1.1);
      background-size: cover;
      background-position: center;
      animation: pulse 2s infinite;
    }

    .lazy-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    .loaded .lazy-image {
      opacity: 1;
    }

    .loaded .placeholder {
      display: none;
    }

    .attribution {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 0.75rem;
      color: white;
      background: rgba(0, 0, 0, 0.5);
      padding: 4px 8px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .attribution a {
      color: white;
      text-decoration: underline;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class LazyImageComponent implements OnInit {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) alt!: string;
  @Input() photographer?: string;
  @Input() photographerUrl?: string;
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() placeholderSrc?: string;

  isLoaded = signal(false);
  placeholderUrl = '';

  ngOnInit() {
    // Generate tiny placeholder (blur-up technique)
    if (this.placeholderSrc) {
      this.placeholderUrl = `url('${this.placeholderSrc}')`;
    } else {
      // Use a solid color gradient as fallback
      this.placeholderUrl = 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)';
    }
  }

  onLoad() {
    this.isLoaded.set(true);
  }

  onError() {
    // Fallback to placeholder on error
    console.error(`Failed to load image: ${this.src}`);
  }
}
```

**Usage:**
```html
<app-lazy-image
  [src]="heroImage.url"
  [alt]="'Cloud Computing Infrastructure'"
  [photographer]="heroImage.photographer"
  [photographerUrl]="heroImage.photographerUrl"
  loading="eager"
/>
```

---

### 3. Responsive Image Handling

```typescript
// shared/directives/responsive-image.directive.ts
import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'img[appResponsiveImage]',
  standalone: true
})
export class ResponsiveImageDirective implements OnInit {
  private readonly el = inject(ElementRef);

  @Input() appResponsiveImage!: string; // Base image path without extension

  ngOnInit() {
    const img = this.el.nativeElement as HTMLImageElement;
    const basePath = this.appResponsiveImage;

    // Set srcset for different resolutions
    img.srcset = `
      ${basePath}-400w.webp 400w,
      ${basePath}-800w.webp 800w,
      ${basePath}-1200w.webp 1200w,
      ${basePath}-1920w.webp 1920w
    `;

    // Set sizes based on viewport
    img.sizes = `
      (max-width: 640px) 100vw,
      (max-width: 1024px) 50vw,
      33vw
    `;

    // Fallback src
    img.src = `${basePath}-800w.jpg`;
  }
}
```

**Usage:**
```html
<img
  appResponsiveImage="/assets/images/hero/abstract-network"
  alt="Abstract technology network"
  loading="lazy"
/>
```

---

### 4. WebP/AVIF Optimization

**Build Script to Convert Images:**

```typescript
// scripts/optimize-images.ts
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = 'src/assets/images';
const SIZES = [400, 800, 1200, 1920];

async function optimizeImages() {
  const sections = await readdir(IMAGES_DIR);

  for (const section of sections) {
    const sectionPath = join(IMAGES_DIR, section);
    const files = await readdir(sectionPath);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

      const inputPath = join(sectionPath, file);
      const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');

      for (const width of SIZES) {
        // Generate WebP
        await sharp(inputPath)
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(join(sectionPath, `${baseName}-${width}w.webp`));

        // Generate AVIF (better compression)
        await sharp(inputPath)
          .resize(width, null, { withoutEnlargement: true })
          .avif({ quality: 75 })
          .toFile(join(sectionPath, `${baseName}-${width}w.avif`));

        console.log(`Generated ${baseName}-${width}w.webp and .avif`);
      }
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);
```

**Install Dependencies:**
```bash
npm install -D sharp @types/sharp
```

**Add to package.json:**
```json
{
  "scripts": {
    "optimize-images": "tsx scripts/optimize-images.ts",
    "prebuild": "npm run optimize-images"
  }
}
```

---

### 5. Blur-up Loading Effect

**Generate Tiny Placeholders:**

```typescript
// scripts/generate-placeholders.ts
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = 'src/assets/images';
const PLACEHOLDER_WIDTH = 20; // Tiny 20px width

async function generatePlaceholders() {
  const sections = await readdir(IMAGES_DIR);

  for (const section of sections) {
    const sectionPath = join(IMAGES_DIR, section);
    const files = await readdir(sectionPath);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

      const inputPath = join(sectionPath, file);
      const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');
      const outputPath = join(sectionPath, `${baseName}-placeholder.jpg`);

      await sharp(inputPath)
        .resize(PLACEHOLDER_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toFile(outputPath);

      console.log(`Generated placeholder: ${outputPath}`);
    }
  }

  console.log('Placeholder generation complete!');
}

generatePlaceholders().catch(console.error);
```

**Use in Component:**
```html
<app-lazy-image
  [src]="'/assets/images/hero/abstract-network-800w.webp'"
  [placeholderSrc]="'/assets/images/hero/abstract-network-placeholder.jpg'"
  [alt]="'Abstract technology network'"
/>
```

---

## Budget Comparison

| Solution | Setup Cost | Monthly Cost | Images/Month | Quality | Licensing | Best For |
|----------|-----------|--------------|--------------|---------|-----------|----------|
| **Unsplash API (FREE)** ⭐ | $0 | $0 | 5,000 requests/hr | Excellent | Attribution required | Hero sections, backgrounds |
| **Pexels API (FREE)** ⭐ | $0 | $0 | 20,000/month | Excellent | Attribution recommended | Backup for Unsplash |
| **Pixabay API (FREE)** | $0 | $0 | 100/min | Good | No attribution | Illustrations, vectors |
| **Canva API (FREE)** ⭐ | $0 | $0 | Unlimited | Excellent | Full rights | Custom branded graphics |
| **DALL-E 3 (Pay-per-use)** | $5 free credits | Pay-as-you-go | ~40 images for $2 | Excellent | Full rights | Custom hero graphics |
| **Stable Diffusion (FREE)** ⭐ | $0 | $0 | Unlimited | Very Good | Community license | Abstract backgrounds |
| **Adobe Firefly** | - | $50+ | Varies | Excellent | Commercial-safe | Enterprise only |
| **Shutterstock** | - | $29+ | 10 images | Excellent | Full rights | Premium clients |
| **Getty Images** | - | Custom | Custom | Premium | Full rights | Fortune 500 only |

---

### Cost Analysis for Roaya IT Website

**Recommended Hybrid Approach:**

#### Phase 1: MVP Launch (Current)
- **Unsplash API:** FREE (all sections except custom branded)
- **Pexels API:** FREE (backup)
- **DALL-E 3:** $5-10 one-time (3-5 custom hero images)
- **Total:** **$5-10 one-time**

#### Phase 2: Brand Refinement (Post-launch)
- **Canva API:** FREE (custom case study graphics, infographics)
- **Stable Diffusion:** FREE (abstract backgrounds)
- **Custom Photography:** $200-500 one-time (team photos, office)
- **Total:** **$200-510 one-time**

#### Phase 3: Scale (6 months+)
- **Strapi CMS:** $0 (self-hosted) or $99/month (cloud)
- **Cloudinary:** $0 (free tier) for image optimization
- **Total:** **$0-99/month**

---

### Total Budget Estimate

| Phase | One-Time | Monthly | Total Year 1 |
|-------|----------|---------|-------------|
| **MVP (Phase 1)** | $5-10 | $0 | $5-10 |
| **Refinement (Phase 2)** | $200-510 | $0 | $200-510 |
| **Scale (Phase 3)** | $0 | $0-99 | $0-1,188 |
| **Grand Total** | **$205-520** | **$0-99** | **$205-1,708** |

**Recommendation:** Start with **$0 solution** (Unsplash + Pexels + Stable Diffusion), invest $5-10 in DALL-E for 3-5 hero images.

---

## Final Recommendation

### ⭐ Recommended Solution for Roaya IT

**Strategy:** **Hybrid Build-Time + Runtime Approach**

#### Primary Image Sources
1. **Unsplash API** (Free) - Primary stock photography
2. **Pexels API** (Free) - Backup stock photography
3. **Stable Diffusion** (Free under Community License) - Custom abstract backgrounds
4. **DALL-E 3** ($5-10 one-time) - 3-5 custom hero images with brand colors
5. **Canva API** (Free) - Custom infographics and case study graphics

---

### Implementation Roadmap

#### Week 1: Setup & Foundation
1. **Register for API Keys**
   - Unsplash Developer Account → Get API key
   - Pexels API → Get API key
   - OpenAI API → Get API key ($5 free credits)
   - Canva Developer → Register for Connect API

2. **Create Angular Services**
   - `ImageManagerService` (Unsplash + Pexels + fallbacks)
   - `ImageCacheService` (localStorage caching)
   - `LazyImageComponent` (blur-up loading)

3. **Build Scripts**
   - `fetch-images.ts` (download images at build time)
   - `optimize-images.ts` (WebP/AVIF conversion)
   - `generate-placeholders.ts` (blur-up placeholders)

#### Week 2: Content Population
1. **Generate Custom Hero Images** (DALL-E 3)
   - 3 hero variations with Roaya brand colors
   - Estimated cost: $0.24 (3 × $0.08 HD)

2. **Fetch Stock Photography** (Unsplash/Pexels)
   - Run build script to fetch all section images
   - Download to `src/assets/images/{section}/`

3. **Create Fallback Images**
   - Design simple gradient placeholders for each section
   - Store in `src/assets/images/fallback/`

#### Week 3: Optimization
1. **Image Optimization**
   - Convert all images to WebP/AVIF
   - Generate responsive sizes (400w, 800w, 1200w, 1920w)
   - Create tiny placeholders for blur-up effect

2. **Performance Testing**
   - Lighthouse audit (target LCP < 2.5s)
   - WebPageTest performance check
   - Optimize image sizes based on results

#### Week 4: Polish & Attribution
1. **Attribution Components**
   - Add photographer attribution to all Unsplash/Pexels images
   - Create `AttributionComponent` for footer

2. **Error Handling**
   - Test fallback chain (Unsplash → Pexels → Local)
   - Add retry logic for failed API requests

3. **Documentation**
   - Document image sources in `README.md`
   - Create image update guide for content team

---

### Sample Code: Complete Image Setup

**1. Environment Variables**
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  unsplashAccessKey: 'YOUR_UNSPLASH_ACCESS_KEY',
  pexelsApiKey: 'YOUR_PEXELS_API_KEY',
  openaiApiKey: 'YOUR_OPENAI_API_KEY', // For DALL-E (optional)
};
```

**2. Image Configuration**
```typescript
// core/config/image.config.ts
export const IMAGE_QUERIES = {
  hero: 'abstract technology network gradient',
  cloud: 'cloud computing data center',
  security: 'cybersecurity digital shield',
  email: 'email communication collaboration',
  managedIT: 'IT support monitoring dashboard',
  finance: 'banking finance technology',
  healthcare: 'healthcare hospital technology',
  government: 'government building modern',
  manufacturing: 'smart factory industry 4.0',
  retail: 'retail technology e-commerce',
  education: 'educational technology online learning',
};

export const IMAGE_SIZES = {
  hero: { width: 1920, height: 1080 },
  service: { width: 800, height: 600 },
  industry: { width: 800, height: 600 },
  caseStudy: { width: 1200, height: 800 },
};
```

**3. Component Usage**
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
    <section class="hero">
      @if (heroImage) {
        <app-lazy-image
          [src]="heroImage.url"
          [alt]="'Roaya IT - Enterprise Solutions'"
          [photographer]="heroImage.photographer"
          [photographerUrl]="heroImage.photographerUrl"
          loading="eager"
          class="hero-image"
        />
      }

      <div class="hero-content">
        <h1>{{ 'home.hero.title' | translate }}</h1>
        <p>{{ 'home.hero.subtitle' | translate }}</p>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private readonly imageManager = inject(ImageManagerService);
  heroImage: any;

  ngOnInit() {
    this.imageManager.getImageForSection('hero', 'abstract technology network')
      .subscribe(image => this.heroImage = image);
  }
}
```

---

### Attribution Footer

**Required Attribution for Unsplash/Pexels:**

```typescript
// shared/components/image-attribution/image-attribution.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-image-attribution',
  standalone: true,
  template: `
    <div class="attribution-footer">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Images provided by
        <a href="https://unsplash.com" target="_blank" rel="noopener" class="underline">
          Unsplash
        </a>
        and
        <a href="https://pexels.com" target="_blank" rel="noopener" class="underline">
          Pexels
        </a>
      </p>
    </div>
  `,
  styles: [`
    .attribution-footer {
      padding: 1rem;
      text-align: center;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class ImageAttributionComponent {}
```

**Add to Footer:**
```html
<!-- layouts/main-layout/footer/footer.component.html -->
<footer>
  <!-- ... existing footer content ... -->
  <app-image-attribution />
</footer>
```

---

### Why This Solution?

1. **Cost-Effective:** $0-10 for entire website (vs. $50-500/month alternatives)
2. **High Quality:** Professional stock photography + custom branded images
3. **Performance:** Build-time optimization, WebP/AVIF, blur-up loading
4. **Scalable:** Easy to add more images, switch to CMS later
5. **Legal Compliance:** Proper attribution, commercial-use licenses
6. **Brand Consistency:** Custom DALL-E images match Roaya brand colors
7. **Accessibility:** Alt text, WCAG compliant
8. **SEO-Friendly:** Optimized file sizes, proper metadata

---

### Next Steps

1. **Immediate (This Week):**
   - Register for Unsplash API key
   - Register for Pexels API key
   - Create `ImageManagerService`
   - Build image fetch script

2. **Short-Term (Next 2 Weeks):**
   - Generate 3-5 custom hero images with DALL-E 3
   - Fetch all stock photography
   - Implement lazy loading component
   - Optimize images (WebP/AVIF)

3. **Future Enhancements (Post-MVP):**
   - Invest in custom team photography ($200-500)
   - Implement Canva API for case study graphics
   - Consider Strapi CMS for content management
   - Add image CDN (Cloudinary free tier)

---

## Sources & References

### Stock Photo APIs
- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash API Pricing & Rate Limits](https://help.unsplash.com/en/articles/3887917-when-should-i-apply-for-a-higher-rate-limit)
- [Pexels API Free Photos](https://www.pexels.com/api/)
- [Pexels API Integration Guide](https://improvado.io/integrations/pexels-api)
- [Pixabay API Documentation](https://pixabay.com/api/docs/)

### AI Image Generation
- [OpenAI DALL-E 3 API Pricing](https://openai.com/api/pricing/)
- [DALL-E Pricing Calculator](https://invertedstone.com/calculators/dall-e-pricing)
- [Stability AI License & Pricing](https://stability.ai/license)
- [Stable Diffusion Pricing Guide 2025](https://www.hyperbolic.ai/blog/stable-diffusion-pricing)
- [Adobe Firefly for Enterprise](https://business.adobe.com/products/firefly-business.html)
- [Ideogram API Pricing](https://ideogram.ai/features/api-pricing)

### Hybrid Solutions
- [Canva Connect APIs](https://www.canva.dev/docs/connect/)
- [Canva API Free Access](https://www.canva.com/developers/)
- [Headless CMS with AI - Strapi vs Contentful](https://strapi.io/blog/ai-and-headless-cms)

### Technical Implementation
- [Angular NgOptimizedImage](https://angular.dev/guide/image-optimization)
- [Angular Image Optimization Guide](https://developer.chrome.com/blog/angular-image-directive)
- [WebP and Lazy Loading Optimization](https://www.aleksandrhovhannisyan.com/blog/optimizing-images-for-the-web/)

### Design Inspiration
- [Awwwards Interactive 3D Hero Sections](https://www.awwwards.com/inspiration/interactive-3d-hero-section-carl-gordon-portfolio-c-2024)
- [Hero Section with 3D Mesh Animation](https://www.awwwards.com/inspiration/hero-section-with-3d-mesh-wearspaces)
- [40 Conversion-Boosting Hero Images](https://www.justinmind.com/blog/inspiring-hero-image-websites/)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-06
**Maintained By:** UI Design Expert + Super Tech Lead
**Review Cycle:** Quarterly or when new image solutions become available
