# Module 8: Ontology, Taxonomy & Entity Resolution
from typing import Dict, Any, List, Optional
import re

class EnterpriseTaxonomy:
    """Hierarchical classification (IS-A relationships)."""
    TAXONOMY_TREE = {
        "Entity": {
            "Agent": {
                "User": ["Employee", "Contractor", "CustomerContact"],
                "Team": ["Tier1Support", "PlatformOps", "SecurityOps"]
            },
            "ConfigurationItem": {
                "Hardware": ["Server", "Laptop", "Router", "Switch"],
                "Software": ["Application", "DatabaseCluster", "Microservice", "OS"]
            },
            "ITSMEvent": {
                "Incident": ["CriticalOutage", "PerformanceDegradation"],
                "KnownError": ["SoftwareBug", "ResourceExhaustion", "ConfigError"],
                "Resolution": ["Hotfix", "ConfigChange", "Restart", "Workaround"]
            }
        }
    }

class EnterpriseOntology:
    """Semantic graph ontology defining allowed node labels and relationship constraints."""
    ALLOWED_LABELS = {"User", "Device", "Application", "Incident", "KnownError", "Team", "Resolution"}
    ALLOWED_RELATIONSHIPS = {
        "OWNS_DEVICE": ("User", "Device"),
        "REPORTED_INCIDENT": ("User", "Incident"),
        "USES_APPLICATION": ("User", "Application"),
        "ACCESSES_APP": ("Device", "Application"),
        "HOSTED_ON_OR_DEPENDS_ON": ("Application", "Device"),
        "DEPENDS_ON": ("Application", "Application"),
        "AFFECTS_APPLICATION": ("Incident", "Application"),
        "CAUSED_BY_KNOWN_ERROR": ("Incident", "KnownError"),
        "ASSIGNED_TO_TEAM": ("Incident", "Team"),
        "MANAGES_SERVICE": ("Team", "Application"),
        "RESOLVED_BY": ("KnownError", "Resolution"),
        "RESOLVES_INCIDENT": ("Resolution", "Incident")
    }

class EntityResolver:
    """Resolves raw entity mentions, aliases, and emails to canonical identifiers."""
    def __init__(self):
        self.alias_to_canonical = {
            "alice": "USER::ACME::alice",
            "alice smith": "USER::ACME::alice",
            "alice@acme.com": "USER::ACME::alice",
            "bob": "USER::ACME::bob",
            "bob jones": "USER::ACME::bob",
            "erp": "APP::ACME::erp_finance",
            "sap erp": "APP::ACME::erp_finance",
            "postgres": "APP::ACME::pg_cluster",
            "pg_prod": "APP::ACME::pg_cluster",
            "inc-9001": "INC::9001"
        }

    def resolve(self, entity_text: str) -> str:
        clean = entity_text.strip().lower()
        return self.alias_to_canonical.get(clean, f"CANONICAL::{clean.upper()}")
