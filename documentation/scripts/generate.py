from pathlib import Path
import os
import datetime as dt
from docx import Document
import re
from collections import Counter


STOPWORDS = {
    "get", "set", "handle", "data", "process", "service", "controller",
    "util", "helper", "manager", "impl", "main", "test"
}


def extract_keywords(content: str):
    words = re.findall(r"[A-Za-z]{4,}", content.lower())
    words = [w for w in words if w not in STOPWORDS]
    return Counter(words).most_common(5)


def extract_identifiers(content: str):
    identifiers = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]{3,}\b", content)
    identifiers = [i for i in identifiers if i.lower() not in STOPWORDS]
    return identifiers[:10]


def describe_file(path: Path) -> str:
    name = path.stem

    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except:
        return "Core file (unable to analyze content)"

    keywords = extract_keywords(content)
    identifiers = extract_identifiers(content)

    keyword_part = ", ".join(k for k, _ in keywords[:3])
    identifier_part = ", ".join(identifiers[:3])

    description = []

    if keyword_part:
        description.append(f"Focuses on {keyword_part}")

    if identifier_part:
        description.append(f"Including logic such as {identifier_part}")

    if not description:
        return "Implements core functionality for this module"

    return ". ".join(description) + "."