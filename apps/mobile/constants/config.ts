/**
 * Mobile app configuration constants.
 *
 * API_BASE_URL — Base URL for the REST API backend.
 * TOKEN_EXPIRATION_TIME — Token validity duration in milliseconds (24 hours).
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.24:8180';

// 24 hours in milliseconds
export const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000;
