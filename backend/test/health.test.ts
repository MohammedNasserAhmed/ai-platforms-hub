import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('health endpoint', () => {
  it('returns ok true', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
