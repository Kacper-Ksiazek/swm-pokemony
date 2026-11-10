/** Replaces the trailing `@token` in the draft with `@username ` and a trailing space. */
function insertMention(text: string, username: string): string {
  const atIndex = text.lastIndexOf("@");
  const before = text.slice(0, atIndex);
  return `${before}@${username} `;
}

export { insertMention };
