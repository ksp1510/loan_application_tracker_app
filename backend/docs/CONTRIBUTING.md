# Contributing Guide

## Local Setup

```bash
git clone <repo-url>
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload
```

## Testing

Coming soon — integrate with `pytest` and MongoDB test container.

## Making a PR

1. Fork the repo
2. Create a branch
3. Make your changes
4. Run `black`, `ruff`, and type-checking
5. Submit a PR