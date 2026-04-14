import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../../common/enums/message-type.enum';

export class ListMessagesQueryDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}

export class CreateMessageDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  @Length(1, 4000)
  content!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;
}

export class UpdateMessageDto {
  @IsString()
  @Length(1, 4000)
  content!: string;
}

export class ReactToMessageDto {
  @IsString()
  @Length(1, 32)
  emoji!: string;
}
