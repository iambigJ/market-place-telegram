import multer from 'multer';
import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (file.mimetype.startsWith('image/png')) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Only png image files are allowed!'), false);
  }
};

export function imageUploader(): ReturnType<typeof FilesInterceptor> {
  return FilesInterceptor('files', 3, {
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit per file
  });
}
