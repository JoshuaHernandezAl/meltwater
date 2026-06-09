import { BadRequestException, Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CensorDocumentDTO, CensorResponse } from './dtos/CensorDocument';
import { UncensorDocumentDTO, UncensorResponse } from './dtos/UncensorDocuments';

@Controller({
  path: 'meltwater',
  version: '1',
})
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getDocumentsByKeywords(@Query('keyword') keyword: string): Promise<string[]> {
    if (!keyword || keyword.trim().length === 0) {
      throw new BadRequestException('Keyword is required');
    }
    return this.appService.getDocumentsByKeywords(keyword);
  }
  @Post('encrypt')
  async encryptDocument(@Body() data: CensorDocumentDTO):Promise<CensorResponse>{
    return this.appService.censorDocument(data);
  }

  @Post('decrypt')
  decryptDocument(@Body() data: UncensorDocumentDTO):Promise<UncensorResponse>{
    return this.appService.unredact(data);
  }

}