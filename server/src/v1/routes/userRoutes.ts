import express, { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, wallets, friends, referrals, feedbacks } from '../../db/schema';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}`, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

const userController = require("../controllers/userController");

// Error handler for database queries
const handleQueryError = (err: any, res: Response) => {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'An error occurred while executing the query.' });
};

// GET : Retrieve all users
// router.get("/", userController.getAllUsers);

// GET : Retrieve user details from user_id
router.get("/:userId", userController.getUser);

// GET : Retrieve user details from 
router.get("/:userId", userController.getUser);

// POST : Add a new user
router.post("/", userController.createNewUser);

//  PATCH : Update a user
// router.patch("/:workoutId", userController.updateUser);

// DELETE : Delete a user
// router.delete("/:workoutId", userController.deleteUser);


export default router;