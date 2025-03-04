import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
const router = express.Router();
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, friends, referrals, feedbacks } from './db/schema';

const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}`, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

// Error handler for database queries
const handleQueryError = (err: any, res: Response) => {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'An error occurred while executing the query.' });
};

// POST: Add a new user
router.post('/users', async (req: Request, res: Response) => {
    try {
        const newUser = await db.insert(users).values(req.body).returning();
        res.status(201).json(newUser);
    } catch (err) {
        handleQueryError(err, res);
    }
});

// GET: Retrieve user details by username
router.get('/users/:username', async (req: Request, res: Response) => {
    try {
        const user = await db.select().from(users).where(eq(users.username, req.params.username));
        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }
        res.json(user[0]);
    } catch (err) {
        handleQueryError(err, res);
    }
});

// GET: Retrieve all friends of a user by username
router.get('/friends/:username', async (req: Request, res: Response) => {
    try {
        const user = await db.select().from(users).where(eq(users.username, req.params.username));
        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }
        const userId = user[0].id;
        const userFriends = await db.select().from(friends).where(eq(friends.user_id, userId));
        res.json(userFriends);
    } catch (err) {
        handleQueryError(err, res);
    }
});

// POST: Add a friend for the current user
router.post('/friends', async (req: Request, res: Response) => {
    const { username, friendUsername } = req.body;
    try {
        const user = await db.select().from(users).where(eq(users.username, username));
        const friend = await db.select().from(users).where(eq(users.username, friendUsername));
        if (user.length === 0 || friend.length === 0) {
            res.status(404).json({ error: 'User or Friend not found' });
        }
        await db.insert(friends).values({ user_id: user[0].id, friend_id: friend[0].id }).returning();
        res.status(201).json({ message: 'Friend added successfully' });
    } catch (err) {
        handleQueryError(err, res);
    }
});

export default router;
