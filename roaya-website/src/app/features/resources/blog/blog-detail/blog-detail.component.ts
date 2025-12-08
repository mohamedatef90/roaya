import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { BlogPost } from '../blog.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly analytics = inject(AnalyticsService);

  post = signal<BlogPost | null>(null);
  relatedPosts = signal<BlogPost[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    if (slug) {
      this.loadPost(slug);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadPost(slug: string): void {
    // TODO: Load post from API/CMS
    // For now, simulate loading
    this.isLoading.set(true);
    
      setTimeout(() => {
        // TODO: Replace with API call
        // Placeholder - post will be loaded from API
        this.isLoading.set(false);
        
        // When post is loaded from API, uncomment:
        // if (post) {
        //   this.analytics.trackContentEngagement('blog', post.id, 'view');
        //   this.loadRelatedPosts(post.category, post.id);
        // }
      }, 500);
  }

  private loadRelatedPosts(category: string, excludeId: string): void {
    // TODO: Load related posts from API
    this.relatedPosts.set([]);
  }

  sharePost(platform: string): void {
    const post = this.post();
    if (!post) return;

    const url = window.location.href;
    const title = post.title;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      this.analytics.trackContentEngagement('blog', post.id, 'share');
    }
  }
}
