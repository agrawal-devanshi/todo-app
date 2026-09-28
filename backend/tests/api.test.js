const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

describe('TeenSpend API Test Suite', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let user1ExpenseId = '';

  const testUser1 = {
    name: 'Aarav Patel',
    email: `aarav_${Date.now()}@example.com`,
    password: 'password123',
  };

  const testUser2 = {
    name: 'Diya Sharma',
    email: `diya_${Date.now()}@example.com`,
    password: 'securePassword99',
  };

  test('1. Health Check GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('2. Registration creates user and returns JWT without password_hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser1);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token, 'Token must be returned');
    assert.ok(res.body.data.user.id, 'User ID must be returned');
    assert.strictEqual(res.body.data.user.password_hash, undefined, 'password_hash must never be leaked');

    user1Token = res.body.data.token;
    user1Id = res.body.data.user.id;
  });

  test('3. Registration rejects duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser1);

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  test('4. Login verifies bcrypt password and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser1.email,
        password: testUser1.password,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.id, user1Id);
  });

  test('5. Login rejects invalid password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser1.email,
        password: 'wrong_password_attempt',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('6. Protected route GET /api/auth/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('7. Protected route GET /api/auth/me accepts valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, testUser1.email);
  });

  test('8. Create Expense POST /api/expenses', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 350.5,
        category: 'Food',
        description: 'Tiffin snacks & boba',
        expense_date: '2026-09-28',
        payment_method: 'UPI',
        is_necessary: false,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.expense.amount, 350.5);
    assert.strictEqual(res.body.data.expense.category, 'Food');

    user1ExpenseId = res.body.data.expense.id;
  });

  test('9. Read Expenses GET /api/expenses with filters and search', async () => {
    const res = await request(app)
      .get('/api/expenses?category=Food&search=snacks')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.expenses));
    assert.ok(res.body.data.expenses.length >= 1);
  });

  test('10. Update Expense PUT /api/expenses/:id', async () => {
    const res = await request(app)
      .put(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 400.0,
        category: 'Food',
        description: 'Updated snacks bill',
        expense_date: '2026-09-28',
        payment_method: 'UPI',
        is_necessary: true,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.expense.amount, 400.0);
    assert.strictEqual(res.body.data.expense.description, 'Updated snacks bill');
  });

  test('11. SECURITY ISOLATION: User B cannot view, edit, or delete User A expense', async () => {
    // Register User B
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser2);

    assert.strictEqual(regRes.status, 201);
    user2Token = regRes.body.data.token;
    user2Id = regRes.body.data.user.id;

    // User B attempts to GET User A's expense
    const getRes = await request(app)
      .get(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.strictEqual(getRes.status, 404, 'Must return 404 when unauthorized user accesses another user expense');

    // User B attempts to UPDATE User A's expense
    const updateRes = await request(app)
      .put(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        amount: 999999,
        category: 'Shopping',
        description: 'Hacked!',
        expense_date: '2026-09-28',
        payment_method: 'Cash',
      });

    assert.strictEqual(updateRes.status, 404);

    // User B attempts to DELETE User A's expense
    const deleteRes = await request(app)
      .delete(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.strictEqual(deleteRes.status, 404);

    // Verify User A expense was NOT altered
    const verifyRes = await request(app)
      .get(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.body.data.expense.amount, 400.0);
  });

  test('12. Budget Creation and Tracking', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'Overall',
        amount: 5000,
        month: 9,
        year: 2026,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.budget.amount, 5000);

    const summaryRes = await request(app)
      .get('/api/budgets/summary?month=9&year=2026')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(summaryRes.status, 200);
    assert.ok(summaryRes.body.data.comparison.length >= 1);
  });

  test('13. Analytics APIs and Calculations', async () => {
    const summaryRes = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(summaryRes.status, 200);
    assert.ok(summaryRes.body.data.totalSpentThisMonth >= 400);

    const catRes = await request(app)
      .get('/api/analytics/categories?month=9&year=2026')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(catRes.status, 200);
    assert.ok(Array.isArray(catRes.body.data.categories));

    const necRes = await request(app)
      .get('/api/analytics/necessary?month=9&year=2026')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(necRes.status, 200);
    assert.strictEqual(necRes.body.data.breakdown.length, 2);
  });

  test('14. Smart Recommendations API', async () => {
    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.recommendations));
    assert.ok(res.body.data.recommendations.length > 0);
  });

  test('15. Savings Goals, Progress, and Contribution', async () => {
    const createRes = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Noise Cancelling Headphones',
        target_amount: 8000,
        current_amount: 2500,
        target_date: '2026-12-31',
      });

    assert.strictEqual(createRes.status, 201);
    const goalId = createRes.body.data.goal.id;

    // Quick add contribution
    const contribRes = await request(app)
      .post(`/api/savings-goals/${goalId}/contribute`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ amount: 1500 });

    assert.strictEqual(contribRes.status, 200);
    assert.strictEqual(contribRes.body.data.goal.current_amount, 4000);

    // Fetch goals and check calculated fields
    const getRes = await request(app)
      .get('/api/savings-goals')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(getRes.status, 200);
    const goal = getRes.body.data.goals.find((g) => g.id === goalId);
    assert.ok(goal);
    assert.strictEqual(goal.remaining_amount, 4000);
    assert.strictEqual(goal.progress_percentage, 50);
    assert.ok(goal.days_remaining > 0);
    assert.ok(goal.required_weekly_saving > 0);
  });

  test('16. Delete Expense removes it for owner', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
