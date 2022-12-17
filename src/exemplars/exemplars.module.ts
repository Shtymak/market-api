import { Module } from '@nestjs/common';
import { ExemplarsService } from './exemplars.service';
import { ExemplarsController } from './exemplars.controller';

@Module({
  controllers: [ExemplarsController],
  providers: [ExemplarsService]
})
export class ExemplarsModule {}
