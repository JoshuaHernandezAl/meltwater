interface RedactionResult {
  document: string;
  key: string;
}

function solution(doc: string, keywords: string): RedactionResult {
  if (doc.length === 0 || keywords.length === 0) {
    return {
      document: doc,
      key: "Error generating key"
    };
  }
  const wordsToCensored = getWordsToCensored(keywords);
  const tracker: { word: string, index: number }[] = [];
  const visualOutput = visualCensure(doc, wordsToCensored, tracker);
  const sortedTracker = tracker
    .sort((a, b) => a.index - b.index)
    .map(item => item.word);
  const key = genKey(sortedTracker);
  return {
    document: visualOutput,
    key,
  }
}

function genKey(tracker: string[]) {
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

  return Buffer.from(caesarCipher(keyRaw)).toString('base64');
}

function caesarCipher(str: string) {
  return str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 5)).join('');
}

function getWordsToCensored(keywords: string): string[] {
  const regex = /"[^"]+"|'[^']+'|“[^”]+”|‘[^’]+’|[^"\s,‘'“”]+/g;
  const words = (keywords.match(regex) || []).map(item => {
    return item.replace(/^["'“‘]|["'”’]$/g, '').trim();
  });
  return [...new Set(words)].sort((a, b) => { return b.length - a.length });
}

function visualCensure(doc: string, words: string[], tracker: { word: string, index: number }[]): string {
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

function unredact(doc: string, key: string): string {
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
    if (!payload) return doc;

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

    return docUncensored;
  } catch (error) {
    return "Error while decrypting";
  }
}


const keywordsList: string = 'Bondman Twilight,"Loid Forger","Agente Papi","Yor Forger","Agente Mami","Thorn Princess" Anya';
const doc: string = `SPYXFAMILY
La nueva Mision de Bondman y el Agente Twilight alias Loid Forger alias Agente Papi
Para esta mision el Twilight y Thorn Princess alias Yor Forger alias Agente Mami deberan rescatar a la agente Anya siguendo las ordenes de Bondman`

const rs = solution(doc, keywordsList);
console.log("===DOCUMENT===")
console.log(rs.document)
console.log("===KEY===")
console.log(rs.key)

const document = unredact(rs.document, rs.key);
console.log("=== Uncesored Document===")
console.log(document)
