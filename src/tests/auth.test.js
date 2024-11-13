import request from 'supertest';
import app from '../app.js';
import { User } from '../models/user.model.js';
// eslint-disable-next-line prettier/prettier
import {
  describe,
  beforeAll,
  afterAll,
  it,
  expect,
  afterEach,
} from '@jest/globals';
import { mongoConnect, mongoDisconnect } from '../../config/db.js';

beforeAll(async () => await mongoConnect());
afterAll(async () => await mongoDisconnect());
afterEach(async () => await User.deleteMany({}));

const UserSignupData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
};

const UserLoginData = {
  email: 'test@example.com',
  password: 'password123',
};

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(UserSignupData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(UserSignupData.email);
    });

    it('should return error if user already exists', async () => {
      await User.create(UserSignupData);

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(UserSignupData);

      expect(res.statusCode).toBe(400);
    });

    it('should return error if password confirmation does not match', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...UserSignupData, passwordConfirm: 'wrongPassword' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user and return a token', async () => {
      await User.create(UserSignupData);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(UserLoginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(UserLoginData.email);
    });

    it('should return an error if no data is provided', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Token Validation', () => {
    it('should return a valid JWT token on successful login', async () => {
      await User.create(UserSignupData);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(UserLoginData);

      expect(res.statusCode).toBe(200);
      const tokenPattern =
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
      expect(res.body.token).toMatch(tokenPattern);
    });
  });
});
