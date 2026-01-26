const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    participant1Id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    participant2Id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    lastMessageId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['participant1Id', 'participant2Id'],
        },
    ],
});

module.exports = Conversation;
