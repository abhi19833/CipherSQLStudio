const BLOCKED_SQL_PATTERNS = [
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bDELETE\b/i,
  /\bDROP\b/i,
  /\bALTER\b/i,
  /\bTRUNCATE\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bDO\b/i,
  /\bCOPY\b/i,
];

function getReferencedTables(queryText) {
  const tables = new Set();
  const tableRegex = /\b(?:FROM|JOIN)\s+"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi;

  let match = tableRegex.exec(queryText);
  while (match) {
    tables.add(match[1].toLowerCase());
    match = tableRegex.exec(queryText);
  }

  return [...tables];
}

export function validateSqlQuery(queryText, allowedTableNames = []) {
  const normalizedQuery = String(queryText || "").trim();

  if (!normalizedQuery) {
    return { valid: false, reason: "Query is empty." };
  }

  if (normalizedQuery.length > 4000) {
    return { valid: false, reason: "Query is too long." };
  }

  if (!/^\s*SELECT\b/i.test(normalizedQuery)) {
    return { valid: false, reason: "Only SELECT queries are allowed." };
  }

  if (normalizedQuery.includes(";")) {
    return { valid: false, reason: "Multiple statements are not allowe." };
  }

  if (normalizedQuery.includes("--") || normalizedQuery.includes("/*")) {
    return { valid: false, reason: "Comments are not allowed  query input." };
  }

  const hasBlockedPattern = BLOCKED_SQL_PATTERNS.some((pattern) =>
    pattern.test(normalizedQuery),
  );
  if (hasBlockedPattern) {
    return { valid: false, reason: "Unsafe SQL keyword detected." };
  }

  if (Array.isArray(allowedTableNames) && allowedTableNames.length > 0) {
    const allowed = new Set(
      allowedTableNames.map((name) => String(name).toLowerCase()),
    );
    const referencedTables = getReferencedTables(normalizedQuery);
    const forbiddenTable = referencedTables.find(
      (tableName) => !allowed.has(tableName),
    );

    if (forbiddenTable) {
      return {
        valid: false,
        reason: `Table "${forbiddenTable}"  not allowed for this assignment.`,
      };
    }
  }

  return { valid: true };
}
