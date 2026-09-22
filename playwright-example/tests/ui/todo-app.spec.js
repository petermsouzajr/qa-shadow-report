// tests/ui/todo-app.spec.js
// UI tests demonstrating qa-shadow-report annotations

import { test, expect } from '@playwright/test';

test.describe('[platform] TodoMVC Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the todo input field [C3001][smoke]', async ({ page }) => {
    const input = page.locator('.new-todo');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'What needs to be done?');
  });

  test('should add a new todo item [C3002][smoke]', async ({ page }) => {
    const input = page.locator('.new-todo');
    await input.fill('Buy groceries');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-list li');
    await expect(todoItem).toHaveText('Buy groceries');
  });

  test('should mark todo as completed [C3003][regression]', async ({ page }) => {
    await page.locator('.new-todo').fill('Test todo');
    await page.locator('.new-todo').press('Enter');
    
    await page.locator('.toggle').click();
    await expect(page.locator('.todo-list li')).toHaveClass(/completed/);
  });

  test('should delete a todo item [DEV-456][functional]', async ({ page }) => {
    await page.locator('.new-todo').fill('Todo to delete');
    await page.locator('.new-todo').press('Enter');
    
    await page.locator('.todo-list li').hover();
    await page.locator('.destroy').click();
    
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });
});

test.describe('[billing] TodoMVC Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    await page.locator('.new-todo').fill('Active todo');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.new-todo').fill('Completed todo');
    await page.locator('.new-todo').press('Enter');
    
    await page.locator('.todo-list li').nth(1).locator('.toggle').click();
  });

  test('should filter active todos [C3010][sanity]', async ({ page }) => {
    await page.locator('a[href="#/active"]').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toHaveText('Active todo');
  });

  test('should filter completed todos [C3011][sanity]', async ({ page }) => {
    await page.locator('a[href="#/completed"]').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toHaveText('Completed todo');
  });

  test('should show all todos by default [C3012][regression]', async ({ page }) => {
    await expect(page.locator('.todo-list li')).toHaveCount(2);
  });
});

test.describe('[unicorns] TodoMVC Accessibility', () => {
  test('should have proper heading structure [TC-4001][accessibility]', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('todos');
  });

  test('should support keyboard navigation [C3020][usability]', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Keyboard todo');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.todo-list li')).toHaveText('Keyboard todo');
  });
});
