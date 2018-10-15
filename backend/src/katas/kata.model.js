'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Kata:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: A unique ID for the Coding Kata
 *           example: 7b52608f-897b-41d4-8599-fef76dcaecf1
 *         name:
 *           type: string
 *           description: The name of the Coding Kata
 *           example: "The Roman Numeral Kata"
 *         description:
 *           type: string
 *           description: The full description and/or instructions for the Coding Kata
 *           example: |
 *             The objective of this kata is to create a function which takes
 *             in an **Arabic** numeral such as `1,2,3,4,5,6,7,8,9,10` and convert
 *             it into a **Roman** numeral such as `I, II, III, IV, V, VI, VII, VIII, IX, X`
 *             Bonus points for correctly handling 50 (`L`), 100 (`C`), 500 (`D`),
 *             and 1000 (`M`).
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The Date the Coding Kata was added to the registry
 *           example: 2018-08-21T10:40:52Z
 */

const schema = mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: true,
  },
  description: {
    type: String,
    unique: false,
    required: true,
  },
  addedById: {
    type: String,
    unique: false,
    required: true,
  },
  addedByName: {
    type: String,
    unique: false,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});
schema.plugin(mongoosePaginate);

module.exports = {
  getModel() {
    return mongoose.model('Kata', schema);
  },
};
