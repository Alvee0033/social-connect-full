const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    messageType: {
        type: DataTypes.ENUM('text', 'image', 'file'),
        defaultValue: 'text',
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['senderId', 'receiverId'],
        },
        {
            fields: ['createdAt'],
        },
    ],
});

module.exports = Message;
