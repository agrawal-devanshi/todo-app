const supabase = require('../config/supabase');

/**
 * User Model - handles database operations on `users` table
 */
class UserModel {
  /**
   * Find a user by email
   * @param {string} email
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[UserModel.findByEmail] error:', error);
    }
    return data || null;
  }

  /**
   * Find a user by ID
   * @param {string} id
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[UserModel.findById] error:', error);
    }
    return data || null;
  }

  /**
   * Find user with password hash by ID (for password verification)
   * @param {string} id
   */
  static async findByIdWithPassword(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[UserModel.findByIdWithPassword] error:', error);
    }
    return data || null;
  }

  /**
   * Create a new user
   * @param {object} userData
   */
  static async create({ name, email, password_hash }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
      })
      .select('id, name, email, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data;
  }

  /**
   * Update user profile information
   * @param {string} id
   * @param {object} updateData
   */
  static async updateProfile(id, { name }) {
    const { data, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', id)
      .select('id, name, email, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    return data;
  }

  /**
   * Update user password hash
   * @param {string} id
   * @param {string} password_hash
   */
  static async updatePassword(id, password_hash) {
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', id)
      .select('id, name, email')
      .single();

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
    return data;
  }
}

module.exports = UserModel;
