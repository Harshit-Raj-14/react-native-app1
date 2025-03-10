# Sher Backend Server

## Installation Instructions

```sh
npm install
npm run dev  # Run the server
```

## Database Schema

- [Schema Link](https://dbdiagram.io/d/sher-native-app-67c1c868263d6cf9a0d1059b)

## API Testing

- [Postman Collection](https://sher-mobile.postman.co/workspace/sher-mobile-Workspace~45015c4f-a57e-4397-9790-8f37ca4ba8d5/collection/31964683-e18ba1f5-10cc-4fb0-992b-d6415ccec8c2?action=share&creator=31964683)

## Public Addresses

- **Ayush**: `9pbLHc6cjTVAphKAUV8AQM9sdY3EvLKwExJFgpSTQRCf`
- **Harshit**: `735FcDhfXyGgnVAERYexDvopBRW4duP7DTMYkRBhMRBK`

## Schema Changes

If you make changes to the schema:

```sh
npm run generate  # Generates drizzle folder with the SQL tables
npm run migrate   # Migrates changes to schema to Neon DB
```


ways to do : 

Using Query Parameters (GET Request) — https://your-backend.com/get-friend-public-address?senderId=1&receiverId=2 ✅

    When to Use:
        When retrieving data without modifying anything in the backend.
        If parameters are short and not sensitive (like IDs, filters, sorting).
        Common for search queries, filtering, and fetching specific resources.


        
Use Path Parameters (/users/:senderId/friends/:receiverId/public-address)

    Most RESTful and standard for fetching user-specific resources.
    Reduces redundant query parameters and makes the API more structured.
    Used by Web3 providers, exchanges, and blockchain explorers.



Alternative: Use POST with JSON in Body
    Use this if the API requires authentication (JWT, OAuth, private keys).
    Avoids exposing user IDs in the URL.
    Ideal for signing transactions before sending them to the blockchain.