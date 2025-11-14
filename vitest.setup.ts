import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Prisma Client
vi.mock('@/src/lib/prisma', () => ({
  prisma: {
    scanResult: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));
