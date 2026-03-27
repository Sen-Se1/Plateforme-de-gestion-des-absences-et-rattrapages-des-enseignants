from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings

# A placeholder model setup until the true models are created.
# from app.models import Utilisateur

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class TokenData:
    username: str = None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData()
        token_data.username = username
    except JWTError:
        raise credentials_exception
    
    # Placeholder for checking the active user against DB:
    # user = db.query(Utilisateur).filter(Utilisateur.email == token_data.username).first()
    # if user is None or not user.actif:
    #     raise credentials_exception
    # return user
    return token_data
