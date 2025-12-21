const PersonalTransaction = require('../models/personalTransactionModel');
const User = require('../models/userModel');

// @desc    Get all personal transactions
// @route   GET /api/personal
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await PersonalTransaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add personal transaction
// @route   POST /api/personal
// @access  Private
const addTransaction = async (req, res) => {
    const { type, amount, category, description, date } = req.body;

    try {
        const transaction = await PersonalTransaction.create({
            user: req.user.id,
            type,
            amount: Number(amount),
            category,
            description,
            date: date || Date.now(),
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/personal/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await PersonalTransaction.findById(req.user.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await transaction.deleteOne();
        res.json({ message: 'Removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction
};
