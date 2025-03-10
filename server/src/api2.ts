import express, { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, wallets, friends, referrals, feedbacks } from './db/schema';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}`, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

// Error handler for database queries
const handleQueryError = (err: any, res: Response) => {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'An error occurred while executing the query.' });
};

// POST: Add a new user
router.post('/add-user', async (req: Request, res: Response) => {
    try {
        const newUser = await db.insert(users).values(req.body).returning();
        res.status(201).json(newUser);
    } catch (err) {
        handleQueryError(err, res);
    }
});

// GET: Retrieve user details by username
router.get('/user/:username', async (req: Request, res: Response) => {
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

// GET: Retrieve user wallet public address by username
router.get('/user-public-address/:username', async (req: Request, res: Response) => {
    const { username } = req.params;
    try {
        // Fetch the user by username
        const user = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }
        // Fetch wallet details using the user's ID
        const wallet = await db.select({ public_address: wallets.public_address })
                               .from(wallets)
                               .where(eq(wallets.user_id, user[0].id));
        if (wallet.length === 0) {
            res.status(404).json({ error: 'Wallet not found for this user' });
        }
        res.status(200).json({ public_address: wallet[0].public_address });
    } catch (err) {
        console.error('Error fetching public address:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET: Retrieve all friends of a user by username
router.get('/get-friends/:username', async (req: Request, res: Response) => {
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


// GET: Retrieve the reciver's public address from username once validated he is a friend 
router.get('/get-friend-public-address-via-username', async (req: Request, res: Response) => {
    try {
        const senderUsername = req.query.senderUsername as string;
        const receiverUsername = req.query.receiverUsername as string;
        if (!senderUsername || !receiverUsername) {
            res.status(400).json({ error: 'Missing sender or receiver username' });
        }

        // Fetch sender details
        const sender = await db.select({ id: users.id }).from(users).where(eq(users.username, senderUsername));
        if (!sender.length) {
            res.status(404).json({ error: 'Sender not found' });
        }

        // Fetch receiver details including public address from wallets
        const receiver = await db
            .select({
                id: users.id,
                publicAddress: wallets.public_address,
            })
            .from(users)
            .innerJoin(wallets, eq(users.id, wallets.user_id)) // Join wallets table
            .where(eq(users.username, receiverUsername));

        if (!receiver.length) {
            res.status(404).json({ error: 'Receiver not found or wallet not linked' });
        }

        // Check if a friendship exists
        const friendship = await db.select().from(friends).where(and(eq(friends.user_id, sender[0].id), eq(friends.friend_id, receiver[0].id)));

        if (!friendship.length) {
            res.status(404).json({ error: 'Friendship not found' });
        }

        // Return receiver's public address
        res.json({ publicAddress: receiver[0].publicAddress });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// POST: Add a friend for the current user
router.post('/add-friend', async (req: Request, res: Response) => {
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
