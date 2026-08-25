const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

// Joi Schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('Admin', 'Manager', 'Driver').default('Admin'),
  organization_name: Joi.string().required().min(2),
  organization_code: Joi.string().required().alphanum().min(3).max(20).uppercase(),
  employee_id: Joi.string().optional().allow('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

async function register(req, res, next) {
  try {
    const { name, email, password, role, organization_name, organization_code, employee_id } = req.body;

    // Check if email already exists
    const existingUser = await db('users').where('email', email.toLowerCase()).first();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    // Find or create Organization
    let org = await db('organizations').where('code', organization_code).first();
    if (!org) {
      const [orgId] = await db('organizations').insert({
        name: organization_name,
        code: organization_code
      });
      org = await db('organizations').where('id', orgId).first();
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const [userId] = await db('users').insert({
      organization_id: org.id,
      name,
      email: email.toLowerCase(),
      password_hash,
      role: role || 'Admin',
      employee_id: employee_id || `EMP-${Date.now().toString().slice(-5)}`
    });

    const newUser = await db('users').where('id', userId).first();
    delete newUser.password_hash;

    // If role is Driver, automatically create a driver record
    if (newUser.role === 'Driver') {
      const existingDriver = await db('drivers').where({ email: newUser.email, organization_id: org.id }).first();
      if (!existingDriver) {
        await db('drivers').insert({
          organization_id: org.id,
          user_id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          employee_id: newUser.employee_id,
          license_number: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'Active'
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organization_id: org.id,
        organization_name: org.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { ...newUser, organization_name: org.name, organization_code: org.code }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await db('users')
      .join('organizations', 'users.organization_id', 'organizations.id')
      .select('users.*', 'organizations.name as organization_name', 'organizations.code as organization_code')
      .where('users.email', email.toLowerCase())
      .first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    delete user.password_hash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: user.organization_name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await db('users')
      .join('organizations', 'users.organization_id', 'organizations.id')
      .select('users.id', 'users.organization_id', 'users.name', 'users.email', 'users.role', 'users.employee_id', 'users.created_at', 'organizations.name as organization_name', 'organizations.code as organization_code')
      .where('users.id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If driver role, include driver details
    if (user.role === 'Driver') {
      const driverRecord = await db('drivers').where('user_id', user.id).first();
      user.driverRecord = driverRecord || null;
    }

    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  registerSchema,
  loginSchema
};
