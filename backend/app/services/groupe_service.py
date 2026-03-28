from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional, Tuple
from app.models.groupe import Groupe
from app.models.utilisateur import Utilisateur
from app.models.etudiant_groupe import etudiants_groupes
from app.models.emploi_du_temps import EmploiDuTemps
from app.models.departement import Departement
from app.models.enums import RoleUtilisateur
from app.schemas.groupe import GroupeCreate, GroupeUpdate

class GroupeService:
    @staticmethod
    def get_paginated(db: Session, page: int, per_page: int, search: Optional[str] = None, departement_id: Optional[int] = None) -> Tuple[List[Groupe], int]:
        query = db.query(Groupe)
        if search:
            query = query.filter(Groupe.nom.ilike(f"%{search}%"))
        if departement_id:
            query = query.filter(Groupe.departement_id == departement_id)
        
        total = query.count()
        offset = (page - 1) * per_page
        items = query.offset(offset).limit(per_page).all()
        return items, total

    @staticmethod
    def get_by_id(db: Session, groupe_id: int) -> Optional[Groupe]:
        return db.query(Groupe).filter(Groupe.id == groupe_id).first()

    @staticmethod
    def create(db: Session, data: GroupeCreate) -> Groupe:
        db_obj = Groupe(nom=data.nom, departement_id=data.departement_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db: Session, groupe_id: int, data: GroupeUpdate) -> Optional[Groupe]:
        db_obj = db.query(Groupe).filter(Groupe.id == groupe_id).first()
        if not db_obj:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
            
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, groupe_id: int) -> bool:
        db_obj = db.query(Groupe).filter(Groupe.id == groupe_id).first()
        if not db_obj:
            return False
        
        db.delete(db_obj)
        db.commit()
        return True

    @staticmethod
    def has_references(db: Session, groupe_id: int) -> bool:
        return db.query(EmploiDuTemps).filter(EmploiDuTemps.groupe_id == groupe_id).count() > 0

    @staticmethod
    def check_department_exists(db: Session, departement_id: int) -> bool:
        return db.query(Departement).filter(Departement.id == departement_id).count() > 0

    @staticmethod
    def add_students(db: Session, groupe_id: int, student_ids: List[int]) -> Tuple[int, List[str]]:
        groupe = db.query(Groupe).filter(Groupe.id == groupe_id).first()
        if not groupe:
            return 0, ["Groupe non trouvé"]
        
        added_count = 0
        errors = []
        
        students = db.query(Utilisateur).filter(
            Utilisateur.id.in_(student_ids),
            Utilisateur.role == RoleUtilisateur.ETUDIANT
        ).all()
        
        valid_students_map = {s.id: s for s in students}
        
        for s_id in student_ids:
            if s_id not in valid_students_map:
                errors.append(f"ID {s_id} n'est pas un étudiant valide.")
                continue
            
            db.execute(etudiants_groupes.delete().where(etudiants_groupes.c.etudiant_id == s_id))
            
            groupe.etudiants.append(valid_students_map[s_id])
            added_count += 1
        
        db.commit()
        return added_count, errors

    @staticmethod
    def is_student_in_group(db: Session, groupe_id: int, student_id: int) -> bool:
        return db.query(etudiants_groupes).filter(
            etudiants_groupes.c.groupe_id == groupe_id,
            etudiants_groupes.c.etudiant_id == student_id
        ).count() > 0

    @staticmethod
    def remove_student(db: Session, groupe_id: int, student_id: int) -> bool:
        groupe = db.query(Groupe).filter(Groupe.id == groupe_id).first()
        if not groupe:
            return False
        
        student = next((s for s in groupe.etudiants if s.id == student_id), None)
        if not student:
            return False
            
        groupe.etudiants.remove(student)
        db.commit()
        return True

    @staticmethod
    def get_students_paginated(db: Session, groupe_id: int, page: int, per_page: int) -> Tuple[List[Utilisateur], int]:
        total = db.query(etudiants_groupes).filter(etudiants_groupes.c.groupe_id == groupe_id).count()
        offset = (page - 1) * per_page
        
        students = db.query(Utilisateur).join(
            etudiants_groupes,
            Utilisateur.id == etudiants_groupes.c.etudiant_id
        ).filter(
            etudiants_groupes.c.groupe_id == groupe_id
        ).offset(offset).limit(per_page).all()
        
        return students, total
