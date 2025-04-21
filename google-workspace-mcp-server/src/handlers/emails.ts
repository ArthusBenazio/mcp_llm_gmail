import { gmail } from "../config/auth.js";
import { getEmailBody } from "../utils/gmailHelpers.js";

export async function listEmails(params: { maxResults?: number; query?: string }) {
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: params.maxResults || 5,
    q: params.query,
  });

  const messages = res.data.messages || [];

  const emails = [];

  for (const msg of messages) {
    const emailRes = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const payload = emailRes.data.payload;
    const headers = payload?.headers || [];

    const subject = headers.find(h => h.name === "Subject")?.value || "Sem assunto";
    const from = headers.find(h => h.name === "From")?.value || "Remetente desconhecido";
    const date = headers.find(h => h.name === "Date")?.value || "Data desconhecida";
    const body = getEmailBody(payload) || "(sem conteúdo)";

    emails.push({
      id: msg.id,
      subject,
      from,
      date,
      body,
    });
  }

  return {
    content: emails.map((email) => ({
      type: "text",
      ...email,
    })),
  };
}

export async function searchEmails(args: any) {
  return listEmails(args);
}

export async function sendEmail(args: any) {
  const { to, subject, body, cc, bcc } = args;
  const headers = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    `To: ${to}`,
    cc && `Cc: ${cc}`,
    bcc && `Bcc: ${bcc}`,
    `Subject: ${subject}`,
  ].filter(Boolean).join("\r\n");

  const message = `${headers}\r\n\r\n${body}`;
  const encoded = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await gmail.users.messages.send({ userId: "me", requestBody: { raw: encoded } });
  return { content: [{ type: "text", text: `Email sent. ID: ${res.data.id}` }] };
}

export async function modifyEmail(args: any) {
  const res = await gmail.users.messages.modify({
    userId: "me",
    id: args.id,
    requestBody: {
      addLabelIds: args.addLabels,
      removeLabelIds: args.removeLabels,
    },
  });

  return { content: [{ type: "text", text: `Email modified. ID: ${res.data.id}` }] };
}