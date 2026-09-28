const supabase = require('../config/supabase');

/**
 * Expense Model - handles database operations on `expenses` table
 */
class ExpenseModel {
  /**
   * Create a new expense
   */
  static async create({
    user_id,
    amount,
    category,
    description,
    expense_date,
    payment_method,
    is_necessary,
  }) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id,
        amount: Number(amount),
        category,
        description: description ? description.trim() : '',
        expense_date,
        payment_method: payment_method || 'UPI',
        is_necessary: is_necessary !== undefined ? Boolean(is_necessary) : true,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }
    return data;
  }

  /**
   * Find expense by ID and User ID (ensuring user isolation)
   */
  static async findByIdAndUser(id, user_id) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[ExpenseModel.findByIdAndUser] error:', error);
    }
    return data || null;
  }

  /**
   * Find all expenses for a user with flexible filtering, searching, and sorting
   */
  static async findAllByUser(
    user_id,
    {
      category,
      startDate,
      endDate,
      isNecessary,
      search,
      sortBy = 'expense_date',
      sortOrder = 'desc',
      limit,
      offset = 0,
    } = {}
  ) {
    let query = supabase.from('expenses').select('*').eq('user_id', user_id);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('expense_date', startDate);
    }

    if (endDate) {
      query = query.lte('expense_date', endDate);
    }

    if (isNecessary !== undefined && isNecessary !== '' && isNecessary !== 'all') {
      const boolVal = isNecessary === 'true' || isNecessary === true;
      query = query.eq('is_necessary', boolVal);
    }

    // Determine sorting
    const ascending = sortOrder.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    let results = data || [];

    // Search filter (client/in-memory or post-filter if text search)
    if (search && search.trim().length > 0) {
      const term = search.toLowerCase().trim();
      results = results.filter(
        (exp) =>
          (exp.description && exp.description.toLowerCase().includes(term)) ||
          (exp.category && exp.category.toLowerCase().includes(term)) ||
          (exp.payment_method && exp.payment_method.toLowerCase().includes(term))
      );
    }

    const totalCount = results.length;

    // Apply pagination if limit is specified
    if (limit && Number(limit) > 0) {
      const start = Number(offset) || 0;
      results = results.slice(start, start + Number(limit));
    }

    return {
      expenses: results,
      totalCount,
    };
  }

  /**
   * Update an expense belonging to a specific user
   */
  static async update(id, user_id, updateData) {
    const payload = {};
    if (updateData.amount !== undefined) payload.amount = Number(updateData.amount);
    if (updateData.category !== undefined) payload.category = updateData.category;
    if (updateData.description !== undefined) payload.description = updateData.description.trim();
    if (updateData.expense_date !== undefined) payload.expense_date = updateData.expense_date;
    if (updateData.payment_method !== undefined) payload.payment_method = updateData.payment_method;
    if (updateData.is_necessary !== undefined) payload.is_necessary = Boolean(updateData.is_necessary);

    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user_id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
    return data;
  }

  /**
   * Delete an expense belonging to a specific user
   */
  static async delete(id, user_id) {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
    return true;
  }

  /**
   * Get all expenses for a user within a date range
   */
  static async getExpensesByDateRange(user_id, startDate, endDate) {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user_id)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to query date range expenses: ${error.message}`);
    }
    return data || [];
  }
}

module.exports = ExpenseModel;
