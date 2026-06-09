import { IsString } from "class-validator";

export class UncensorDocumentDTO {
  @IsString()
  document: string;
  @IsString()
  key: string;
}

export class UncensorResponse {
  document: string;
}