export function formatToolResult(toolName: string, content: any): string {
  // 💡 Caso venha como array de "text", extrair e parsear
  if (Array.isArray(content) && content[0]?.type === "text") {
    try {
      content = JSON.parse(content[0].text);
    } catch (err) {
      return "❌ Erro ao interpretar conteúdo da ferramenta.";
    }
  }

  if (toolName === "list_emails" && Array.isArray(content)) {
    return content.map((email) => {
      return (
        `📧 *${email.subject || "(sem assunto)"}*\n` +
        `🧑 De: ${email.from || "(remetente desconhecido)"}\n` +
        `📅 Data: ${email.date || "(data desconhecida)"}\n` +
        `🆔 ID: ${email.id || "(sem ID)"}\n\n` +
        `${stripHtml(email.body || "(sem conteúdo)").slice(0, 500).trim()}...\n` +
        `---`
      );
    }).join("\n\n");
  }

  if (toolName === "send_email") {
    return `✅ Email enviado com sucesso!`;
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
  return content
    .replace(/<[^>]*>?/gm, "")     // Remove tags HTML
    .replace(/\s{2,}/g, " ")       // Remove espaços em excesso
    .replace(/&nbsp;/g, " ")       // Substitui entidades comuns
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
