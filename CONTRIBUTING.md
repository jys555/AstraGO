# Contributing to AstraGo

Thank you for your interest in contributing to AstraGo! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see `.env.example` files)
4. Set up the database: `npm run db:migrate`
5. Seed the database (optional): `npm run db:seed`
6. Start development servers: `npm run dev`

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test both success and error cases

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code follows style guidelines
4. Test your changes thoroughly
5. Submit a pull request with a clear description

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `refactor: Refactor code`

## Questions?

Feel free to open an issue for questions or discussions.
