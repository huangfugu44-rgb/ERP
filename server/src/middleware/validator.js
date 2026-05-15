const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const schemas = {
  user: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email(),
    roleId: Joi.number().integer()
  }),

  product: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    category: Joi.string(),
    unit: Joi.string(),
    price: Joi.number().positive()
  }),

  order: Joi.object({
    customerId: Joi.number().integer().required(),
    items: Joi.array().items(Joi.object()).min(1).required(),
    totalAmount: Joi.number().positive()
  })
};

module.exports = { validate, schemas };
