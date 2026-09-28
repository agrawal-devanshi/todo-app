const supabase = require('../config/supabase');

/**
 * Savings Goal Model - handles database operations on `savings_goals` table
 */
class SavingsModel {
  /**
   * Create a new savings goal
   */
  static async create({ user_id, name, target_amount, current_amount = 0, target_date }) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id,
        name: name.trim(),
        target_amount: Number(target_amount),
        current_amount: Number(current_amount) || 0,
        target_date,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create savings goal: ${error.message}`);
    }
    return data;
  }

  /**
   * Find all savings goals for a user
   */
  static async findAllByUser(user_id) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch savings goals: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Find savings goal by ID and User ID
   */
  static async findByIdAndUser(id, user_id) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[SavingsModel.findByIdAndUser] error:', error);
    }
    return data || null;
  }

  /**
   * Update savings goal
   */
  static async update(id, user_id, updateData) {
    const payload = {};
    if (updateData.name !== undefined) payload.name = updateData.name.trim();
    if (updateData.target_amount !== undefined) payload.target_amount = Number(updateData.target_amount);
    if (updateData.current_amount !== undefined) payload.current_amount = Number(updateData.current_amount);
    if (updateData.target_date !== undefined) payload.target_date = updateData.target_date;

    const { data, error } = await supabase
      .from('savings_goals')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user_id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update savings goal: ${error.message}`);
    }
    return data;
  }

  /**
   * Delete savings goal
   */
  static async delete(id, user_id) {
    const { data, error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(`Failed to delete savings goal: ${error.message}`);
    }
    return true;
  }
}

module.exports = SavingsModel;
