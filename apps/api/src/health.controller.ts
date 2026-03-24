import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async check() {
    let database = 'up';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }

    let redis = 'up';
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({
          host: this.configService.get('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          timeout: 2000,
        });
        socket.once('connect', () => { socket.destroy(); resolve(); });
        socket.once('error', (err) => { socket.destroy(); reject(err); });
        socket.once('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
      });
    } catch {
      redis = 'down';
    }

    const allUp = database === 'up' && redis === 'up';
    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
      redis,
    };
  }
}
