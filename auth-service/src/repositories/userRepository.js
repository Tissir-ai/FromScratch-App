const bcrypt = require('bcryptjs');

// In-memory user storage (replace with database in production)
const users = new Map();

class UserRepository {
  async create(userData) {
    const { email, password, name } = userData;
    
    // Check if user already exists
    if (users.has(email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.set(email, user);
    return this.sanitizeUser(user);
  }

  async findByEmail(email) {
    return users.get(email);
  }

  async findById(id) {
    for (let user of users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    return Array.from(users.values()).map(user => this.sanitizeUser(user));
  }
}

module.exports = new UserRepository();
