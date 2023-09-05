import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({path:'../../.env'});

console.log(process.env.DatabasePassword);

// export const sequelize  = new Sequelize(process.env.Database, process.env.DatabaseUserName,process.env.DatabasePassword, {
    
//     host: process.env.DatabaseHost,
//     port: process.env.DatabasePort,
//     dialect: 'postgres'
// });

export const sequelize = new Sequelize('postgres', 'postgres', 'fahd12345', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
});

console.log(process.env.DatabasePassword);
export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Connection Successful");
    } catch (error) {
        console.error("Unable to connect to database: ", error);
    }
}


