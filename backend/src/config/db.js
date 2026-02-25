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
        console.log(`Database Connected: ${process.env.NODE_ENV === 'test' ? 'SQLite Memory' : 'PostgreSQL'}`);
        // Sync models
        await sequelize.sync();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
