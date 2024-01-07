# Contributing to cy-shadow-report

First off, thank you for considering contributing to cy-shadow-report. It's people like you that make cy-shadow-report such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the cy-shadow-report Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to cy-shadow-report@petermsouzajr.com.

## I don't want to read this whole thing I just have a question!!!

cy-shadow-report is actively developed and we are here to help! If you have a question or are unsure if the issue you're experiencing is a bug, please search our [GitHub issues](https://github.com/petermsouzajr/cy-shadow-report/issues) and [StackOverflow](https://stackoverflow.com/questions/tagged/[cy-shadow-report]) to see if it has already been reported or answered.

If your question or issue is not addressed yet, feel free to open a new issue.

## How Can I Contribute?

### Your First Code Contribution

Unsure where to begin contributing to cy-shadow-report? You can start by looking through `beginner` and `help-wanted` issues:

- [Beginner issues](https://github.com/petermsouzajr/cy-shadow-report/issues?q=label%3Abeginner) - issues which should only require a few lines of code, and a test or two.
- [Help wanted issues](https://github.com/petermsouzajr/cy-shadow-report/issues?q=label%3A%22help+wanted%22) - issues which should be a bit more involved than `beginner` issues.

### Pull Requests

The process described here has several goals:

- Maintain cy-shadow-report's quality.
- Fix problems that are important to users.
- Check and fix Lint issues to make sure the changes do not create additional issues.
- Engage the community in working toward the best possible cy-shadow-report.
- Enable a sustainable system for cy-shadow-report's maintainers to review contributions.

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](.github/PULL_REQUEST_TEMPLATE.md).
2. Follow the [styleguides](#styleguides).
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing.

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Contributors are encouraged, but not required, to use this format:

  - Prepend commit title with one of the Work Type indicators (`feat`, `fix`, `chore`, `docs`)
  - Example: `git commit -m "Feat: Title of the commit" -m "Description or second line of the commit message. This line is optional with the intention of adding more detail and context to the change."`

- Keep in mind, your logs and commit messages will live on. If you need more tips on writing commit messages, check out the freeCodeCamp article, ["How to Write Commit Messages that Project Maintainers Will Appreciate"](https://www.freecodecamp.org/news/how-to-write-commit-messages-maintainers-will-like/) happy coding!


### JavaScript Styleguide

- All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).
- Use ES6 syntax.
- Include JSDoc comments for any function, class, or module you add.
- Avoid platform-dependent code.

### Testing Styleguide

- All new features must be accompanied by Jest tests.
- Write tests that cover core functionalities and edge cases.
- Ensure tests are reproducible and run consistently.
- Follow test-driven development (TDD) practices when applicable.

## Local Development

To run module tests locally, follow these steps:

1. Ensure you have Node.js and npm installed.
2. Clone the repository and navigate to the project directory.
3. Install dependencies by running `npm install`.
4. Run the module tests using `npm test`.

These steps will help you set up the project environment and ensure that your contributions do not break existing functionalities.
