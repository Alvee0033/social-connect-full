const Sequelize = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
    sequelize = new Sequelize('sqlite::memory:', {
        logging: false,
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false,
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        if (process.env.NODE_ENV !== 'test') {
            console.log('PostgreSQL Connected via Sequelize');
        }
        // Sync models
        await sequelize.sync();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
