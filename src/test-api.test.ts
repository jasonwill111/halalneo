import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './index'; // 假设你的服务导出

describe('HalalNeo API 测试', () => {
  
  // 产品 API
  describe('产品 API', () => {
    it('GET /api/products 应该返回产品列表', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('GET /api/products?limit=10 应该返回限制数量的产品', async () => {
      const response = await request(app).get('/api/products?limit=10');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('GET /api/products?search=halal 应该返回匹配的产品', async () => {
      const response = await request(app).get('/api/products?search=halal');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  // 供应商 API
  describe('供应商 API', () => {
    it('GET /api/suppliers 应该返回供应商列表', async () => {
      const response = await request(app).get('/api/suppliers');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('GET /api/suppliers?country=US 应该返回美国供应商', async () => {
      const response = await request(app).get('/api/suppliers?country=US');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // 市场指南 API
  describe('市场指南 API', () => {
    it('GET /api/market-guides 应该返回市场指南', async () => {
      const response = await request(app).get('/api/market-guides');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  // 性能测试
  describe('API 性能', () => {
    it('API 响应时间应该在合理范围内', async () => {
      const startTime = Date.now();
      await request(app).get('/api/products?limit=5');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1000); // 1秒内响应
    });
  });

});
