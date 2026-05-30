from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    nouveau_mot_de_passe: str
