export function formatToolResult(toolName: string, content: any): string {
  const TOOL_HANDLERS: Record<string, (content: any) => string> = {
    send_email: () => "✅ Email enviado com sucesso!",
    modify_email: () => "✅ Email modificado com sucesso!",
    list_emails: (emails: any[]) => {
      if (!Array.isArray(emails)) return "❌ Lista de emails inválida.";
      return emails
        .map((email) =>
          `📧 *${email.subject || "(sem assunto)"}*\n` +
          `🧑 De: ${email.from || "(remetente desconhecido)"}\n` +
          `📅 Data: ${email.date || "(data desconhecida)"}\n` +
          `🆔 ID: ${email.id || "(sem ID)"}\n\n` +
          `${stripHtml(email.body || "(sem conteúdo)").slice(0, 500).trim()}...\n---`
        )
        .join("\n\n");
    },
    read_email: (email: any) =>
      `📨 *${email.subject}*\n` +
      `🧑 De: ${email.from}\n` +
      `📅 Data: ${email.date}\n\n` +
      `${stripHtml(email.body)}`
  };

  // Pré-processamento para content no formato [{ type: "text", text }]
  if (Array.isArray(content) && content[0]?.type === "text") {
    const rawText = content[0].text;
    const isJsonLike = typeof rawText === "string" && /^[\[{]/.test(rawText.trim());

    if (isJsonLike) {
      try {
        content = JSON.parse(rawText);
      } catch {
        return "❌ Erro ao interpretar conteúdo da ferramenta.";
      }
    } else {
      content = rawText;
    }
  }

  const handler = TOOL_HANDLERS[toolName];
  if (handler) return handler(content);

  return Array.isArray(content)
    ? content.map((c) => c.text).join("\n")
    : typeof content === "object"
    ? JSON.stringify(content, null, 2)
    : String(content);
}



export function stripHtml(content: string | undefined | null): string {
  if (!content || typeof content !== "string") return "";

  const withoutTags = content
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[�]+/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return decodeHtmlEntities(withoutTags);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([A-Fa-f0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/gi, ' ');
}


