export interface StoreFileInput {
  companyId: string;
  fileName: string;
  contentType: string;
  buffer: Buffer;
}

export interface StoredObjectDescriptor {
  driver: string;
  storedName: string;
  storagePath: string;
}
