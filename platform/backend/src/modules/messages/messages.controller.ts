import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMessageDto, ListMessagesQueryDto, ReactToMessageDto, UpdateMessageDto } from './messages.dto';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway
  ) {}

  @Get()
  list(@Query() query: ListMessagesQueryDto, @CurrentUser() user: any) {
    return this.messagesService.list(query, user);
  }

  @Post()
  async create(@Body() dto: CreateMessageDto, @CurrentUser() user: any) {
    const result = await this.messagesService.create(dto, user);
    this.messagesGateway.emitMessageCreated(dto.roomId, result.data);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMessageDto,
    @CurrentUser() user: any
  ) {
    const result = await this.messagesService.update(id, dto, user);
    this.messagesGateway.emitMessageUpdated(result.data.roomId, result.data);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    const result = await this.messagesService.remove(id, user);
    this.messagesGateway.emitMessageDeleted(result.data.roomId, result.data);
    return result;
  }

  @Post(':id/reactions')
  async react(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReactToMessageDto,
    @CurrentUser() user: any
  ) {
    const result = await this.messagesService.react(id, dto, user);
    this.messagesGateway.emitReactionAdded(result.meta.roomId, result.data);
    return result;
  }
}
