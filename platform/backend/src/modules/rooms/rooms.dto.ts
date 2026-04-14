import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { RoomType } from '../../common/enums/room-type.enum';

export class CreateRoomDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsEnum(RoomType)
  type!: RoomType;
}

export class AddRoomMemberDto {
  @IsUUID()
  userId!: string;
}

export class ListRoomsQueryDto {
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;
}
