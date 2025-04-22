export function formatToolResult(toolName: string, content: any): string {
  
  if (toolName === "send_email") {
    return `✅ Email enviado com sucesso!`;
  }

  if (Array.isArray(content) && content[0]?.type === "text") {
    try {
      content = JSON.parse(content[0].text);
    } catch (err) {
      return "❌ Erro ao interpretar conteúdo da ferramenta.";
    }
  }

  if (toolName === "list_emails" && Array.isArray(content)) {
    return content
      .map((email) => {
        return (
          `📧 *${email.subject || "(sem assunto)"}*\n` +
          `🧑 De: ${email.from || "(remetente desconhecido)"}\n` +
          `📅 Data: ${email.date || "(data desconhecida)"}\n` +
          `🆔 ID: ${email.id || "(sem ID)"}\n\n` +
          `${stripHtml(email.body || "(sem conteúdo)")
            .slice(0, 500)
            .trim()}...\n` +
          `---`
        );
      })
      .join("\n\n");
  }

  if (toolName === "read_email") {
    return (
      `📨 *${content.subject}*\n` +
      `🧑 De: ${content.from}\n` +
      `📅 Data: ${content.date}\n\n` +
      `${stripHtml(content.body)}`
    );
  }

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


