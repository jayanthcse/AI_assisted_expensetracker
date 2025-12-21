const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a group name'],
        },
        description: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Simplified balance tracking: Map of userId -> balance (positive = owed to user, negative = user owes)
        // However, Mongoose maps are tricky. Let's use an array of objects.
        balances: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                balance: { type: Number, default: 0 }
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Group', groupSchema);
