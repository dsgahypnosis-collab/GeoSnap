# Architecture Documentation

## Overview
This document outlines the detailed system design for the GeoSnap application, focusing on key components such as backend services, database schema, mobile app structure, and gamification system.

## Backend Services
The backend services are built using Node.js and Express. They provide RESTful APIs for mobile applications and web clients. Key services include:
- **User Management Service**: Handles user authentication and profile management.
- **Photo Sharing Service**: Manages photo uploads, storage, and retrieval.
- **Location Service**: Provides functionalities related to geolocation and mapping.
- **Notification Service**: Sends notifications to users about activities and updates.

## Database Schema
The database uses MongoDB, implemented with a NoSQL structure for flexibility. Key collections include:
- **Users**: 
  - `userId`: String (Primary Key)
  - `username`: String
  - `email`: String
  - `passwordHash`: String  
  - `createdAt`: Date

- **Photos**: 
  - `photoId`: String (Primary Key)
  - `userId`: String (Foreign Key to Users)
  - `location`: {latitude: Number, longitude: Number}
  - `url`: String
  - `createdAt`: Date

- **Comments**: 
  - `commentId`: String (Primary Key)
  - `photoId`: String (Foreign Key to Photos)
  - `userId`: String (Foreign Key to Users)
  - `content`: String
  - `createdAt`: Date

## Mobile App Structure
The mobile application is built using React Native to ensure cross-platform compatibility (iOS and Android). The structure includes:
- **Screens**:
  - *Home Screen*: Display photos from the feed.
  - *Upload Screen*: Allow users to upload new photos.
  - *Profile Screen*: Manage user settings and profile.
  - *Map Screen*: Display user’s location and shared photos on a map.

- **Components**:
  - *PhotoCard*: Display individual photos including metadata.
  - *CommentList*: Show comments associated with each photo.

## Gamification System
The gamification system enhances user engagement by providing rewards, badges, and challenges. Key features include:
- **Points System**: Users earn points for uploading photos, commenting, and engaging with content.
- **Badges**: Users unlock badges based on achievements (e.g., first upload, 100 likes).
- **Challenges**: Special challenges that encourage users to participate in specific activities for additional rewards.