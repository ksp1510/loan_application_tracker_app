from enum import Enum

class FileType(str, Enum):
    contract = "contract"
    id_proof = "id_proof"
    bank_statement = "bank_statement"
    pay_stub = "pay_stub"
    additional_doc = "additional_doc"
    photo_id = "photo_id"
    proof_of_address = "proof_of_address"
