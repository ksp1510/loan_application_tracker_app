# app/utils/helpers.py
def serialize_document(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc
