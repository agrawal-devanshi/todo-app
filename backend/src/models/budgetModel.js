const supabase = require('../config/supabase');

/**
 * Budget Model - handles database operations on `budgets` table
 */
class BudgetModel {
  /**
   * Find all budgets for a given user, month, and year
   */
  static async findByUserMonthYear(user_id, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user_id)
      .eq('month', parseInt(month, 10))
      .eq('year', parseInt(year, 10));

    if (error) {
      throw new Error(`Failed to fetch budgets: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Find a specific category budget for a user in month/year
   */
  static async findByCategoryMonthYear(user_id, category, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user_id)
      .eq('category', category)
      .eq('month', parseInt(month, 10))
      .eq('year', parseInt(year, 10))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[BudgetModel.findByCategoryMonthYear] error:', error);
    }
    return data || null;
  }

  /**
   * Create or update budget
   */
  static async upsertBudget({ user_id, category = 'Overall', amount, month, year }) {
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const numAmount = Number(amount);

    // Check if budget exists for this combination
    const existing = await this.findByCategoryMonthYear(user_id, category, parsedMonth, parsedYear);

    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ amount: numAmount })
        .eq('id', existing.id)
        .eq('user_id', user_id)
        .select('*')
        .single();

      if (error) throw new Error(`Failed to update budget: ${error.message}`);
      return data;
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id,
          category,
          amount: numAmount,
          month: parsedMonth,
          year: parsedYear,
        })
        .select('*')
        .single();

      if (error) throw new Error(`Failed to create budget: ${error.message}`);
      return data;
    }
  }

  /**
   * Delete a budget
   */
  static async deleteBudget(id, user_id) {
    const { data, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`);
    }
    return true;
  }
}

module.exports = BudgetModel;
