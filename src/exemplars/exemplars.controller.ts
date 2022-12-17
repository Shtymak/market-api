import { Controller } from '@nestjs/common';
import { ExemplarsService } from './exemplars.service';

@Controller('exemplars')
export class ExemplarsController {
  constructor(private readonly exemplarsService: ExemplarsService) {}
}
