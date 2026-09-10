import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LanguageService } from '../../../core/services/language.service';
import { RagChatService, RagChatSource } from '../../../core/services/rag-chat.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: RagChatSource[];
  outOfScope?: boolean;
  feedback?: 'helpful' | 'not-helpful';
}

interface KnowledgeLink {
  label: string;
  description: string;
  route: string;
  icon: 'services' | 'industries' | 'cases' | 'pricing';
}

@Component({
  selector: 'app-roaya-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './roaya-assistant.component.html',
  styleUrl: './roaya-assistant.component.scss',
})
export class RoayaAssistantComponent {
  @ViewChild('questionInput') questionInput?: ElementRef<HTMLTextAreaElement>;

  private readonly ragChat = inject(RagChatService);
  private audioContext?: AudioContext;
  private readonly minimumTypingMs = 650;
  readonly languageService = inject(LanguageService);

  readonly isOpen = signal(false);
  readonly isBusy = signal(false);
  readonly soundEnabled = signal(true);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isArabic = computed(() => this.languageService.language() === 'ar');
  readonly suggestedQuestions = computed(() => this.isArabic()
    ? ['ما هي خدمات الأمن السيبراني؟', 'إزاي رؤية بتساعد في التحول السحابي؟', 'ما القطاعات التي تخدمها رؤية؟']
    : ['What cybersecurity services do you offer?', 'How does Roaya support cloud transformation?', 'Which industries does Roaya serve?']);
  readonly knowledgeLinks = computed<KnowledgeLink[]>(() => this.isArabic() ? [
    { label: 'الخدمات', description: 'Cloud, security & managed IT', route: '/services', icon: 'services' },
    { label: 'القطاعات', description: 'حلول حسب مجال عملك', route: '/industries', icon: 'industries' },
    { label: 'قصص النجاح', description: 'نتائج منشورة من مشروعات رؤية', route: '/resources/case-studies', icon: 'cases' },
    { label: 'الأسعار', description: 'الباقات وخيارات الخدمة', route: '/pricing', icon: 'pricing' },
  ] : [
    { label: 'Services', description: 'Cloud, security & managed IT', route: '/services', icon: 'services' },
    { label: 'Industries', description: 'Solutions for your sector', route: '/industries', icon: 'industries' },
    { label: 'Case studies', description: 'Published customer outcomes', route: '/resources/case-studies', icon: 'cases' },
    { label: 'Pricing', description: 'Packages and service options', route: '/pricing', icon: 'pricing' },
  ]);
  readonly followUpQuestions = computed(() => this.isArabic()
    ? ['ما الخدمة الأنسب لاحتياجي؟', 'اعرض لي دراسة حالة مرتبطة']
    : ['Which service best fits this need?', 'Show me a related case study']);

  question = '';

  toggle(): void {
    this.isOpen.update((value) => !value);
    if (this.isOpen()) setTimeout(() => this.questionInput?.nativeElement.focus(), 50);
  }

  close(): void {
    this.isOpen.set(false);
  }

  clearConversation(): void {
    this.messages.set([]);
    this.question = '';
    setTimeout(() => this.questionInput?.nativeElement.focus(), 0);
  }

  toggleSound(): void {
    this.soundEnabled.update((enabled) => !enabled);
    if (this.soundEnabled()) this.playSound('receive');
  }

  setFeedback(index: number, feedback: 'helpful' | 'not-helpful'): void {
    this.messages.update((items) => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, feedback } : item));
  }

  askSuggested(question: string): void {
    this.question = question;
    this.submit();
  }

  submit(): void {
    const question = this.question.trim();
    if (!question || this.isBusy()) return;
    const requestStartedAt = Date.now();

    const history = this.messages().map(({ role, content }) => ({ role, content }));
    this.messages.update((items) => [...items, { role: 'user', content: question }]);
    this.question = '';
    this.isBusy.set(true);
    this.playSound('send');
    setTimeout(() => this.scrollToLatest(), 0);

    this.ragChat.ask(question, this.languageService.language(), history).subscribe({
      next: (result) => {
        this.afterTypingDelay(requestStartedAt, () => {
          this.messages.update((items) => [...items, {
            role: 'assistant',
            content: result.answer,
            sources: result.sources,
            outOfScope: !result.inScope,
          }]);
          this.isBusy.set(false);
          this.playSound('receive');
          setTimeout(() => this.scrollToLatest(), 0);
        });
      },
      error: () => {
        this.afterTypingDelay(requestStartedAt, () => {
          this.messages.update((items) => [...items, {
            role: 'assistant',
            content: this.isArabic()
              ? 'تعذر الوصول إلى مساعد رؤية الآن. من فضلك جرّب مرة أخرى بعد قليل.'
              : 'Roaya Assistant is temporarily unavailable. Please try again shortly.',
          }]);
          this.isBusy.set(false);
          setTimeout(() => this.scrollToLatest(), 0);
        });
      },
    });
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  trackMessage(index: number): number {
    return index;
  }

  private scrollToLatest(): void {
    const container = document.querySelector<HTMLElement>('.roaya-assistant__messages');
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  private afterTypingDelay(startedAt: number, action: () => void): void {
    const remaining = Math.max(0, this.minimumTypingMs - (Date.now() - startedAt));
    setTimeout(action, remaining);
  }

  private playSound(type: 'send' | 'receive'): void {
    if (!this.soundEnabled() || typeof window === 'undefined' || !window.AudioContext) return;

    try {
      this.audioContext ??= new AudioContext();
      if (this.audioContext.state === 'suspended') void this.audioContext.resume();
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(type === 'send' ? 420 : 610, now);
      oscillator.frequency.exponentialRampToValueAtTime(type === 'send' ? 540 : 760, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(type === 'send' ? 0.035 : 0.045, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.13);
    } catch {
      // Audio feedback is optional; messaging must still work if audio is blocked.
    }
  }
}
