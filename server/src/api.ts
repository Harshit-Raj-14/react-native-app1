import express, { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, wallets, friends, referrals, feedbacks } from './db/schema';
import bcrypt from 'bcrypt';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}`, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

// Error handler for database queries
const handleQueryError = (err: any, res: Response) => {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'An error occurred while executing the query.' });
};


// POST: Create a new user
router.post('/users', async (req: Request, res: Response) => {
    try {
      const { email, username, password_hash } = req.body;
      
      // Check if email already exists
      const existingEmail = await db.select().from(users).where(eq(users.email, email));
      if (existingEmail.length > 0) {
        res.status(409).json({ error: 'Email already exists' });
      }
      
      // Check if username already exists
      const existingUsername = await db.select().from(users).where(eq(users.username, username));
      if (existingUsername.length > 0) {
        res.status(409).json({ error: 'Username already exists' });
      }
      
      // Hash password if provided
      let hashedPassword = password_hash;
      if (password_hash && !password_hash.startsWith('$2b$')) {
        // If it's not already hashed
        hashedPassword = await bcrypt.hash(password_hash, 10);
      }
      
      // Create new user
      const newUser = await db.insert(users).values({
        email,
        username,
        password_hash: hashedPassword || '', // Use empty string if not provided
        // Note: created_at will use the defaultNow() from the schema
      }).returning();
      
      // Return the user without password
      const { password_hash: _, ...userWithoutPassword } = newUser[0];
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleQueryError(err, res);
    }
  });

  
  // GET: Check if username exists
  router.get('/users/username/:username', async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const existingUser = await db.select({
        id: users.id,
        username: users.username
      }).from(users).where(eq(users.username, username));
      
      if (existingUser.length === 0) {
        res.status(404).json({ error: 'Username not found' });
      }
      
      res.status(200).json(existingUser[0]);
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


// POST: Add a new wallet for a user
router.post('/', async (req: Request, res: Response) => {
    try {
      const { user_id, wallet_address, public_address, wallet_type } = req.body;
      
      // Validate required fields
      if (!user_id || !wallet_address || !public_address || !wallet_type) {
        res.status(400).json({ error: 'Missing required wallet fields' });
      }
      
      // Check if the user exists
      const userExists = await db.select().from(users).where(eq(users.id, user_id));
      if (userExists.length === 0) {
        res.status(404).json({ error: 'User not found' });
      }
      
      // Check if wallet_address already exists
      const existingWalletAddress = await db.select().from(wallets).where(eq(wallets.wallet_address, wallet_address));
      if (existingWalletAddress.length > 0) {
        res.status(409).json({ error: 'Wallet address already exists' });
      }
      
      // Check if public_address already exists
      const existingPublicAddress = await db.select().from(wallets).where(eq(wallets.public_address, public_address));
      if (existingPublicAddress.length > 0) {
        res.status(409).json({ error: 'Public address already exists' });
      }
      
      // Insert new wallet record
      const newWallet = await db.insert(wallets).values({
        user_id,
        wallet_address,
        public_address,
        wallet_type
      }).returning();
      
      res.status(201).json(newWallet[0]);
    } catch (err) {
      handleQueryError(err, res);
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
router.get('/users/:senderId/friends/:receiverUsername/public-address', async (req: Request, res: Response): Promise<void> => {
    try {
        const senderId = parseInt(req.params.senderId);
        const receiverUsername = req.params.receiverUsername.toLowerCase();

        if (isNaN(senderId)) {
            res.status(400).json({ error: 'Invalid senderId' });
            return;
        }

        if (!receiverUsername) {
            res.status(400).json({ error: 'Receiver username is required' });
            return;
        }

        // Fetch receiver's user ID from username
        const receiver = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, receiverUsername));

        if (!receiver.length) {
            res.status(404).json({ error: 'Receiver not found' });
            return;
        }

        const receiverId = receiver[0].id;

        // Check if the receiver is actually a friend of the sender
        const friendship = await db
            .select()
            .from(friends)
            .where(and(eq(friends.user_id, senderId), eq(friends.friend_id, receiverId)));

        if (!friendship.length) {
            res.status(404).json({ error: 'Friendship not found' });
            return;
        }

        // Fetch the receiver's wallet public address
        const receiverWallet = await db
            .select({ publicAddress: wallets.public_address })
            .from(wallets)
            .where(eq(wallets.user_id, receiverId));

        if (!receiverWallet.length) {
            res.status(404).json({ error: 'Receiver wallet not found' });
            return;
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
