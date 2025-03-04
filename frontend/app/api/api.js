import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to add a new user
export const addUser = async (userData) => {
    try {
        const response = await api.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

// Function to get user details by username
export const getUser = async (username) => {
    try {
        const response = await api.get(`/users/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Function to get all friends of a user by username
export const getFriends = async (username) => {
    try {
        const response = await api.get(`/friends/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching friends:', error);
        throw error;
    }
};

// Function to add a friend for a user
export const addFriend = async (username, friendUsername) => {
    try {
        const response = await api.post('/friends', { username, friendUsername });
        return response.data;
    } catch (error) {
        console.error('Error adding friend:', error);
        throw error;
    }
};

export default {
    addUser,
    getUser,
    getFriends,
    addFriend,
};
