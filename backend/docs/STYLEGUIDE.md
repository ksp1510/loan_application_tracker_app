# Code Style Guide

## Formatting

- **Formatter**: `black`
- **Import sorting**: `isort`
- **Line length**: 88 characters

## Typing

- Use full type hints (`str`, `int`, `dict[str, Any]`, etc.)
- Use `| None` instead of `Optional[X]` (Python 3.10+)
- Always type function inputs and return values

## Linting

- **Linter**: `ruff`
- Example rules enforced:
  - UP045: Use `X | None`
  - I001: Unsorted imports
  - B008: Avoid default `Depends()` calls in params