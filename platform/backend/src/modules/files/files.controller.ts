import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadFileDto } from './files.dto';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }
    })
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: any
  ) {
    return this.filesService.upload(file, dto, user);
  }

  @Get(':id')
  getMetadata(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.filesService.getMetadata(id, user);
  }

  @Get(':id/download')
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: any,
    @Res() response: Response
  ) {
    const storedFile = await this.filesService.resolveDownload(id, user);
    const download = await this.filesService.openDownload(storedFile);

    if (download.mode === 'local') {
      return response.download(download.path, storedFile.originalName);
    }

    response.setHeader('Content-Type', storedFile.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(storedFile.originalName)}"`
    );
    download.stream.pipe(response);
  }
}
