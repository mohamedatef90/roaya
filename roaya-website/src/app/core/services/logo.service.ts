import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Logo Interface - matches the backend Logo model
 */
export interface Logo {
  id: string;
  name: string;
  nameAr: string;
  logo: string;           // Image URL (mapped from backend imageUrl)
  darkModeLogo?: string;  // Optional dark mode variant (mapped from backend darkModeUrl)
  scale?: string;         // Optional scale class (e.g., 'scale-150'), stored in sections[]
  order: number;          // Display order (mapped from backend displayOrder)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type LogoCategory = 'sector' | 'client';

/**
 * Backend Logo shape (as returned by the API)
 */
interface BackendLogo {
  id: string;
  name: string;
  imageUrl: string;
  darkModeUrl?: string;
  category: 'PARTNER' | 'CLIENT';
  sections: string[];
  websiteUrl?: string;
  altTextEn?: string;
  altTextAr?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LogoApiResponse {
  success: boolean;
  data: BackendLogo[];
}

interface SingleLogoApiResponse {
  success: boolean;
  data: BackendLogo;
}

/**
 * Logo Service
 * Manages logos for the website - Industry/Sector logos and Client logos
 * These correspond to the "Sectors We Serve" and "Trusted By" sections on the home page
 */
@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Reactive state for logos - allows real-time updates across components
  private sectorLogosSubject = new BehaviorSubject<Logo[]>([]);
  private clientLogosSubject = new BehaviorSubject<Logo[]>([]);

  sectorLogos$ = this.sectorLogosSubject.asObservable();
  clientLogos$ = this.clientLogosSubject.asObservable();

  /**
   * Map frontend category to backend category enum
   */
  private toBackendCategory(category: LogoCategory): 'PARTNER' | 'CLIENT' {
    return category === 'sector' ? 'PARTNER' : 'CLIENT';
  }

  /**
   * Map a backend logo to the frontend Logo interface
   */
  private mapFromBackend(bl: BackendLogo): Logo {
    return {
      id: bl.id,
      name: bl.name,
      nameAr: bl.altTextAr || bl.name,
      logo: bl.imageUrl,
      darkModeLogo: bl.darkModeUrl || undefined,
      scale: bl.sections?.find(s => s.startsWith('scale-')) || undefined,
      order: bl.displayOrder,
      isActive: bl.isActive,
      createdAt: bl.createdAt,
      updatedAt: bl.updatedAt,
    };
  }

  /**
   * Map frontend Logo fields to backend create/update payload
   */
  private toBackendPayload(logo: Partial<Logo>, category?: LogoCategory): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (logo.name !== undefined) payload['name'] = logo.name;
    if (logo.logo !== undefined) payload['imageUrl'] = logo.logo;
    if (logo.darkModeLogo !== undefined) payload['darkModeUrl'] = logo.darkModeLogo || undefined;
    if (logo.nameAr !== undefined) payload['altTextAr'] = logo.nameAr;
    if (logo.order !== undefined) payload['displayOrder'] = logo.order;
    if (logo.isActive !== undefined) payload['isActive'] = logo.isActive;
    if (logo.scale !== undefined) payload['sections'] = logo.scale ? [logo.scale] : [];
    if (category !== undefined) payload['category'] = this.toBackendCategory(category);

    return payload;
  }

  /**
   * Load all logos from backend (both categories).
   * Call this once on app/home init to populate the BehaviorSubjects.
   */
  loadAllLogos(): void {
    forkJoin([
      this.getPublicLogos('sector'),
      this.getPublicLogos('client')
    ]).subscribe();
  }

  /**
   * Get active logos for public website sections.
   */
  getPublicLogos(category: LogoCategory): Observable<Logo[]> {
    const backendCat = this.toBackendCategory(category);
    return this.http.get<LogoApiResponse>(`${this.apiUrl}/public/logos`, {
      params: { category: backendCat }
    }).pipe(
      map(response => (response.data || []).map(bl => this.mapFromBackend(bl))),
      tap(logos => {
        if (category === 'sector') {
          this.sectorLogosSubject.next(logos);
        } else {
          this.clientLogosSubject.next(logos);
        }
      })
    );
  }

