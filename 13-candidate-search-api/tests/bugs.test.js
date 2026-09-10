const request = require('supertest');
const app = require('../server');

describe('Phase 2: Proof-of-Defect Automated Tests', () => {

  // 1. Search must be case-insensitive
  it('should perform case-insensitive candidate search', async () => {
    const lower = await request(app)
      .get('/api/candidates?q=rohan&pageSize=50');

    const upper = await request(app)
      .get('/api/candidates?q=ROHAN&pageSize=50');

    expect(lower.status).toBe(200);
    expect(upper.status).toBe(200);

    const lowerIds = lower.body.data.map(c => c.id).sort();
    const upperIds = upper.body.data.map(c => c.id).sort();

    expect(upperIds).toEqual(lowerIds);
  });


  // 2. Non-numeric pageSize must not break the API
  it('should handle non-numeric pageSize safely', async () => {
    const res = await request(app)
      .get('/api/candidates?pageSize=abc');

    expect(res.status).toBe(200);

    expect(typeof res.body.pageSize).toBe('number');
    expect(Number.isNaN(res.body.pageSize)).toBe(false);
    expect(res.body.pageSize).toBeGreaterThan(0);
    expect(res.body.pageSize).toBeLessThanOrEqual(50);
  });


  // 3. pageSize must be capped at 50
  it('should clamp pageSize to a maximum of 50', async () => {
    const res = await request(app)
      .get('/api/candidates?pageSize=100');

    expect(res.status).toBe(200);

    expect(res.body.pageSize).toBe(50);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });


  // 4. total must represent the filtered result count
  it('should return total for the current search filter', async () => {
    const res = await request(app)
      .get('/api/candidates?q=rohan&page=1&pageSize=50');

    expect(res.status).toBe(200);

    expect(res.body.total).toBeGreaterThanOrEqual(
      res.body.data.length
    );

    expect(res.body.total).toBeLessThanOrEqual(50);
  });


  // 5. totalPages must equal ceil(total / pageSize)
  it('should calculate totalPages correctly', async () => {
    const res = await request(app)
      .get('/api/candidates?q=rohan&pageSize=10');

    expect(res.status).toBe(200);

    const expectedTotalPages =
      Math.ceil(res.body.total / res.body.pageSize);

    expect(res.body.totalPages).toBe(expectedTotalPages);
  });


  // 6. hasNext must correctly indicate whether another page exists
  it('should calculate hasNext correctly', async () => {
    const res = await request(app)
      .get('/api/candidates?page=1&pageSize=10');

    expect(res.status).toBe(200);

    const expectedHasNext =
      res.body.page < res.body.totalPages;

    expect(res.body.hasNext).toBe(expectedHasNext);
  });


  // 7. Non-existing candidate ID must return 404
  it('should return 404 for a non-existing candidate', async () => {
    const res = await request(app)
      .get('/api/candidates/999999999');

    expect(res.status).toBe(404);
  });


  // 8. Candidates must not be duplicated between pages
  it('should not duplicate candidates between page 1 and page 2', async () => {
    const page1 = await request(app)
      .get('/api/candidates?page=1&pageSize=10');

    const page2 = await request(app)
      .get('/api/candidates?page=2&pageSize=10');

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);

    const ids1 = page1.body.data.map(c => c.id);
    const ids2 = page2.body.data.map(c => c.id);

    const duplicates = ids1.filter(id => ids2.includes(id));

    expect(duplicates).toHaveLength(0);
  });


  // 9. Name ascending sort
  it('should sort candidates by name in ascending order', async () => {
    const res = await request(app)
      .get('/api/candidates?sort=name:asc&pageSize=50');

    expect(res.status).toBe(200);

    const names = res.body.data.map(c => c.name);

    for (let i = 1; i < names.length; i++) {
      expect(
        names[i - 1].localeCompare(names[i])
      ).toBeLessThanOrEqual(0);
    }
  });


  // 10. Name descending sort
  it('should sort candidates by name in descending order', async () => {
    const res = await request(app)
      .get('/api/candidates?sort=name:desc&pageSize=50');

    expect(res.status).toBe(200);

    const names = res.body.data.map(c => c.name);

    for (let i = 1; i < names.length; i++) {
      expect(
        names[i - 1].localeCompare(names[i])
      ).toBeGreaterThanOrEqual(0);
    }
  });


  // 11. Multi-column sorting
  it('should apply status as primary sort and name as tie-breaker', async () => {
    const res = await request(app)
      .get('/api/candidates?sort=status:asc,name:desc&pageSize=50');

    expect(res.status).toBe(200);

    const data = res.body.data;

    for (let i = 1; i < data.length; i++) {
      const previous = data[i - 1];
      const current = data[i];

      // Primary sort: status ascending
      if (previous.status !== current.status) {
        expect(
          previous.status.localeCompare(current.status)
        ).toBeLessThanOrEqual(0);
      }

      // Tie-breaker: name descending
      else {
        expect(
          previous.name.localeCompare(current.name)
        ).toBeGreaterThanOrEqual(0);
      }
    }
  });

});