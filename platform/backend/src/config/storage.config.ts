export default () => ({
  storage: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: Number(process.env.MINIO_PORT ?? 9000),
    bucket: process.env.MINIO_BUCKET ?? 'liquid-glass-files'
  }
});
