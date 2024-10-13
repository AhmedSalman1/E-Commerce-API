// Commitlint configuration for enforcing conventional commit messages
const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Define allowed commit types
    'type-enum': [
      2, // Error level 2 (error), must pass this rule
      'always', // Rule always applies
      [
        'build', // Changes to the build system or dependencies
        'chore', // Routine tasks not affecting code (e.g., tooling updates)
        'ci', // Continuous integration changes (e.g., GitHub Actions, Travis)
        'docs', // Documentation updates
        'feat', // New features
        'fix', // Bug fixes
        'perf', // Performance improvements
        'refactor', // Code refactoring without changing behavior
        'revert', // Reverting previous commits
        'style', // Code style changes (e.g., formatting)
        'test', // Adding or updating tests
      ],
    ],
    'type-case': [2, 'always', 'lower-case'], // Commit type must be in lower-case
    'type-empty': [2, 'never'], // Commit type cannot be empty
    'subject-empty': [2, 'never'], // Commit subject cannot be empty
    'subject-full-stop': [2, 'never', '.'], // Subject cannot end with a period
    'subject-case': [0, 'always'], // No restriction on subject case
    'header-max-length': [2, 'always', 100], // Maximum header length is 100 characters
  },
};

export default Configuration;
