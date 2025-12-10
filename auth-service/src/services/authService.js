const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async register(userData) {
    try {
      const user = await userRepository.create(userData);
      const token = this.generateToken(user);
      
      return {
        user,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await userRepository.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    
    return {
      user: userRepository.sanitizeUser(user),
      token
    };
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return userRepository.sanitizeUser(user);
  }
}

module.exports = new AuthService();
