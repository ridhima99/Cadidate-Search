const request = require('supertest');
const app = require('../server');

describe('Phase 2: Proof-of-Defect Automated Tests', () => {

  it('fails if search is case-sensitive instead of case-insensitive', async () => {
    const res = await request(app).get('/api/candidates?q=AARAV');
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('fails if non-numeric page parameters break the API state', async () => {
    const res = await request(app).get('/api/candidates?page=abc');
    expect(res.status).toBe(200);
    expect(res.body.page).not.toBeNull();
  });

  it('fails if multi-column sorting tie-breakers are ignored', async () => {
    const res = await request(app).get('/api/candidates?sort=status:asc,name:desc');
    const verified = res.body.data.filter(c => c.status === 'VERIFIED');
    if (verified.length >= 2) {
      expect(verified[0].name > verified[1].name).toBe(true);
    }
  });

});