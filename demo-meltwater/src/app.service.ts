import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CensorDocumentDTO, CensorResponse } from './dtos/CensorDocument';
import { UncensorDocumentDTO, UncensorResponse } from './dtos/UncensorDocuments';
import { RedactionService } from './redaction.service';
import { RedactedDocument } from './schemas/RedactedDocument.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchService } from './search.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectModel(RedactedDocument.name)
    private readonly redactedDocumentModel: Model<RedactedDocument>,
    private readonly redactionService: RedactionService,
    private readonly searchService: SearchService,
  ) { }

  public async censorDocument(data: CensorDocumentDTO): Promise<CensorResponse> {
    const { document: doc, keywords } = data;
    if (doc.length === 0 || keywords.length === 0) {
      throw new BadRequestException("Document or keywords are empty");
    }
    const wordsToCensored = this.redactionService.getWordsToCensored(keywords);
    const tracker: { word: string, index: number }[] = [];
    const visualOutput = this.redactionService.visualCensure(doc, wordsToCensored, tracker);
    const sortedTracker = tracker
      .sort((a, b) => a.index - b.index)
      .map(item => item.word);
    const key = this.redactionService.genKey(sortedTracker);
    const docDB = await this.redactedDocumentModel.create({
      redactedContent: visualOutput,
      deRedactionKey: key,
    });
    await this.searchService.indexKeywords(docDB.id, wordsToCensored.map(word => word.toLowerCase()));
    return {
      document: visualOutput,
      key,
    }
  }

  public async unredact(data: UncensorDocumentDTO): Promise<UncensorResponse> {
    const { document: doc, key } = data;
    try {
      const rawKey = Buffer.from(key, 'base64')
        .toString('utf-8')
        .split('')
        .map(c => String.fromCharCode(c.charCodeAt(0) - 5))
        .join('');

      const [startPadding, payload, endPadding] = rawKey.split('.');

      if (!startPadding || !startPadding.startsWith("CRYPTO_KEY_")) {
        throw new Error("Invalid key format");
      }

      const separator = endPadding![0];
      if (!payload) return { document: doc };

      let words = payload.split(separator!).map(w => w.replace(/-/g, ' '));
      const direction = startPadding[startPadding.length - 1];

      if (direction === 'D') {
        words.reverse();
      }

      let docUncensored = doc;
      const regex = /X{4,10}/;

      for (const word of words) {
        docUncensored = docUncensored.replace(regex, word);
      }

      return { document: docUncensored };
    } catch (error) {
      throw new Error("Error while decrypting");
    }
  }

  async getDocumentsByKeywords(keyword: string): Promise<string[]> {
    return this.searchService.searchKeywords(keyword);
  }
}
