import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  // constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): void {
    // return this.appService.getHello();
  }
}
