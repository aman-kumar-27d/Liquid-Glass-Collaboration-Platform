import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { Client as MinioClient } from 'minio';
import { Readable } from 'stream';
import { StoreFileInput, StoredObjectDescriptor } from './storage.types';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private minioClient?: MinioClient;

  constructor(private readonly configService: ConfigService) {
    if (this.driver === 'minio') {
      this.minioClient = new MinioClient({
        endPoint: this.configService.get<string>('storage.endpoint') ?? 'localhost',
        port: this.configService.get<number>('storage.port') ?? 9000,
        useSSL: this.configService.get<boolean>('storage.useSsl') ?? false,
        accessKey: this.configService.get<string>('storage.accessKey') ?? 'minioadmin',
        secretKey: this.configService.get<string>('storage.secretKey') ?? 'minioadmin'
      });
    }
  }

  get driver() {
    return this.configService.get<string>('storage.driver') ?? 'local';
  }

  async storeFile(input: StoreFileInput): Promise<StoredObjectDescriptor> {
    if (this.driver === 'minio') {
      return this.storeInMinio(input);
    }

    return this.storeLocally(input);
  }

  async openDownload(storagePath: string) {
    if (this.driver === 'minio') {
      return this.openMinioObject(storagePath);
    }

    return {
      mode: 'local' as const,
      path: storagePath
    };
  }

  private async storeLocally(input: StoreFileInput): Promise<StoredObjectDescriptor> {
    const uploadsRoot = path.resolve(
      process.cwd(),
      this.configService.get<string>('storage.localUploadDir') ?? './backend/uploads'
    );
    const companyDir = path.join(uploadsRoot, input.companyId);
    await fs.mkdir(companyDir, { recursive: true });

    const storedName = `${randomUUID()}-${sanitizeName(input.fileName)}`;
    const absolutePath = path.join(companyDir, storedName);
    await fs.writeFile(absolutePath, input.buffer);

    return {
      driver: 'local',
      storedName,
      storagePath: absolutePath
    };
  }

  private async storeInMinio(input: StoreFileInput): Promise<StoredObjectDescriptor> {
    const client = this.getMinioClient();
    const bucket = this.configService.get<string>('storage.bucket') ?? 'liquid-glass-files';
    const storedName = `${input.companyId}/${randomUUID()}-${sanitizeName(input.fileName)}`;

    await this.ensureBucket(bucket);
    await client.putObject(bucket, storedName, input.buffer, input.buffer.length, {
      'Content-Type': input.contentType
    });

    return {
      driver: 'minio',
      storedName,
      storagePath: `${bucket}/${storedName}`
    };
  }

  private async openMinioObject(storagePath: string) {
    const client = this.getMinioClient();
    const [bucket, ...rest] = storagePath.split('/');
    const objectName = rest.join('/');
    const stream = await client.getObject(bucket, objectName);

    return {
      mode: 'stream' as const,
      stream
    };
  }

  private async ensureBucket(bucket: string) {
    const client = this.getMinioClient();
    const exists = await client.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await client.makeBucket(bucket);
      this.logger.log(`Created MinIO bucket ${bucket}`);
    }
  }

  private getMinioClient() {
    if (!this.minioClient) {
      throw new InternalServerErrorException('MinIO client is not configured');
    }

    return this.minioClient;
  }
}

function sanitizeName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}
