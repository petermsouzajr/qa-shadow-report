// cypress/e2e/api/todos.cy.js
// API tests demonstrating qa-shadow-report annotations

describe('[robots] Todo API Tests', () => {
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  it('should fetch all todos [C2001][smoke]', () => {
    cy.request(`${apiUrl}/todos`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.length.greaterThan(0);
    });
  });

  it('should fetch a single todo [C2002][regression]', () => {
    cy.request(`${apiUrl}/todos/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', 1);
      expect(response.body).to.have.property('title');
    });
  });

  it('should create a new todo [C2003][functional]', () => {
    cy.request('POST', `${apiUrl}/todos`, {
      userId: 1,
      title: 'Test Todo',
      completed: false,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
    });
  });

  it('should update a todo [DEV-345][regression]', () => {
    cy.request('PUT', `${apiUrl}/todos/1`, {
      userId: 1,
      id: 1,
      title: 'Updated Todo',
      completed: true,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.title).to.eq('Updated Todo');
      expect(response.body.completed).to.be.true;
    });
  });

  it('should delete a todo [#356][smoke]', () => {
    cy.request('DELETE', `${apiUrl}/todos/1`).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe('[billing] User API Tests', () => {
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  it('should fetch all users [C2010][sanity]', () => {
    cy.request(`${apiUrl}/users`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('should validate user data structure [C2011][integration]', () => {
    cy.request(`${apiUrl}/users/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys(
        'id',
        'name',
        'username',
        'email',
        'address',
        'phone',
        'website',
        'company'
      );
    });
  });
});
