import { Application } from 'express';
import { default as request } from 'supertest';

import { buildApiServer } from '../helper';

describe('health.controller', () => {
  let app: Application;

  beforeEach(() => {
    const apiServer = buildApiServer();

    app = apiServer.getApp();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /health', () => {
    test('should return 200 and {status: "UP:}', async () => {
      await request(app).get('/health').expect(200).then( r => {
        expect(r.body).toStrictEqual( { status: 'UP' }) })
    });
  });
});
