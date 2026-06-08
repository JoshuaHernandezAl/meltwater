function solution(doc: string, keywords: string): string {
  if (doc.length === 0 || keywords.length === 0) {
    return doc;
  }
  const regex = /"[^"]+"|'[^']+'|“[^”]+”|‘[^’]+’|[^"\s,‘'“”]+/g;
  const words = (keywords.match(regex) || []).map(item => {
    return item.replace(/^["'“‘]|["'”’]$/g, '').trim();
  });
  const wordsToCensored = [...new Set(words)].sort((a, b) => { return b.length - a.length });

  let output = doc;
  for (const word of wordsToCensored) {
    const pattern = new RegExp(word, 'ig');
    const radomCensure = "X".repeat(Math.floor(Math.random() * 6) + 4);
    output = output.replace(pattern, radomCensure);
  }
  return output;
}


const keywordsList: string = 'Bondman Twilight,"Loid Forger","Agente Papi","Yor Forger","Agente Mami","Thorn Princess" Anya';
// const doc = "docs/test.txt";
const doc: string = `SPYXFAMILY
La nueva Mision de Bondman y el Agente Twilight alias Loid Forger alias Agente Papi
Para esta mision el Twilight y Thorn Princess alias Yor Forger alias Agente Mami deberan a la agente Anya siguendo las ordenes de Bondman`

const rs = solution(doc, keywordsList);
console.log(rs)