  /**
   * Get all logos by category for the authenticated admin list, including inactive records.
   */
  getLogos(category: LogoCategory): Observable<Logo[]> {
    const backendCat = this.toBackendCategory(category);
    return this.http.get<LogoApiResponse>(`${this.apiUrl}/admin/logos`, {
      params: { category: backendCat }
    }).pipe(
      map(response => (response.data || []).map(bl => this.mapFromBackend(bl))),
      tap(logos => {
        if (category === 'sector') {
          this.sectorLogosSubject.next(logos);
        } else {
          this.clientLogosSubject.next(logos);
        }
      })
    );
  }

  /**
   * Get current logos (synchronous, for components that need immediate data)
   */
  getCurrentLogos(category: LogoCategory): Logo[] {
    return category === 'sector'
      ? this.sectorLogosSubject.value.filter(l => l.isActive).sort((a, b) => a.order - b.order)
      : this.clientLogosSubject.value.filter(l => l.isActive).sort((a, b) => a.order - b.order);
  }

  /**
   * Create a new logo
   */
  createLogo(category: LogoCategory, logo: Omit<Logo, 'id' | 'createdAt' | 'updatedAt'>): Observable<Logo> {
    const payload = this.toBackendPayload(logo, category);
    return this.http.post<SingleLogoApiResponse>(`${this.apiUrl}/admin/logos`, payload).pipe(
      map(response => this.mapFromBackend(response.data)),
      tap(newLogo => {
        if (category === 'sector') {
          this.sectorLogosSubject.next([...this.sectorLogosSubject.value, newLogo]);
        } else {
          this.clientLogosSubject.next([...this.clientLogosSubject.value, newLogo]);
        }
      })
    );
  }

  /**
   * Update an existing logo
   */
  updateLogo(category: LogoCategory, id: string, updates: Partial<Logo>): Observable<Logo> {
    const payload = this.toBackendPayload(updates);
    return this.http.patch<SingleLogoApiResponse>(`${this.apiUrl}/admin/logos/${id}`, payload).pipe(
      map(response => this.mapFromBackend(response.data)),
      tap(updatedLogo => {
        this.updateLocalLogo(category, id, updatedLogo);
      })
    );
  }

  /**
   * Delete a logo
   */
  deleteLogo(category: LogoCategory, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/logos/${id}`).pipe(
      tap(() => {
        this.removeLocalLogo(category, id);
      })
    );
  }

  /**
   * Update logo order (after drag-drop)
   */
  updateOrder(category: LogoCategory, logoIds: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/logos-reorder`, {
      orderedIds: logoIds
    }).pipe(
      tap(() => {
        // Re-fetch logos so BehaviorSubject reflects the new order on all subscribers (e.g. home page)
        this.getLogos(category).subscribe();
      })
    );
  }

  /**
   * Toggle logo active status
   */
  toggleActive(category: LogoCategory, id: string): Observable<Logo> {
    return this.http.patch<SingleLogoApiResponse>(
      `${this.apiUrl}/admin/logos/${id}/toggle-active`,
      {}
    ).pipe(
      map(response => this.mapFromBackend(response.data)),
      tap(updatedLogo => {
        this.updateLocalLogo(category, id, updatedLogo);
      })
    );
  }

  private updateLocalLogo(category: LogoCategory, id: string, updatedLogo: Logo): void {
    if (category === 'sector') {
      const logos = this.sectorLogosSubject.value.map(l => l.id === id ? updatedLogo : l);
      this.sectorLogosSubject.next(logos);
    } else {
      const logos = this.clientLogosSubject.value.map(l => l.id === id ? updatedLogo : l);
      this.clientLogosSubject.next(logos);
    }
  }

  private removeLocalLogo(category: LogoCategory, id: string): void {
    if (category === 'sector') {
      const logos = this.sectorLogosSubject.value.filter(l => l.id !== id);
      this.sectorLogosSubject.next(logos);
    } else {
      const logos = this.clientLogosSubject.value.filter(l => l.id !== id);
      this.clientLogosSubject.next(logos);
    }
  }
}
