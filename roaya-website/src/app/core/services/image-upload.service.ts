import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadedImage {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ImageUploadResponse {
  success: boolean;
  data: UploadedImage;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/upload`;

  // Maximum file size: 5MB
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Allowed image types
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  /**
   * Upload an image file to the server
   * TODO: Connect to actual backend endpoint when ready
   * For now, converts to base64 for preview
   */
  uploadImage(file: File): Observable<ImageUploadResponse> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // TODO: Replace with actual HTTP upload when backend is ready
    // return this.http.post<ImageUploadResponse>(`${this.baseUrl}/images`, formData);

    // Temporary implementation: Convert to base64 for preview
    return this.convertToBase64(file).pipe(
      map((base64) => ({
        success: true,
        data: {
          url: base64,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
        message: 'Image uploaded successfully (preview mode)',
      }))
    );
  }

  /**
   * Upload multiple images
   */
  uploadImages(files: File[]): Observable<ImageUploadResponse[]> {
    // TODO: Implement batch upload when backend is ready
    // For now, upload one by one
    const uploads = files.map((file) => this.uploadImage(file));
    return new Observable((observer) => {
      const results: ImageUploadResponse[] = [];
      let completed = 0;

      uploads.forEach((upload$) => {
        upload$.subscribe({
          next: (result) => {
            results.push(result);
            completed++;
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => observer.error(error),
        });
      });
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Allowed types: JPG, PNG, GIF, WEBP',
      };
    }

    return { valid: true };
  }

  /**
   * Convert file to base64 data URL
   */
  private convertToBase64(file: File): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
