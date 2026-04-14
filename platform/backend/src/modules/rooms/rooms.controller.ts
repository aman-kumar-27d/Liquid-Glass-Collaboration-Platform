import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddRoomMemberDto, CreateRoomDto, ListRoomsQueryDto } from './rooms.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    return this.roomsService.create(dto, user);
  }

  @Get()
  list(@Query() query: ListRoomsQueryDto, @CurrentUser() user: any) {
    return this.roomsService.list(query, user);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.roomsService.findOne(id, user);
  }

  @Post(':id/join')
  join(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.roomsService.join(id, user);
  }

  @Post(':id/leave')
  leave(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.roomsService.leave(id, user);
  }

  @Post(':id/members')
  addMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddRoomMemberDto,
    @CurrentUser() user: any
  ) {
    return this.roomsService.addMember(id, dto, user);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: any
  ) {
    return this.roomsService.removeMember(id, userId, user);
  }
}
