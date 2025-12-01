import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import config from '../config/index.js';
import { ValidationError, UnauthorizedError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      throw new ValidationError('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role
    });

    logger.info(`New user registered: ${user.id} (${role})`);

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await User.update(user.id, { lastLogin: Date.now() });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`User logged in: ${user.id} (${user.role})`);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, settings } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = settings;

    const user = await User.update(req.user.id, updateData);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    logger.info(`User profile updated: ${user.id}`);

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current and new passwords are required');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.update(user.id, { passwordHash: newPasswordHash });

    logger.info(`Password changed for user: ${user.id}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);

    // Generate new access token
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role, email: decoded.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({ token: newToken });
  } catch (error) {
    next(new UnauthorizedError('Invalid refresh token'));
  }
};
