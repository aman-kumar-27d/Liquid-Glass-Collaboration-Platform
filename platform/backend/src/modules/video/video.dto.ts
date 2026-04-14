import { IsUUID } from 'class-validator';

export class StartCallDto {
  @IsUUID()
  roomId!: string;
}

export class JoinCallDto {
  @IsUUID()
  callId!: string;
}
