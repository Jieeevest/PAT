const dotenv = require("dotenv");
dotenv.config();

module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "postgres",
		define: {
			freezeTableName: true,
		},
		dialectOptions: {
			useUTC: false,
		},
		timezone: "+07:00",
		pool: {
			max: parseInt(process.env.DB_POOL_MAX || 300),
			acquire: 30000,
			idle: 10000
		}
	},
	test: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "postgres",
		define: {
			freezeTableName: true,
		},
		dialectOptions: {
			useUTC: false,
		},
		timezone: "+07:00",
		pool: {
			max: parseInt(process.env.DB_POOL_MAX || 300),
			acquire: 30000,
			idle: 10000
		}
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "postgres",
		define: {
			freezeTableName: true,
		},
		dialectOptions: {
			useUTC: false,
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
		timezone: "+07:00",
		pool: {
			max: parseInt(process.env.DB_POOL_MAX || 300),
			acquire: 30000,
			idle: 10000
		}
	},
};
