import { IsUUID } from 'class-validator';

export class StartScreenShareDto {
  @IsUUID()
  callId!: string;
}
