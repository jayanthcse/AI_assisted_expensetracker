const Group = require('../models/groupModel');
const Expense = require('../models/expenseModel');
const User = require('../models/userModel');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { name, description, members } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please add a group name' });
    }

    // Add current user to members
    let groupMembers = [req.user.id];

    if (members && members.length > 0) {
        try {
            // Find users by email
            const users = await User.find({ email: { $in: members } });
            users.forEach((user) => {
                if (user.id !== req.user.id) {
                    groupMembers.push(user.id);
                }
            });
        } catch (error) {
            console.error(error);
            // Continue with found users or just creator
        }

    }

    // Initialize balances
    const balances = groupMembers.map((memberId) => ({
        user: memberId,
        balance: 0,
    }));

    const group = await Group.create({
        name,
        description,
        members: groupMembers,
        createdBy: req.user.id,
        balances,
    });

    res.status(201).json(group);
};

// @desc    Get user groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    const groups = await Group.find({ members: req.user.id })
        .populate('members', 'name email')
        .sort({ updatedAt: -1 });
    res.status(200).json(groups);
};

// @desc    Get group details including expenses
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res) => {
    const group = await Group.findById(req.params.id).populate('members', 'name email').populate('balances.user', 'name');

    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    if (!group.members.some((member) => member._id.toString() === req.user.id)) {
        return res.status(401).json({ message: 'Not authorized to view this group' });
    }

    const expenses = await Expense.find({ group: req.params.id })
        .populate('paidBy', 'name')
        .sort({ date: -1 });

    res.status(200).json({ group, expenses });
};

// @desc    Add expense to group
// @route   POST /api/groups/:id/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { description, amount, splits, date } = req.body;
    // splits: [{ user: userId, amount: num }]

    if (!description || !amount || !splits) {
        return res.status(400).json({ message: 'Please provide all expense details' });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    // Verify total split amount matches total amount (approx)
    const totalSplit = splits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    if (Math.abs(totalSplit - Number(amount)) > 0.1) { // Allowing small float error
        return res.status(400).json({ message: 'Split amounts do not match total amount' });
    }

    // Create expense
    const expense = await Expense.create({
        description,
        amount,
        group: req.params.id,
        paidBy: req.user.id,
        splits,
        date: date || Date.now(),
    });

    // Update Group Balances
    // Logic: 
    // Payer gets +amount (they paid)
    // Everyone gets -splitAmount (they consumed)
    // Net for Payer = +amount - theirSplit

    // Actually, let's track "Net Balance":
    // Positive = You are Owed
    // Negative = You Owe

    // Payer paid 'amount'. They are 'owed' this amount by the group (conceptually).
    // But they also 'consumed' their split.
    // So Payer Net Change = +amount - splitAmount
    // Other User Net Change = -splitAmount

    const balanceUpdates = {}; // Map userId -> change

    // Initialize with 0
    group.members.forEach(m => {
        balanceUpdates[m.toString()] = 0;
    });

    // Payer paid the full amount
    balanceUpdates[req.user.id] = Number(amount);

    // Subtract consumption
    splits.forEach(split => {
        balanceUpdates[split.user] = (balanceUpdates[split.user] || 0) - Number(split.amount);
    });

    // Apply to group balances
    group.balances = group.balances.map(b => {
        const change = balanceUpdates[b.user.toString()];
        if (change) {
            b.balance += change;
        }
        return b;
    });

    await group.save();

    res.status(201).json(expense);
};

// @desc    Settle up (simplified)
// @route   POST /api/groups/:id/settle
// @access  Private
// Ideally, settlements are transactions too. For now, we can just reset balances or create a "Settlement" expense.
// Let's implement fully later if needed, or just allow adding a payment expense.
// "Allow settlements that reduce balances but do not delete expense history"
// So a settlement is just an expense where A pays B.
// This can be handled by addExpense with a specific flag or just normal expense logic?
// Normal expense: A pays $100. Split: B owes $100.
// If A pays B $50 to settle?
// Description: "Payment from A to B". Amount: 50. PaidBy: A. Split: B consumes 50?
// If A pays B, A is Payer (+50). B is Consumer (-50)? 
// If A owed B 50 (A: -50, B: +50).
// Transaction: A pays 50.
// A change: +50 (paid) - 0 (consumed?) = +50. New Balance: 0.
// B change: -50 (consumer)??
// Wait. Settlement is: A gives money to B.
// Expense logic: Someone pays external entity.
// Settlement logic: Internal transfer.
// If A pays B $50.
// A loses $50 cash. B gains $50 cash.
// In system: A's debt decreases (+50). B's credit decreases (-50).
// So using the same logic:
// PaidBy: A (Amount 50).
// Splits: B (Amount 50).
// A change: +50 - 0 = +50.
// B change: -50.
// Balances update: A (-50 -> 0). B (+50 -> 0).
// YES! The same logic works for settlements if we treat it as "A paid $50 for B's benefit (B gets the cash)".
// So `addExpense` works for settlements too.

module.exports = {
    createGroup,
    getGroups,
    getGroup,
    addExpense,
};
