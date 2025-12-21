const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
    {
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        // Array of users involved in this expense and how much they owe
        splits: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                amount: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Expense', expenseSchema);
