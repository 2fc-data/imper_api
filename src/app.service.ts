import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async healthCheck() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return {
        status: 'ok',
        database: 'connected',
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  async healthDetailed() {
    const memBefore = process.memoryUsage();
    const start = Date.now();

    const dbCheck = await this.checkDatabase();
    const uptime = process.uptime();
    const memAfter = process.memoryUsage();

    return {
      status: dbCheck.status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: this.formatUptime(uptime),
      },
      environment: {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV ?? 'unknown',
        port: process.env.PORT ?? '3000 (default)',
        pid: process.pid,
      },
      memory: {
        rss: `${(memAfter.rss / 1024 / 1024).toFixed(1)} MB`,
        heapUsed: `${(memAfter.heapUsed / 1024 / 1024).toFixed(1)} MB`,
        heapTotal: `${(memAfter.heapTotal / 1024 / 1024).toFixed(1)} MB`,
        external: `${(memAfter.external / 1024 / 1024).toFixed(1)} MB`,
        deltaSinceCheck: `${((memAfter.rss - memBefore.rss) / 1024 / 1024).toFixed(2)} MB`,
      },
      database: dbCheck,
      process: {
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  private async checkDatabase() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return {
        status: 'ok' as const,
        connected: true,
        latencyMs: latency,
      };
    } catch (error) {
      return {
        status: 'error' as const,
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        latencyMs: Date.now() - start,
      };
    }
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  }
}
