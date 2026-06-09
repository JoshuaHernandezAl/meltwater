import { IsNotEmpty, IsString } from "class-validator";

export class CensorDocumentDTO {
  @IsString()
  @IsNotEmpty()
  document: string;
  @IsString()
  @IsNotEmpty()
  keywords: string;
}

export class CensorResponse {
  document: string;
  key: string;
}
