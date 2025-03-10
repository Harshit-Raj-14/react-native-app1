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
router.post('/users', async (req: Request, res: Response) => {
    try {
        const newUser = await db.insert(users).values(req.body).returning();
        res.status(201).json(newUser);
    } catch (err) {
        handleQueryError(err, res);
    }
});

// GET: Retrieve user details by userId  
router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await db.select().from(users).where(eq(users.id, userId));

        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }

        res.json(user[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Retrieve userId by userId
router.get('/users/:username/user-id', async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        // Fetch user ID by username
        const user = await db.select({ id: users.id }).from(users).where(eq(users.username, username));

        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ userId: user[0].id });

    } catch (err) {
        console.error('Error fetching user ID:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// GET: Retrieve user wallet public address by userId
router.get('/users/:id/user-public-address', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
        }

        // Check if the user exists
        const user = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }

        // Fetch wallet details using the user's ID
        const wallet = await db
            .select({ public_address: wallets.public_address })
            .from(wallets)
            .where(eq(wallets.user_id, userId));

        if (wallet.length === 0) {
            res.status(404).json({ error: 'Wallet not found for this user' });
        }

        res.status(200).json({ public_address: wallet[0].public_address });

    } catch (err) {
        console.error('Error fetching public address:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// GET: Retrieve all friends of a user by userId => put the imageurl and username -> introduce the new chat-feature like whatsapp where you type @ and you get all the list of your friends, and you can choose one
router.get('/users/:id/friends', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
        }

        // Check if the user exists
        const user = await db.select().from(users).where(eq(users.id, userId));
        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
        }

        // Fetch the user's friends
        const userFriends = await db
            .select({
                friend_id: friends.friend_id,
                friend_username: users.username,
                friend_profile_image: users.profile_image,
                added_at: friends.created_at
            })
            .from(friends)
            .innerJoin(users, eq(friends.friend_id, users.id))
            .where(eq(friends.user_id, userId));

        res.status(200).json(userFriends);

    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// GET: Retrieve the receiver's public address after validating friendship
router.get('/users/:senderId/friends/:receiverUsername/public-address', async (req: Request, res: Response) => {
    try {
        const senderId = parseInt(req.params.senderId);
        const receiverUsername = req.params.receiverUsername;

        if (isNaN(senderId)) {
            res.status(400).json({ error: 'Invalid senderId' });
        }

        if (!receiverUsername) {
            res.status(400).json({ error: 'Receiver username is required' });
        }

        // Fetch receiver's user ID from username
        const receiver = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, receiverUsername));

        if (!receiver.length) {
            res.status(404).json({ error: 'Receiver not found' });
        }

        const receiverId = receiver[0].id;

        // Check if the receiver is actually a friend of the sender
        const friendship = await db
            .select()
            .from(friends)
            .where(and(eq(friends.user_id, senderId), eq(friends.friend_id, receiverId)));

        if (!friendship.length) {
            res.status(404).json({ error: 'Friendship not found' });
        }

        // Fetch the receiver's wallet public address
        const receiverWallet = await db
            .select({ publicAddress: wallets.public_address })
            .from(wallets)
            .where(eq(wallets.user_id, receiverId));

        if (!receiverWallet.length) {
            res.status(404).json({ error: 'Receiver wallet not found' });
        }

        // Return the receiver's public address
        res.json({ publicAddress: receiverWallet[0].publicAddress });

    } catch (error) {
        console.error('Error fetching public address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// POST: Add a friend for the current user using userId
router.post('/add-friend', async (req: Request, res: Response) => {
    const { userId, friendId } = req.body;

    try {
        // Validate input
        if (!userId || !friendId || isNaN(userId) || isNaN(friendId)) {
            res.status(400).json({ error: 'Invalid user ID or friend ID' });
        }

        // Check if both users exist
        const user = await db.select().from(users).where(eq(users.id, userId));
        const friend = await db.select().from(users).where(eq(users.id, friendId));

        if (user.length === 0 || friend.length === 0) {
            res.status(404).json({ error: 'User or Friend not found' });
        }

        // Check if friendship already exists
        const existingFriendship = await db
            .select()
            .from(friends)
            .where(and(eq(friends.user_id, userId), eq(friends.friend_id, friendId)));

        if (existingFriendship.length > 0) {
            res.status(409).json({ error: 'Friendship already exists' });
        }

        // Add the friend relationship
        await db.insert(friends).values({ user_id: userId, friend_id: friendId });

        res.status(201).json({ message: 'Friend added successfully' });

    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;
