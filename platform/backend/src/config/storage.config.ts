export default () => ({
  storage: {
    driver: process.env.STORAGE_DRIVER ?? 'local',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? './uploads',
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: Number(process.env.MINIO_PORT ?? 9000),
    bucket: process.env.MINIO_BUCKET ?? 'liquid-glass-files',
    useSsl: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin'
  }
});
