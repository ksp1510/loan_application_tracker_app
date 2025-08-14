# app/utils/helpers.py
from bson import ObjectId


def serialize_document(doc: dict) -> dict:
    """Convert Mongo ObjectId to str for JSON responses."""
    if not doc:
        return doc
    _id = doc.get("_id")
    if isinstance(_id, ObjectId):
        doc["_id"] = str(_id)
    return doc


def serialize_list(docs: list[dict]) -> list[dict]:
    return [serialize_document(d) for d in docs]
