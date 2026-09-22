// tests/api/jsonplaceholder.spec.js
// API tests demonstrating qa-shadow-report annotations

import { test, expect } from '@playwright/test';

test.describe('[robots] JSONPlaceholder API - Posts', () => {
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  test('should fetch all posts [C4001][smoke]', async ({ request }) => {
    const response = await request.get(`${apiUrl}/posts`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
  });

  test('should fetch a single post [C4002][regression]', async ({ request }) => {
    const response = await request.get(`${apiUrl}/posts/1`);
    expect(response.ok()).toBeTruthy();
    
    const post = await response.json();
    expect(post).toHaveProperty('id', 1);
    expect(post).toHaveProperty('userId');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
  });

  test('should create a new post [C4003][functional]', async ({ request }) => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1,
    };
    
    const response = await request.post(`${apiUrl}/posts`, { data: newPost });
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
  });

  test('should update a post [TC-5001][regression]', async ({ request }) => {
    const updatedData = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };
    
    const response = await request.put(`${apiUrl}/posts/1`, { data: updatedData });
    expect(response.ok()).toBeTruthy();
    
    const post = await response.json();
    expect(post.title).toBe(updatedData.title);
  });

  test('should delete a post [#601][smoke]', async ({ request }) => {
    const response = await request.delete(`${apiUrl}/posts/1`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});

test.describe('[billing] JSONPlaceholder API - Users', () => {
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  test('should fetch all users [C4010][sanity]', async ({ request }) => {
    const response = await request.get(`${apiUrl}/users`);
    expect(response.ok()).toBeTruthy();
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  test('should validate user schema [C4011][integration]', async ({ request }) => {
    const response = await request.get(`${apiUrl}/users/1`);
    expect(response.ok()).toBeTruthy();
    
    const user = await response.json();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('address');
    expect(user).toHaveProperty('phone');
  });

  test('should fetch user posts [DEV-789][functional]', async ({ request }) => {
    const response = await request.get(`${apiUrl}/users/1/posts`);
    expect(response.ok()).toBeTruthy();
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    posts.forEach(post => {
      expect(post.userId).toBe(1);
    });
  });
});
