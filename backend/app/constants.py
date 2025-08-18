from enum import Enum

# Enum class for standardizing document types stored in S3 or DB
class FileType(str, Enum):
    contract = "contract"
    id_proof = "id_proof"
    bank_statement = "bank_statement"
    pay_stub = "pay_stub"
    additional_doc = "additional_doc"
    photo_id = "photo_id"
    proof_of_address = "proof_of_address"

# Enum class for standardizing application statuses
class ApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    APPROVED = "APPROVED"
    FUNDED = "FUNDED"
    DECLINED = "DECLINED"

# Enum class for standardizing security types
class SecurityType(str, Enum):
    VEHICLE = "Vehicle"
    PROPERTY = "Property"
    CO_SIGNER = "Co-Signer"
    NA = "N/A"
