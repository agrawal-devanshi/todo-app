const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

/**
 * Auth Controller - handles user registration, login, and profile
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Hash password using bcrypt (12 salt rounds per requirement)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await UserModel.create({
        name,
        email,
        password_hash: hashedPassword,
      });

      // Generate JWT
      const token = generateToken(newUser.id);

      // Sanitize user object (never return password_hash)
      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
      };

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to TeenSpend.',
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email with password hash
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Generate JWT
      const token = generateToken(user.id);

      // Sanitize user object
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      };

      res.status(200).json({
        success: true,
        message: 'Logged in successfully! Welcome back.',
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty.',
        });
      }

      let updatedUser = await UserModel.updateProfile(req.userId, { name });

      // If user wants to change password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password.',
          });
        }

        const userWithPass = await UserModel.findByIdWithPassword(req.userId);
        const isMatch = await bcrypt.compare(currentPassword, userWithPass.password_hash);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password does not match.',
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long.',
          });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await UserModel.updatePassword(req.userId, newHash);
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
