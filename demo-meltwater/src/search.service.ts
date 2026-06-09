import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = 'redacted_keywords';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) { }
  public async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({ index: this.indexName });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              documentId: { type: 'keyword' },
              keywords: { type: 'keyword' },
            },
          },
        });
      }
      this.logger.log('Index created');
    } catch (error) {
      this.logger.error('Error creating index', error);
    }
  }

  public async indexKeywords(documentId: string, keywords: string[]): Promise<void> {
    await this.elasticsearchService.index({
      index: this.indexName,
      id: documentId,
      body: {
        documentId,
        keywords,
      },
    });

    this.logger.log(`Indexed keywords for document ${documentId}`);
  }

  public async searchKeywords(keyword: string): Promise<string[]> {
    this.logger.log(`Searching for keywords ${keyword}`);
    try {
      const response = await this.elasticsearchService.search({
        index: this.indexName,
        query: {
          term: {
            keywords: keyword.toLowerCase().trim(),
          },
        },
      });

      const hits = response.hits.hits;
      this.logger.log(`Found ${hits.length} documents`);
      return hits.map((hit: any) => hit._source.documentId);
    } catch (error) {
      this.logger.error('Error searching for keywords', error);
      return [];
    }
  }
}