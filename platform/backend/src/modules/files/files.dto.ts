import { IsOptional, IsUUID } from 'class-validator';

export class UploadFileDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @IsUUID()
  messageId?: string;
}
