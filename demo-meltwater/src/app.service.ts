import { Injectable } from '@nestjs/common';
import { CensorDocumentDTO, CensorResponse } from './dtos/CensorDocument';
import { UncensorDocumentDTO, UncensorResponse } from './dtos/UncensorDocuments';

@Injectable()
export class AppService {
  public async censorDocument(data: CensorDocumentDTO): Promise<CensorResponse> {
    const { document: doc, keywords } = data;
    if (doc.length === 0 || keywords.length === 0) {
      throw new Error("Error generating key");
    }
    const wordsToCensored = this.getWordsToCensored(keywords);
    const tracker: { word: string, index: number }[] = [];
    const visualOutput = this.visualCensure(doc, wordsToCensored, tracker);
    const sortedTracker = tracker
      .sort((a, b) => a.index - b.index)
      .map(item => item.word);
    const key = this.genKey(sortedTracker);
    return {
      document: visualOutput,
      key,
    }
  }
  private genKey(tracker: string[]) {
    const directions = ['D', 'U'];
    const separators = ['&', '$', '^'];

    const direction = directions[Math.floor(Math.random() * directions.length)];
    const separator = separators[Math.floor(Math.random() * separators.length)];

    const startPadding = `CRYPTO_KEY_${direction}`;
    const endPadding = `${separator}Encrypted-Message${separator}`;

    let payloadArray = tracker.map(item => item.replace(/\s/g, '-'));

    if (direction === 'D') {
      payloadArray.reverse();
    }
    const payload = payloadArray.join(separator);
    const keyRaw = `${startPadding}.${payload}.${endPadding}`;

    return Buffer.from(this.caesarCipher(keyRaw)).toString('base64');
  }

  private caesarCipher(str: string) {
    return str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 5)).join('');
  }

  private getWordsToCensored(keywords: string): string[] {
    const regex = /"[^"]+"|'[^']+'|“[^”]+”|‘[^’]+’|[^"\s,‘'“”]+/g;
    const words = (keywords.match(regex) || []).map(item => {
      return item.replace(/^["'“‘]|["'”’]$/g, '').trim();
    });
    return [...new Set(words)].sort((a, b) => { return b.length - a.length });
  }

  private visualCensure(doc: string, words: string[], tracker: { word: string, index: number }[]): string {
    let visualOutput = doc;

    for (const word of words) {
      const pattern = new RegExp(`${word}`, 'ig');
      let match;
      while ((match = pattern.exec(visualOutput)) !== null) {
        tracker.push({
          word: match[0],
          index: match.index
        });
      }
      visualOutput = visualOutput.replace(pattern, () => {
        return "X".repeat(Math.floor(Math.random() * 6) + 4);
      });
    }
    return visualOutput;
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

      return {document: docUncensored};
    } catch (error) {
      throw new Error("Error while decrypting");
    }
  }
}
