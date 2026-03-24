from enum import Enum

class RoleUtilisateur(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMINISTRATION = "ADMINISTRATION"
    ENSEIGNANT = "ENSEIGNANT"
    ETUDIANT = "ETUDIANT"

class StatutSeance(str, Enum):
    PLANIFIEE = "PLANIFIEE"
    ANNULEE = "ANNULEE"
    RATTRAPAGE = "RATTRAPAGE"

class StatutDemandeAbsence(str, Enum):
    EN_ATTENTE = "EN_ATTENTE"
    APPROUVEE = "APPROUVEE"
    REJETEE = "REJETEE"

class StatutPropositionRattrapage(str, Enum):
    EN_ATTENTE = "EN_ATTENTE"
    APPROUVEE = "APPROUVEE"
    REJETEE = "REJETEE"

class StatutSeanceRattrapage(str, Enum):
    PLANIFIEE = "PLANIFIEE"
    TERMINEE = "TERMINEE"
    ANNULEE = "ANNULEE"

class TypeNotification(str, Enum):
    INFO = "INFO"
    ANNULATION = "ANNULATION"
    RATTRAPAGE = "RATTRAPAGE"
    ABSENCE = "ABSENCE"
