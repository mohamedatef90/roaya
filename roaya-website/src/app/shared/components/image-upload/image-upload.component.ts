import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import {
  ImageUploadService,
  UploadedImage,
} from '../../../core/services/image-upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="image-upload-container">
      <!-- Drop Zone -->
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver()"
        [class.has-image]="imageUrl()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <!-- Image Preview -->
        <div *ngIf="imageUrl()" class="image-preview">
          <img [src]="imageUrl()" [alt]="fileName() || 'Preview'" />
          <div class="image-overlay">
            <div class="overlay-actions">
              <p-button
                icon="pi pi-times"
                [rounded]="true"
                severity="danger"
                (click)="removeImage($event)"
                pTooltip="Remove image"
              ></p-button>
            </div>
          </div>
        </div>

        <!-- Upload Prompt -->
        <div *ngIf="!imageUrl()" class="upload-prompt">
          <i class="pi pi-cloud-upload text-5xl mb-3 text-surface-400"></i>
          <p class="text-lg font-medium mb-2">
            {{ label || 'Drag & drop image here' }}
          </p>
          <p class="text-sm text-surface-500 mb-3">or click to browse</p>
          <p class="text-xs text-surface-400">
            Max size: 5MB • Formats: JPG, PNG, GIF, WEBP
          </p>
        </div>

        <!-- Hidden File Input -->
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          (change)="onFileSelected($event)"
          class="hidden"
        />
      </div>

      <!-- Upload Progress -->
      <div *ngIf="uploading()" class="upload-progress mt-3">
        <p-progressBar [value]="uploadProgress()" [showValue]="true"></p-progressBar>
        <p class="text-sm text-surface-500 mt-2">Uploading...</p>
      </div>

      <!-- File Info -->
      <div *ngIf="imageUrl() && fileName()" class="file-info mt-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-surface-600 dark:text-surface-400">
            {{ fileName() }}
          </span>
          <span class="text-surface-500">{{ fileSize() }}</span>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styles: [
    `
      .image-upload-container {
        width: 100%;

        .drop-zone {
          border: 2px dashed var(--surface-border);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--surface-ground);
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            border-color: var(--primary-color);
            background: var(--surface-hover);
          }

          &.drag-over {
            border-color: var(--primary-color);
            background: var(--primary-50);
            transform: scale(1.02);
          }

          &.has-image {
            padding: 0;
            border: none;
            min-height: 300px;
          }
        }

        .upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 12px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;

            &:hover {
              opacity: 1;
            }
          }

          .overlay-actions {
            display: flex;
            gap: 0.5rem;
          }
        }

        .upload-progress {
          padding: 1rem;
          background: var(--surface-50);
          border-radius: 8px;
        }

        .file-info {
          padding: 0.75rem 1rem;
          background: var(--surface-50);
          border-radius: 8px;
          border: 1px solid var(--surface-border);
        }
      }
    `,
  ],
})
export class ImageUploadComponent {
  @Input() label?: string;
  @Input() initialImageUrl?: string;
  @Output() imageUploaded = new EventEmitter<UploadedImage>();
  @Output() imageRemoved = new EventEmitter<void>();

  private imageUploadService = inject(ImageUploadService);
  private messageService = inject(MessageService);

  // State
  imageUrl = signal<string | null>(null);
  fileName = signal<string | null>(null);
  fileSize = signal<string | null>(null);
  isDragOver = signal(false);
  uploading = signal(false);
  uploadProgress = signal(0);

  ngOnInit(): void {
    if (this.initialImageUrl) {
      this.imageUrl.set(this.initialImageUrl);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
    }
  }

  uploadFile(file: File): void {
    // Validate file
    const validation = this.imageUploadService.validateFile(file);
    if (!validation.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: validation.error || 'Invalid file',
      });
      return;
    }

    // Start upload
    this.uploading.set(true);
    this.uploadProgress.set(0);

    // Simulate progress (since we're using base64 conversion)
    const progressInterval = setInterval(() => {
      const current = this.uploadProgress();
      if (current < 90) {
        this.uploadProgress.set(current + 10);
      }
    }, 100);

    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(100);

        setTimeout(() => {
          this.imageUrl.set(response.data.url);
          this.fileName.set(response.data.fileName);
          this.fileSize.set(
            this.imageUploadService.formatFileSize(response.data.fileSize)
          );
          this.uploading.set(false);
          this.uploadProgress.set(0);

          this.imageUploaded.emit(response.data);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image uploaded successfully',
          });
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploading.set(false);
        this.uploadProgress.set(0);

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: error.message || 'Failed to upload image',
        });
      },
    });
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imageUrl.set(null);
    this.fileName.set(null);
    this.fileSize.set(null);
    this.imageRemoved.emit();
  }
}
