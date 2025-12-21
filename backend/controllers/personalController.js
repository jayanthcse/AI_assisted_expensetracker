const PersonalTransaction = require('../models/personalTransactionModel');
const sendEmail = require('../utils/sendEmail');
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

        // Check budget limit if it's an expense
        if (type === 'expense') {
            const transactions = await PersonalTransaction.find({ user: req.user.id });
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

            if (totalIncome > 0 && totalExpense >= totalIncome * 0.8) {
                // Trigger 80% Alert
                const user = await User.findById(req.user.id);
                const percentage = ((totalExpense / totalIncome) * 100).toFixed(1);

                console.log(`Alert: Expenses at ${percentage}% of Income for user ${user.email}`);

                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    await sendEmail({
                        email: user.email,
                        subject: 'Budget Alert: 80% Threshold Reached',
                        message: `Warning: Your total expenses ($${totalExpense}) have reached ${percentage}% of your total income ($${totalIncome}). Please spend wisely!`,
                        html: `<h3>Budget Alert ⚠️</h3><p>Your total expenses (<b>$${totalExpense}</b>) have reached <b style="color:red;">${percentage}%</b> of your total income ($${totalIncome}).</p><p>Please check your dashboard for details.</p>`
                    });
                } else {
                    console.log('Skipping email: EMAIL_USER/PASS not set in .env');
                }
            }
        }

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
