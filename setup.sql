-- Create Database
CREATE DATABASE IF NOT EXISTS wavechat_db;
USE wavechat_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20) UNIQUE,
    image TEXT,
    lastSeen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chatId VARCHAR(100),
    sender VARCHAR(50),
    text TEXT,
    type VARCHAR(20),
    mediaUrl TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Status/Stories Table
CREATE TABLE IF NOT EXISTS status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50),
    userName VARCHAR(100),
    type VARCHAR(20),
    content TEXT,
    bgColor VARCHAR(10),
    mediaUrl TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresAt TIMESTAMP
);
