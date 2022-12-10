import { CacheModule, CACHE_MANAGER, Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          url: configService.get<string>('redis.url'),
          ttl: configService.get<number>('redis.ttl'),
          // connectionString: configService.get<string>('redis.connectionString'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService, ConfigService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
