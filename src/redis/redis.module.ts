import { RedisService } from './redis.service';
import { Module, CACHE_MANAGER, CacheModule, Inject } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          url: configService.get<string>('redis.url'),
          ttl: configService.get<number>('redis.ttl'),
          password: configService.get<string>('redis.password'),
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
