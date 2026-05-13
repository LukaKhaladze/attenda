export async function sendHostInviteEmail(params: {
  email: string;
  password: string;
  hostName?: string | null;
  conferenceTitle: string;
  signinUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.HOST_INVITE_FROM_EMAIL || process.env.RESET_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info("[host-invite] missing RESEND_API_KEY or HOST_INVITE_FROM_EMAIL");
    console.info(
      `[host-invite] signin=${params.signinUrl} email=${params.email} password=${params.password} conference=${params.conferenceTitle}`
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: params.email,
      subject: `ჰოსტის წვდომა — ${params.conferenceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>ჰოსტის წვდომა კონფერენციისთვის</h2>
          <p>გამარჯობა ${params.hostName || ""},</p>
          <p>ადმინმა მოგანიჭა ჰოსტის წვდომა ღონისძიებაზე: <strong>${params.conferenceTitle}</strong></p>
          <p><strong>შესვლის ბმული:</strong> <a href="${params.signinUrl}">${params.signinUrl}</a></p>
          <p><strong>იუზერი:</strong> ${params.email}</p>
          <p><strong>პაროლი:</strong> ${params.password}</p>
          <p>გთხოვ, შესვლის შემდეგ შეცვალე პაროლი უსაფრთხოებისთვის.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HOST_INVITE_EMAIL_FAILED:${body}`);
  }
}
