import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent,
  LabelComponent,
  SpinnerComponent,
  SelectComponent,
  SelectOption,
} from '../../../../../shared/components/ui';
import { ToastService } from '../../../../../shared/components/ui/feedback/toast/toast.service';

// Services and Components
import {
  ContentAdminService,
  ContentItem,
  ContentType,
  ContentStatus,
} from '../../../../../core/services/content-admin.service';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
import { UploadedImage } from '../../../../../core/services/image-upload.service';

@Component({
  selector: 'app-content-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    // shadcn components
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    LabelComponent,
    SpinnerComponent,
    SelectComponent,
    // Other components
    ImageUploadComponent,
  ],
  template: `
    <ui-dialog [open]="visible" (openChange)="onDialogChange($event)" size="full">
      <ui-dialog-header>
        <ui-dialog-title>{{ dialogTitle }}</ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <form [formGroup]="editorForm" class="h-full">
          <!-- Custom Tabs -->
          <div class="mb-6">
            <div class="inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <button
                type="button"
                (click)="activeTab.set('english')"
                [class]="getTabClass('english')"
              >
                <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                English Content
              </button>
              <button
                type="button"
                (click)="activeTab.set('arabic')"
                [class]="getTabClass('arabic')"
              >
                <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
                </svg>
                Arabic Content
              </button>
              <button
                type="button"
                (click)="activeTab.set('settings')"
                [class]="getTabClass('settings')"
              >
                <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Settings & Media
              </button>
            </div>
          </div>

          <!-- English Tab Content -->
          @if (activeTab() === 'english') {
            <div class="space-y-5 animate-fadeIn">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <!-- Title -->
                <div>
                  <ui-label for="titleEn" [required]="true">Title</ui-label>
                  <input
                    id="titleEn"
                    formControlName="titleEn"
                    type="text"
                    class="input-field"
                    placeholder="Enter title in English"
                  />
                  @if (editorForm.get('titleEn')?.invalid && editorForm.get('titleEn')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Title is required (max 200 characters)</p>
                  }
                </div>

                <!-- Slug -->
                <div>
                  <ui-label for="slugEn" [required]="true">URL Slug</ui-label>
                  <input
                    id="slugEn"
                    formControlName="slugEn"
                    type="text"
                    class="input-field"
                    placeholder="url-friendly-slug"
                  />
                  @if (editorForm.get('slugEn')?.invalid && editorForm.get('slugEn')?.touched) {
                    <p class="text-xs text-red-500 mt-1">Slug is required</p>
                  }
                </div>
              </div>

              <!-- Excerpt -->
              <div>
                <ui-label for="excerptEn">Excerpt / Summary</ui-label>
                <textarea
                  id="excerptEn"
                  formControlName="excerptEn"
                  rows="3"
                  class="input-field resize-none"
                  placeholder="Brief summary (optional, max 500 characters)"
                ></textarea>
              </div>

              <!-- Content -->
              <div>
                <ui-label for="contentEn" [required]="true">Content Body</ui-label>
                <textarea
                  id="contentEn"
                  formControlName="contentEn"
                  rows="12"
                  class="input-field font-mono resize-none"
                  placeholder="Write your content here (supports Markdown)"
                ></textarea>
                @if (editorForm.get('contentEn')?.invalid && editorForm.get('contentEn')?.touched) {
                  <p class="text-xs text-red-500 mt-1">Content is required</p>
                }
                <p class="text-xs text-neutral-500 mt-1">
                  You can use Markdown formatting: **bold**, *italic*, [link](url), etc.
                </p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <!-- SEO Meta Title -->
                <div>
                  <ui-label for="metaTitleEn">SEO Meta Title</ui-label>
                  <input
                    id="metaTitleEn"
                    formControlName="metaTitleEn"
                    type="text"
                    class="input-field"
                    placeholder="SEO title (max 60 characters)"
                  />
                  <p class="text-xs text-neutral-500 mt-1">Optimal length: 50-60 characters</p>
                </div>

                <!-- SEO Meta Description -->
                <div>
                  <ui-label for="metaDescEn">SEO Meta Description</ui-label>
                  <textarea
                    id="metaDescEn"
                    formControlName="metaDescEn"
                    rows="2"
                    class="input-field resize-none"
                    placeholder="SEO description (max 160 characters)"
                  ></textarea>
                  <p class="text-xs text-neutral-500 mt-1">Optimal length: 150-160 characters</p>
                </div>
              </div>
            </div>
          }

          <!-- Arabic Tab Content -->
          @if (activeTab() === 'arabic') {
            <div class="space-y-5 animate-fadeIn">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" dir="rtl">
                <!-- Title -->
                <div>
                  <ui-label for="titleAr" [required]="true">العنوان</ui-label>
                  <input
                    id="titleAr"
                    formControlName="titleAr"
                    type="text"
                    class="input-field"
                    placeholder="أدخل العنوان بالعربية"
                  />
                  @if (editorForm.get('titleAr')?.invalid && editorForm.get('titleAr')?.touched) {
                    <p class="text-xs text-red-500 mt-1">العنوان مطلوب (حد أقصى 200 حرف)</p>
                  }
                </div>

                <!-- Slug -->
                <div>
                  <ui-label for="slugAr" [required]="true">الرابط</ui-label>
                  <input
                    id="slugAr"
                    formControlName="slugAr"
                    type="text"
                    class="input-field"
                    dir="ltr"
                    placeholder="url-friendly-slug"
                  />
                  @if (editorForm.get('slugAr')?.invalid && editorForm.get('slugAr')?.touched) {
                    <p class="text-xs text-red-500 mt-1">الرابط مطلوب</p>
                  }
                </div>
              </div>

              <!-- Excerpt -->
              <div dir="rtl">
                <ui-label for="excerptAr">الملخص</ui-label>
                <textarea
                  id="excerptAr"
                  formControlName="excerptAr"
                  rows="3"
                  class="input-field resize-none"
                  placeholder="ملخص مختصر (اختياري، حد أقصى 500 حرف)"
                ></textarea>
              </div>

              <!-- Content -->
              <div dir="rtl">
                <ui-label for="contentAr" [required]="true">المحتوى</ui-label>
                <textarea
                  id="contentAr"
                  formControlName="contentAr"
                  rows="12"
                  class="input-field font-mono resize-none"
                  placeholder="اكتب المحتوى هنا (يدعم Markdown)"
                ></textarea>
                @if (editorForm.get('contentAr')?.invalid && editorForm.get('contentAr')?.touched) {
                  <p class="text-xs text-red-500 mt-1">المحتوى مطلوب</p>
                }
                <p class="text-xs text-neutral-500 mt-1">
                  يمكنك استخدام تنسيق Markdown: **غامق**، *مائل*، [رابط](url)، إلخ
                </p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" dir="rtl">
                <!-- SEO Meta Title -->
                <div>
                  <ui-label for="metaTitleAr">عنوان SEO</ui-label>
                  <input
                    id="metaTitleAr"
                    formControlName="metaTitleAr"
                    type="text"
                    class="input-field"
                    placeholder="عنوان SEO (حد أقصى 60 حرف)"
                  />
                  <p class="text-xs text-neutral-500 mt-1">الطول الأمثل: 50-60 حرف</p>
                </div>

                <!-- SEO Meta Description -->
                <div>
                  <ui-label for="metaDescAr">وصف SEO</ui-label>
                  <textarea
                    id="metaDescAr"
                    formControlName="metaDescAr"
                    rows="2"
                    class="input-field resize-none"
                    placeholder="وصف SEO (حد أقصى 160 حرف)"
                  ></textarea>
                  <p class="text-xs text-neutral-500 mt-1">الطول الأمثل: 150-160 حرف</p>
                </div>
              </div>
            </div>
          }

          <!-- Settings Tab Content -->
          @if (activeTab() === 'settings') {
            <div class="space-y-5 animate-fadeIn">
              <!-- Featured Image -->
              <div>
                <ui-label>Featured Image</ui-label>
                <app-image-upload
                  label="Upload featured image"
                  [initialImageUrl]="editorForm.get('featuredImage')?.value"
                  (imageUploaded)="onImageUploaded($event)"
                  (imageRemoved)="onImageRemoved()"
                ></app-image-upload>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <!-- Category -->
                <div>
                  <ui-label for="category">Category</ui-label>
                  <ui-select
                    formControlName="category"
                    [options]="isCaseStudy ? industryOptions : categoryOptions"
                    placeholder="Select category"
                  ></ui-select>
                </div>

                <!-- Status -->
                <div>
                  <ui-label for="status" [required]="true">Status</ui-label>
                  <ui-select
                    formControlName="status"
                    [options]="statusOptions"
                  ></ui-select>
                </div>
              </div>

              <!-- Tags -->
              <div>
                <ui-label for="tags">Tags</ui-label>
                <input
                  id="tags"
                  type="text"
                  [value]="getTagsAsString()"
                  (blur)="updateTagsFromString($event)"
                  class="input-field"
                  placeholder="Enter tags separated by commas"
                />
                <p class="text-xs text-neutral-500 mt-1">
                  Separate multiple tags with commas (e.g., technology, cloud, security)
                </p>
              </div>

              <!-- Publish Date -->
              <div>
                <ui-label for="publishedAt">Publish Date</ui-label>
                <input
                  id="publishedAt"
                  formControlName="publishedAt"
                  type="datetime-local"
                  class="input-field"
                />
                <p class="text-xs text-neutral-500 mt-1">
                  Leave empty for immediate publishing
                </p>
              </div>
            </div>
          }
        </form>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="loading()"
          class="px-4 py-2.5 rounded-xl text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="onSave()"
          [disabled]="loading() || editorForm.invalid"
          class="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg inline-flex items-center gap-2"
        >
          @if (loading()) {
            <ui-spinner size="sm" variant="white"></ui-spinner>
          }
          Save
        </button>
      </ui-dialog-footer>
    </ui-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-field {
      display: flex;
      width: 100%;
      min-height: 2.75rem;
      border-radius: 0.75rem;
      border: 1px solid rgb(212 212 212);
      background-color: white;
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #5DB7C2;
        box-shadow: 0 0 0 3px rgba(93, 183, 194, 0.15);
      }

      &::placeholder {
        color: rgb(163 163 163);
      }
    }

    :host-context([data-theme='dark']) .input-field,
    :host-context(.dark) .input-field {
      border-color: rgb(64 64 64);
      background-color: rgb(38 38 38);
      color: rgb(245 245 245);
    }

    textarea.input-field {
      min-height: 5rem;
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class ContentEditorDialogComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() contentType: ContentType = ContentType.BLOG_POST;
  @Input() editItem: ContentItem | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<ContentItem>();

  private fb = inject(FormBuilder);
  private contentService = inject(ContentAdminService);
  private toastService = inject(ToastService);

  // State
  loading = signal(false);
  activeTab = signal<'english' | 'arabic' | 'settings'>('english');

  // Form
  editorForm!: FormGroup;

  // Dropdown options
  statusOptions: SelectOption[] = [
    { label: 'Draft', value: ContentStatus.DRAFT },
    { label: 'Pending Review', value: ContentStatus.PENDING_REVIEW },
    { label: 'Published', value: ContentStatus.PUBLISHED },
    { label: 'Archived', value: ContentStatus.ARCHIVED },
  ];

  categoryOptions: SelectOption[] = [
    { label: 'Technology', value: 'technology' },
    { label: 'Business', value: 'business' },
    { label: 'Security', value: 'security' },
    { label: 'Cloud', value: 'cloud' },
    { label: 'AI & ML', value: 'ai-ml' },
    { label: 'DevOps', value: 'devops' },
  ];

  // Case study specific options
  industryOptions: SelectOption[] = [
    { label: 'Finance & Banking', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Government', value: 'government' },
    { label: 'Manufacturing', value: 'manufacturing' },
    { label: 'Retail', value: 'retail' },
    { label: 'Education', value: 'education' },
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editItem'] && this.editorForm) {
      if (this.editItem) {
        this.loadContentData(this.editItem);
      } else {
        this.editorForm.reset({ status: ContentStatus.DRAFT });
      }
    }
  }

  getTabClass(tab: string): string {
    const baseClass = 'inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all';
    if (this.activeTab() === tab) {
      return `${baseClass} bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm`;
    }
    return `${baseClass} text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white`;
  }

  initializeForm(): void {
    this.editorForm = this.fb.group({
      // English Content
      titleEn: ['', [Validators.required, Validators.maxLength(200)]],
      slugEn: ['', [Validators.required, Validators.maxLength(250)]],
      excerptEn: ['', [Validators.maxLength(500)]],
      contentEn: ['', [Validators.required]],
      metaTitleEn: ['', [Validators.maxLength(60)]],
      metaDescEn: ['', [Validators.maxLength(160)]],

      // Arabic Content
      titleAr: ['', [Validators.required, Validators.maxLength(200)]],
      slugAr: ['', [Validators.required, Validators.maxLength(250)]],
      excerptAr: ['', [Validators.maxLength(500)]],
      contentAr: ['', [Validators.required]],
      metaTitleAr: ['', [Validators.maxLength(60)]],
      metaDescAr: ['', [Validators.maxLength(160)]],

      // Common Fields
      featuredImage: [''],
      category: [''],
      tags: [[]],
      status: [ContentStatus.DRAFT, Validators.required],
      publishedAt: [null],
    });

    // Auto-generate slug from title
    this.editorForm.get('titleEn')?.valueChanges.subscribe((value) => {
      if (value && !this.editItem) {
        const slug = this.generateSlug(value);
        this.editorForm.patchValue({ slugEn: slug }, { emitEvent: false });
      }
    });

    this.editorForm.get('titleAr')?.valueChanges.subscribe((value) => {
      if (value && !this.editItem) {
        const slug = this.generateSlug(value);
        this.editorForm.patchValue({ slugAr: slug }, { emitEvent: false });
      }
    });

    if (this.editItem) {
      this.loadContentData(this.editItem);
    }
  }

  loadContentData(item: ContentItem): void {
    this.editorForm.patchValue({
      titleEn: item.titleEn,
      titleAr: item.titleAr,
      slugEn: item.slugEn,
      slugAr: item.slugAr,
      excerptEn: item.excerptEn || '',
      excerptAr: item.excerptAr || '',
      contentEn: item.contentEn,
      contentAr: item.contentAr,
      featuredImage: item.featuredImage || '',
      category: item.category || '',
      tags: item.tags || [],
      status: item.status,
      metaTitleEn: item.metaTitleEn || '',
      metaTitleAr: item.metaTitleAr || '',
      metaDescEn: item.metaDescEn || '',
      metaDescAr: item.metaDescAr || '',
      publishedAt: item.publishedAt ? this.formatDateForInput(item.publishedAt) : null,
    });
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onImageUploaded(image: UploadedImage): void {
    this.editorForm.patchValue({ featuredImage: image.url });
  }

  onImageRemoved(): void {
    this.editorForm.patchValue({ featuredImage: '' });
  }

  onDialogChange(open: boolean): void {
    if (!open) {
      this.onCancel();
    }
  }

  onSave(): void {
    if (this.editorForm.invalid) {
      this.toastService.error('Please fill in all required fields', 'Validation Error');
      return;
    }

    this.loading.set(true);

    const formValue = this.editorForm.value;
    const contentData: Partial<ContentItem> = {
      type: this.contentType,
      titleEn: formValue.titleEn,
      titleAr: formValue.titleAr,
      slugEn: formValue.slugEn,
      slugAr: formValue.slugAr,
      excerptEn: formValue.excerptEn,
      excerptAr: formValue.excerptAr,
      contentEn: formValue.contentEn,
      contentAr: formValue.contentAr,
      featuredImage: formValue.featuredImage,
      category: formValue.category,
      tags: formValue.tags || [],
      status: formValue.status,
      metaTitleEn: formValue.metaTitleEn,
      metaTitleAr: formValue.metaTitleAr,
      metaDescEn: formValue.metaDescEn,
      metaDescAr: formValue.metaDescAr,
      publishedAt: formValue.publishedAt ? new Date(formValue.publishedAt).toISOString() : undefined,
    };

    const request = this.editItem
      ? this.contentService.updateContent(this.editItem.id, contentData)
      : this.contentService.createContent(contentData);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        this.toastService.success(
          this.editItem ? 'Content updated successfully' : 'Content created successfully',
          'Success'
        );
        this.saved.emit(response.data);
        this.onCancel();
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error saving content:', error);
        this.toastService.error('Failed to save content', 'Error');
      },
    });
  }

  onCancel(): void {
    this.editorForm.reset({ status: ContentStatus.DRAFT });
    this.activeTab.set('english');
    this.visible = false;
    this.visibleChange.emit(false);
  }

  get dialogTitle(): string {
    const action = this.editItem ? 'Edit' : 'New';
    const type =
      this.contentType === ContentType.BLOG_POST ? 'Blog Post' : 'Case Study';
    return `${action} ${type}`;
  }

  get isCaseStudy(): boolean {
    return this.contentType === ContentType.CASE_STUDY;
  }

  getTagsAsString(): string {
    const tags = this.editorForm.get('tags')?.value || [];
    return tags.join(', ');
  }

  updateTagsFromString(event: Event): void {
    const input = event.target as HTMLInputElement;
    const tagsString = input.value;
    const tagsArray = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    this.editorForm.patchValue({ tags: tagsArray });
  }
}
