# Contributing to Lebanon Relief

Thank you for your interest in contributing to this humanitarian project. Every contribution helps people in need.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/lebanon-crises.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and add your Firebase credentials
5. Start the dev server: `npm run dev`

See the [README](README.md) for full setup instructions including Firebase emulators.

## Development Workflow

1. Create a branch from `main`: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Run the linter: `npm run lint`
5. Commit with a clear message describing what and why
6. Push your branch and open a Pull Request

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Make sure tests pass and add new tests for new functionality
- Update translations in both `en.json` and `ar.json` if adding user-facing text
- Test RTL layout if modifying UI components

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Include steps to reproduce for bug reports
- For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead

## Code Style

- TypeScript with strict mode
- Tailwind CSS for styling
- Follow existing patterns in the codebase
- Mobile-first design — test on small screens

## Translations

This app supports English and Arabic. When adding or changing user-facing text:

1. Add the key to `src/messages/en.json`
2. Add the Arabic translation to `src/messages/ar.json`
3. Use `useTranslations()` from `next-intl` to access the text

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
