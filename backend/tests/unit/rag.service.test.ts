import { describe, expect, it, vi } from 'vitest';

// Keep this focused unit test independent from a developer's local logging format.
process.env.LOG_FORMAT = 'dev';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    contentItem: { findMany: vi.fn().mockResolvedValue([]) },
    servicePackage: { findMany: vi.fn().mockResolvedValue([]) },
    teamMember: { findMany: vi.fn().mockResolvedValue([]) },
    testimonial: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock('../../src/shared/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe('RagService', () => {
  it('answers a question supported by Roaya content and returns sources', async () => {
    const { config } = await import('../../src/config/environment.js');
    const ragConfig = config.rag as { generationProvider: 'ollama' | 'openai' | 'extractive' };
    const originalProvider = ragConfig.generationProvider;
    ragConfig.generationProvider = 'extractive';
    const { ragService } = await import('../../src/application/services/rag.service.js');
    const result = await ragService.answer('ما هي خدمات الأمن السيبراني؟', 'ar', []);

    expect(result.inScope).toBe(true);
    expect(result.answer.length).toBeGreaterThan(20);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0]?.url).toMatch(/^\//);
    expect(result.sources.some((source) => source.url.includes('/services/security'))).toBe(true);
    ragConfig.generationProvider = originalProvider;
  });

  it('treats conversational service wording as an in-scope Roaya question', async () => {
    const { config } = await import('../../src/config/environment.js');
    const ragConfig = config.rag as { generationProvider: 'ollama' | 'openai' | 'extractive' };
    const originalProvider = ragConfig.generationProvider;
    ragConfig.generationProvider = 'extractive';
    const { ragService } = await import('../../src/application/services/rag.service.js');

    const result = await ragService.answer('What services did Roaya provide to me?', 'en', []);

    expect(result.inScope).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources.some((source) => source.url.startsWith('/services'))).toBe(true);
    ragConfig.generationProvider = originalProvider;
  });

  it('answers a general company overview question', async () => {
    const { config } = await import('../../src/config/environment.js');
    const ragConfig = config.rag as { generationProvider: 'ollama' | 'openai' | 'extractive' };
    const originalProvider = ragConfig.generationProvider;
    ragConfig.generationProvider = 'extractive';
    const { ragService } = await import('../../src/application/services/rag.service.js');

    const result = await ragService.answer('What is Roaya?', 'en', []);

    expect(result.inScope).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    ragConfig.generationProvider = originalProvider;
  });

  it('refuses a question unrelated to published Roaya content', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { config } = await import('../../src/config/environment.js');
    const mutableOpenAI = config.openai as { apiKey?: string; vectorStoreId?: string };
    const originalApiKey = mutableOpenAI.apiKey;
    const originalVectorStoreId = mutableOpenAI.vectorStoreId;
    mutableOpenAI.apiKey = 'test-key';
    mutableOpenAI.vectorStoreId = 'vs_test';
    const { ragService } = await import('../../src/application/services/rag.service.js');
    const result = await ragService.answer('من فاز بكأس العالم لكرة القدم سنة 2018؟', 'ar', []);

    expect(result.inScope).toBe(false);
    expect(result.sources).toEqual([]);
    expect(result.answer).toContain('خارج نطاق');
    expect(fetchSpy).not.toHaveBeenCalled();
    mutableOpenAI.apiKey = originalApiKey;
    mutableOpenAI.vectorStoreId = originalVectorStoreId;
    vi.unstubAllGlobals();
  });

  it('serves an identical supported request from cache after one generation call', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ output_text: 'توفر رؤية حلولًا لحماية البيانات.' }),
    });
    vi.stubGlobal('fetch', fetchSpy);
    const { config } = await import('../../src/config/environment.js');
    const mutableOpenAI = config.openai as { apiKey?: string };
    const ragConfig = config.rag as { generationProvider: 'ollama' | 'openai' | 'extractive' };
    const originalApiKey = mutableOpenAI.apiKey;
    const originalProvider = ragConfig.generationProvider;
    mutableOpenAI.apiKey = 'test-key';
    ragConfig.generationProvider = 'openai';
    const { ragService } = await import('../../src/application/services/rag.service.js');
    const question = 'كيف تحمي رؤية البيانات من خلال خدمات الأمن السيبراني؟';

    const first = await ragService.answer(question, 'ar', []);
    const second = await ragService.answer(question, 'ar', []);

    expect(first.inScope).toBe(true);
    expect(second.answer).toBe(first.answer);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    mutableOpenAI.apiKey = originalApiKey;
    ragConfig.generationProvider = originalProvider;
    vi.unstubAllGlobals();
  });

  it('uses the local Ollama chat API without an OpenAI authorization header', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: { content: 'تقدم رؤية حلول الحوسبة السحابية.' },
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);
    const { config } = await import('../../src/config/environment.js');
    const ragConfig = config.rag as { generationProvider: 'ollama' | 'openai' | 'extractive' };
    const originalProvider = ragConfig.generationProvider;
    ragConfig.generationProvider = 'ollama';
    const { ragService } = await import('../../src/application/services/rag.service.js');

    const result = await ragService.answer('ما حلول الحوسبة السحابية التي تقدمها رؤية؟', 'ar', []);

    expect(result.inScope).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, request] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://127.0.0.1:11434/api/chat');
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: 'qwen3.5:4b',
      stream: false,
      think: false,
    });
    ragConfig.generationProvider = originalProvider;
    vi.unstubAllGlobals();
  });
});
