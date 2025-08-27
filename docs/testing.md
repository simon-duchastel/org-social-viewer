# Testing

This document describes the testing philosophy for this project and how to write new tests.

## Testing Philosophy

1. Each function/class has unit tests asserting its core behavior as well as any reasonable edge-cases
2. Where possible, integration testing tests that when a component calls multiple functions or combines multiple classes it has the expected behavior
3. Manual testing is performed before submitting any changes to ensure functionality works as expected

## Requirements for PRs
- All existing tests must pass
- New code requires corresponding tests
- Modifying existing code requires updating the relevant tests
- Edge cases and error scenarios should be covered
- Test names should be descriptive and specific
- For code that's difficult to test idiomatically, tests aren't strictly necessary. Manual testing can be used instead. However, this is a smell that the code is poorly factored - see [how-to-contribute.md](how-to-contribute.md).
