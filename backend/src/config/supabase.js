const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Detect if real Supabase credentials are provided
const isRealSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_URL.includes('mock-') &&
  SUPABASE_SERVICE_ROLE_KEY.length > 20 &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('mock-');

let supabase;

if (isRealSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Supabase] Successfully connected to live Supabase PostgreSQL instance.');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize live client, falling back to local memory store:', err.message);
    supabase = createLocalMockSupabase();
  }
} else {
  console.log('[Supabase] Running with smart local database engine (Supabase-compatible).');
  console.log('[Supabase] To connect to live cloud Supabase, update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.');
  supabase = createLocalMockSupabase();
}

/**
 * Local Supabase-compatible Mock Client
 * Implements the standard Supabase query builder interface for users, expenses, budgets, savings_goals
 */
function createLocalMockSupabase() {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');

  const dataDir = path.join(__dirname, '../../.data');
  const dataFile = path.join(dataDir, 'local_db.json');

  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (_) {}
  }

  let db = {
    users: [],
    expenses: [],
    budgets: [],
    savings_goals: [],
  };

  if (fs.existsSync(dataFile)) {
    try {
      const content = fs.readFileSync(dataFile, 'utf8');
      db = JSON.parse(content);
    } catch (e) {
      console.warn('[Supabase Mock] Could not load local_db.json, starting fresh');
    }
  }

  const saveDb = () => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
      console.error('[Supabase Mock] Error saving local DB:', err.message);
    }
  };

  class QueryBuilder {
    constructor(tableName) {
      this.tableName = tableName;
      this.filters = [];
      this.orders = [];
      this.limitCount = null;
      this.offsetCount = 0;
      this.isSingle = false;
      this.selectedColumns = '*';
      this.operation = 'select';
      this.insertData = null;
      this.updateData = null;
    }

    select(columns = '*') {
      this.selectedColumns = columns;
      return this;
    }

    insert(data) {
      this.operation = 'insert';
      this.insertData = Array.isArray(data) ? data : [data];
      return this;
    }

    update(data) {
      this.operation = 'update';
      this.updateData = data;
      return this;
    }

    delete() {
      this.operation = 'delete';
      return this;
    }

    eq(column, value) {
      this.filters.push((row) => String(row[column]) === String(value));
      return this;
    }

    neq(column, value) {
      this.filters.push((row) => String(row[column]) !== String(value));
      return this;
    }

    gte(column, value) {
      this.filters.push((row) => {
        if (!row[column]) return false;
        return new Date(row[column]) >= new Date(value) || row[column] >= value;
      });
      return this;
    }

    lte(column, value) {
      this.filters.push((row) => {
        if (!row[column]) return false;
        return new Date(row[column]) <= new Date(value) || row[column] <= value;
      });
      return this;
    }

    order(column, { ascending = true } = {}) {
      this.orders.push({ column, ascending });
      return this;
    }

    range(from, to) {
      this.offsetCount = from;
      this.limitCount = to - from + 1;
      return this;
    }

    limit(count) {
      this.limitCount = count;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    async execute() {
      if (!db[this.tableName]) {
        db[this.tableName] = [];
      }

      const table = db[this.tableName];

      if (this.operation === 'insert') {
        const createdRows = [];
        const now = new Date().toISOString();
        for (const item of this.insertData) {
          const newRow = {
            id: item.id || crypto.randomUUID(),
            ...item,
            created_at: item.created_at || now,
            updated_at: now,
          };
          table.push(newRow);
          createdRows.push(newRow);
        }
        saveDb();
        if (this.isSingle) {
          return { data: createdRows[0] || null, error: null };
        }
        return { data: createdRows, error: null };
      }

      if (this.operation === 'update') {
        let updatedRows = [];
        const now = new Date().toISOString();
        for (let i = 0; i < table.length; i++) {
          const row = table[i];
          const matches = this.filters.every((fn) => fn(row));
          if (matches) {
            table[i] = {
              ...row,
              ...this.updateData,
              updated_at: now,
            };
            updatedRows.push(table[i]);
          }
        }
        saveDb();
        if (this.isSingle) {
          return { data: updatedRows[0] || null, error: null };
        }
        return { data: updatedRows, error: null };
      }

      if (this.operation === 'delete') {
        const initialCount = table.length;
        const remaining = table.filter((row) => !this.filters.every((fn) => fn(row)));
        db[this.tableName] = remaining;
        saveDb();
        return { data: { count: initialCount - remaining.length }, error: null };
      }

      // SELECT Operation
      let result = table.filter((row) => this.filters.every((fn) => fn(row)));

      for (const order of this.orders) {
        result.sort((a, b) => {
          const valA = a[order.column];
          const valB = b[order.column];
          if (valA < valB) return order.ascending ? -1 : 1;
          if (valA > valB) return order.ascending ? 1 : -1;
          return 0;
        });
      }

      if (this.offsetCount || this.limitCount !== null) {
        const start = this.offsetCount || 0;
        const end = this.limitCount !== null ? start + this.limitCount : undefined;
        result = result.slice(start, end);
      }

      if (this.isSingle) {
        const item = result[0] || null;
        if (!item) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: item, error: null };
      }

      return { data: result, error: null };
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }
  }

  return {
    from: (tableName) => new QueryBuilder(tableName),
    _isMock: true,
  };
}

module.exports = supabase;
