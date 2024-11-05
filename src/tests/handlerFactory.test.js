import { jest, describe, afterEach, it, expect } from '@jest/globals';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from '../controllers/handlerFactory.js';

// Helper functions for creating mock (req, res, next) functions
const createMockReq = (params = {}, body = {}, query = {}) => ({
  params,
  body,
  query,
});
const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});
const createMockNext = () => jest.fn();

const mockQuery = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

// Model mock for simulating DB interactions
const Model = {
  countDocuments: jest.fn().mockResolvedValue(100),
  find: jest.fn(() => mockQuery),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('handlerFactory.js CRUD handlers', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('should apply category filter when categoryId is provided', async () => {
      const req = createMockReq({ categoryId: '12345' });
      const res = createMockRes();

      await getAll(Model)(req, res); // Call the function with the mock req and res

      expect(Model.find).toHaveBeenCalledWith({ category: '12345' }); // Ensure the filter is applied
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return docs and apply pagination with skip and limit', async () => {
      const req = createMockReq({}, {}, { page: '2', limit: '10' });
      const res = createMockRes();

      await getAll(Model)(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getOne', () => {
    it('should return a doc if found', async () => {
      Model.findById.mockReturnValue({ id: 'testId', name: 'Test Doc' });
      const req = createMockReq({ id: 'testId' });
      const res = createMockRes();
      const next = createMockNext();

      await getOne(Model)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { doc: { id: 'testId', name: 'Test Doc' } },
      });
    });

    it('should call next with AppError if document not found', async () => {
      Model.findById.mockResolvedValue(null);
      const req = createMockReq({ id: 'testId' });
      const res = {};
      const next = createMockNext();

      await getOne(Model)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('createOne', () => {
    it('should create a document and return it', async () => {
      const mockDoc = { name: 'testName' };
      Model.create.mockResolvedValue(mockDoc);

      const req = createMockReq({}, { name: 'testName' });
      const res = createMockRes();
      const next = createMockNext();

      await createOne(Model)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { doc: mockDoc },
      });
    });

    it('should call next with error if creation fails', async () => {
      Model.create.mockRejectedValue(new Error('Creation failed'));

      const req = createMockReq({}, { name: 'testName' });
      const res = createMockRes();
      const next = createMockNext();

      await createOne(Model)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateOne', () => {
    it('should update a document and return it if found', async () => {
      const mockDoc = { id: 'testId', name: 'Updated Document' };
      Model.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const req = createMockReq({ id: 'testId' }, { name: 'Updated Document' });
      const res = createMockRes();
      const next = createMockNext();

      await updateOne(Model)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { doc: mockDoc },
      });
    });

    it('should call next with AppError if document to update is not found', async () => {
      Model.findByIdAndUpdate.mockResolvedValue(null);

      const req = createMockReq({ id: 'testId' }, { name: 'Updated Document' });
      const res = createMockRes();
      const next = createMockNext();

      await updateOne(Model)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a document and return 204 if found', async () => {
      Model.findByIdAndDelete.mockResolvedValue({ id: 'testId' });

      const req = createMockReq({ id: 'testId' });
      const res = createMockRes();
      const next = createMockNext();

      await deleteOne(Model)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: null });
    });

    it('should call next with AppError if document to delete is not found', async () => {
      Model.findByIdAndDelete.mockResolvedValue(null);

      const req = createMockReq({ id: 'testId' });
      const res = createMockRes();
      const next = createMockNext();

      await deleteOne(Model)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });
});
