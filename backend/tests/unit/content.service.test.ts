import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentStatus, ContentType } from '@prisma/client';
import { NotFoundError } from '../../src/domain/exceptions/index.js';

// Mock the dependencies before importing the service
vi.mock('../../src/config/database.js', () => ({
  prisma: {
    contentItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../../src/shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ContentService.getContentBySlug', () => {
  const post = {
    id: '11111111-1111-4111-8111-111111111111',
    type: ContentType.BLOG_POST,
    status: ContentStatus.PUBLISHED,
    titleEn: 'Cloud Migration',
    titleAr: 'ترحيل السحابة',
    slugEn: 'cloud-migration',
    slugAr: 'ترحيل-السحابة',
    contentEn: '<p>en</p>',
    contentAr: '<p>ar</p>',
    viewCount: 7,
  };

  const expectedWhere = {
    status: ContentStatus.PUBLISHED,
    OR: [{ slugEn: 'cloud-migration' }, { slugAr: 'cloud-migration' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds a post by its English slug for lang=en and increments viewCount', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue({ ...post, viewCount: 8 } as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    const result = await contentService.getContentBySlug('cloud-migration', 'en');

    expect(result).toEqual(post);
    expect(prisma.contentItem.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.contentItem.findMany).toHaveBeenCalledWith({ where: expectedWhere, take: 2 });
    expect(prisma.contentItem.update).toHaveBeenCalledWith({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  });

  it('finds a post by its English slug for lang=ar (the /ar/resources/blog/<slugEn> URL case)', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    const result = await contentService.getContentBySlug('cloud-migration', 'ar');

    expect(result).toEqual(post);
    // lang is ignored for the lookup: identical OR query as for lang=en.
    expect(prisma.contentItem.findMany).toHaveBeenCalledWith({ where: expectedWhere, take: 2 });
  });

  it('finds a post by its Arabic slug regardless of lang', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    const result = await contentService.getContentBySlug('ترحيل-السحابة', 'en');

    expect(result).toEqual(post);
    expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
      where: {
        status: ContentStatus.PUBLISHED,
        OR: [{ slugEn: 'ترحيل-السحابة' }, { slugAr: 'ترحيل-السحابة' }],
      },
      take: 2,
    });
  });

  it('defaults lang to en and still queries both slug columns', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    await contentService.getContentBySlug('cloud-migration');

    expect(prisma.contentItem.findMany).toHaveBeenCalledWith({ where: expectedWhere, take: 2 });
  });

  it('throws NotFoundError for an unknown slug and does not touch viewCount', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([]);

    const { contentService } = await import('../../src/application/services/content.service.js');

    await expect(contentService.getContentBySlug('does-not-exist', 'ar')).rejects.toBeInstanceOf(NotFoundError);
    await expect(contentService.getContentBySlug('does-not-exist', 'ar')).rejects.toThrow('Content not found');
    expect(prisma.contentItem.update).not.toHaveBeenCalled();
  });

  it('only ever asks for PUBLISHED items (drafts are excluded by the query)', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([]);

    const { contentService } = await import('../../src/application/services/content.service.js');
    await expect(contentService.getContentBySlug('draft-only', 'en')).rejects.toBeInstanceOf(NotFoundError);

    const call = vi.mocked(prisma.contentItem.findMany).mock.calls[0]?.[0];
    expect(call?.where).toMatchObject({ status: ContentStatus.PUBLISHED });
  });

  it('prefers the slugEn match when one string matches slugEn of one item and slugAr of another', async () => {
    const { prisma } = await import('../../src/config/database.js');
    const other = { ...post, id: '22222222-2222-4222-8222-222222222222', slugEn: 'other-post', slugAr: 'cloud-migration' };
    // Return the collision in the "wrong" order to prove the choice is deterministic.
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([other, post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    const result = await contentService.getContentBySlug('cloud-migration', 'ar');

    expect(result.id).toBe(post.id);
    expect(prisma.contentItem.update).toHaveBeenCalledWith({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  });
  it('scopes the query to the requested content type so a case study cannot answer under /content/blog', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    await contentService.getContentBySlug('cloud-migration', 'en', ContentType.BLOG_POST);

    expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
      where: { ...expectedWhere, type: ContentType.BLOG_POST },
      take: 2,
    });
  });

  it('omits the type filter entirely when no content type is given', async () => {
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([post] as any);
    vi.mocked(prisma.contentItem.update).mockResolvedValue(post as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    await contentService.getContentBySlug('cloud-migration');

    const call = vi.mocked(prisma.contentItem.findMany).mock.calls[0]?.[0] as any;
    expect(call?.where).not.toHaveProperty('type');
  });

  it('throws NotFoundError when the slug exists but under a different content type', async () => {
    const { prisma } = await import('../../src/config/database.js');
    // The scoped query simply matches nothing — the case study is not a blog post.
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([] as any);

    const { contentService } = await import('../../src/application/services/content.service.js');
    await expect(
      contentService.getContentBySlug('bank-cloud-migration', 'en', ContentType.BLOG_POST),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prisma.contentItem.update).not.toHaveBeenCalled();
  });
});
