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
  beforeEach,
  afterEach,
} from '@jest/globals';
import { mongoConnect, mongoDisconnect } from '../../config/db.js';

beforeAll(async () => await mongoConnect());
afterAll(async () => await mongoDisconnect());
afterEach(async () => await User.deleteMany({}));

const newAdminData = {
  name: 'admin',
  email: 'admin@gmail.com',
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'admin',
};

const adminLogin = {
  email: 'admin@gmail.com',
  password: 'password123',
};

const newUserData = {
  name: 'user',
  email: 'user@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
};

const userLogin = {
  email: 'user@example.com',
  password: 'password123',
};

const updatedUserInfo = {
  name: 'updated',
  email: 'updated@example.com',
};

const newPasswordData = {
  currentPassword: 'password123',
  password: 'password1234',
  passwordConfirm: 'password1234',
};

describe('User tests for admin roles', () => {
  let adminToken;

  beforeEach(async () => {
    await User.create(newAdminData);
    const res = await request(app).post('/api/v1/auth/login').send(adminLogin);
    adminToken = res.body.token;
  });

  describe('GET /api/v1/users', () => {
    it('should return all users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.doc)).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send(newUserData)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.doc).toHaveProperty('_id');
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user data by id', async () => {
      const createdUser = await request(app)
        .post('/api/v1/users')
        .send(newUserData)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .patch(`/api/v1/users/${createdUser.body.data.doc._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedUserInfo);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.updatedUser.name).toBe(updatedUserInfo.name);
      expect(res.body.data.updatedUser.email).toBe(updatedUserInfo.email);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user by id', async () => {
      const createdUser = await request(app)
        .post('/api/v1/users')
        .send(newUserData)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app)
        .delete(`/api/v1/users/${createdUser.body.data.doc._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });
});

describe('User tests for user roles', () => {
  let userToken;

  beforeEach(async () => {
    await User.create(newUserData);
    const res = await request(app).post('/api/v1/auth/login').send(userLogin);
    userToken = res.body.token;
  });

  describe('GET /api/v1/users/getMe', () => {
    it('should return user data', async () => {
      const res = await request(app)
        .get('/api/v1/users/getMe')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.doc.email).toBe(userLogin.email);
    });
  });

  describe('PATCH /api/v1/users/updateMe', () => {
    it('should update user data', async () => {
      const res = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedUserInfo);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.name).toBe(updatedUserInfo.name);
      expect(res.body.data.user.email).toBe(updatedUserInfo.email);
    });
  });

  describe('PATCH /api/v1/users/updateMyPassword', () => {
    it('should allow a user to update their password', async () => {
      const res = await request(app)
        .patch('/api/v1/users/updateMyPassword')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newPasswordData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('DELETE /api/v1/users/deleteMe', () => {
    it('should allow a user to deactivate their own account', async () => {
      const res = await request(app)
        .delete('/api/v1/users/deleteMe')
        .set('Authorization', `Bearer ${userToken}`); // Use a valid user token here

      expect(res.statusCode).toBe(204);
    });
  });
});
