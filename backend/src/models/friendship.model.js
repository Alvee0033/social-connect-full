const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    requesterId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    addresseeId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['requesterId', 'addresseeId'],
        },
    ],
});

module.exports = Friendship;
