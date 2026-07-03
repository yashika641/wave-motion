import requests
import jwt
from fastapi import HTTPException
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.x509 import load_pem_x509_certificate

FIREBASE_PROJECT_ID = "wave-motion-e2512"

GOOGLE_CERTS_URL = (
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
)

def verify_firebase_token(id_token: str):
    try:
        # 1. Download Google certs
        certs = requests.get(GOOGLE_CERTS_URL).json()

        # 2. Extract KID from JWT header
        header = jwt.get_unverified_header(id_token)
        kid = header["kid"]

        if kid not in certs:
            raise HTTPException(status_code=401, detail="Invalid KID in token header")

        # 3. Load certificate
        cert_str = certs[kid]
        cert_obj = load_pem_x509_certificate(cert_str.encode("utf-8"), default_backend())
        public_key = cert_obj.public_key()

        # 4. Verify token and decode
        decoded = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
        )

        # 5. Return a proper dict instead of string
        return {
            "uid": decoded.get("user_id"),
            "email": decoded.get("email"),
            "name": decoded.get("name", decoded.get("email", "")),
            "picture": decoded.get("picture")
        }

    except Exception as e:
        print("🔥 Firebase Error:", e)
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")
