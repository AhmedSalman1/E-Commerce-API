import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/appError.js';

// Configure S3 instance
const s3 = new S3Client({ region: process.env.AWS_REGION });

export const s3Upload = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuidv4()}-${Date.now()}-${file.originalname}.jpeg`,
    Body: file.buffer,
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    return {
      Location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
      ...response,
    };
  } catch (err) {
    return new AppError('Error uploading file to S3', 500);
  }
};

export const s3UploadMultiple = async (files) => {
  try {
    const uploadPromises = files.map((file) => s3Upload(file));
    return await Promise.all(uploadPromises);
  } catch (err) {
    return new AppError('Error uploading multiple file to S3', 500);
  }
};
