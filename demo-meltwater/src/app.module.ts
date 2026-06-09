import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedactionService } from './redaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RedactedDocument, RedactedDocumentSchema } from './schemas/RedactedDocument.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: RedactedDocument.name, schema: RedactedDocumentSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, RedactionService, SearchService],
})
export class AppModule { }
