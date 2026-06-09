import { Injectable, Logger } from "@nestjs/common";import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class RedactionService {
  private readonly logger = new Logger(RedactionService.name);

  constructor(
  ) { }

  private caesarCipher(str: string) {
    return str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 5)).join('');
  }

  public genKey(tracker: string[]) {
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

  public getWordsToCensored(keywords: string): string[] {
    const regex = /"[^"]+"|'[^']+'|“[^”]+”|‘[^’]+’|[^"\s,‘'“”]+/g;
    const words = (keywords.match(regex) || []).map(item => {
      return item.replace(/^["'“‘]|["'”’]$/g, '').trim();
    });
    return [...new Set(words)].sort((a, b) => { return b.length - a.length });
  }

  public visualCensure(doc: string, words: string[], tracker: { word: string, index: number }[]): string {
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
}