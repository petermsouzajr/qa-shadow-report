// tests/ui/editing.spec.js
// Additional UI tests demonstrating qa-shadow-report features

import { test, expect } from '@playwright/test';

test.describe('[platform] TodoMVC Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.new-todo').fill('Original todo');
    await page.locator('.new-todo').press('Enter');
  });

  test('should edit an existing todo [C3030][functional]', async ({ page }) => {
    await page.locator('.todo-list li label').dblclick();
    const editInput = page.locator('.todo-list li.editing .edit');
    await editInput.fill('Updated todo');
    await editInput.press('Enter');
    
    await expect(page.locator('.todo-list li label')).toHaveText('Updated todo');
  });

  test('should cancel editing on escape [C3031][regression]', async ({ page }) => {
    await page.locator('.todo-list li label').dblclick();
    const editInput = page.locator('.todo-list li.editing .edit');
    await editInput.fill('Cancelled edit');
    await editInput.press('Escape');
    
    await expect(page.locator('.todo-list li label')).toHaveText('Original todo');
  });
});

test.describe('[robots] TodoMVC Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.new-todo').fill('Todo 1');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.new-todo').fill('Todo 2');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.new-todo').fill('Todo 3');
    await page.locator('.new-todo').press('Enter');
  });

  test('should toggle all todos [#501][smoke]', async ({ page }) => {
    await page.locator('.toggle-all').click();
    const todos = page.locator('.todo-list li');
    
    await expect(todos.nth(0)).toHaveClass(/completed/);
    await expect(todos.nth(1)).toHaveClass(/completed/);
    await expect(todos.nth(2)).toHaveClass(/completed/);
  });

  test('should clear completed todos [C3040][functional]', async ({ page }) => {
    await page.locator('.todo-list li').nth(0).locator('.toggle').click();
    await page.locator('.todo-list li').nth(1).locator('.toggle').click();
    
    await page.locator('.clear-completed').click();
    
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li')).toHaveText('Todo 3');
  });

  test('should display correct item count [C3041][regression]', async ({ page }) => {
    await expect(page.locator('.todo-count')).toContainText('3 items left');
    
    await page.locator('.todo-list li').nth(0).locator('.toggle').click();
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });
});
