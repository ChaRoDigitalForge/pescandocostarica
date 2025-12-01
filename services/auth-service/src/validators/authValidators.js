import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required().messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'any.required': 'Phone number is required'
  }),
  role: Joi.string().valid('cliente', 'capitan').default('cliente'),
  license_number: Joi.string().optional().allow(null, ''),
  years_of_experience: Joi.number().integer().min(0).optional().allow(null),
  specializations: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(null)
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters long',
    'any.required': 'New password is required'
  })
});
