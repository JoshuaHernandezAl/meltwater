import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'redacted_documents' })
export class RedactedDocument extends Document {
  @Prop({ required: true })
  redactedContent: string;

  @Prop({ required: true })
  deRedactionKey: string;
}

export const RedactedDocumentSchema = SchemaFactory.createForClass(RedactedDocument);