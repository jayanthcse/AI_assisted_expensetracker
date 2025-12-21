const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroup,
    addExpense,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id').get(protect, getGroup);
router.route('/:id/expenses').post(protect, addExpense);

module.exports = router;
