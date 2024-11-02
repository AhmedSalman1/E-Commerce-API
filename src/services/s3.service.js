import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/appError.js';

// Configure S3 instance
const s3 = new AWS.S3();

export const s3Upload = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuidv4()}-${Date.now()}-${file.originalname}.jpeg`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    return await s3.upload(params).promise();
  } catch (err) {
    return new AppError('Error uploading file to S3', 500);
  }
};
