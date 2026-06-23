import type { BookingSummaryItem } from "@/lib/booking/summary";

const EMAIL_BG = "#07050f";
const EMAIL_CARD_BG = "#3b1771";
const EMAIL_TEXT = "#ffffff";
const EMAIL_TEXT_MUTED = "rgba(255,255,255,0.55)";
const EMAIL_TEXT_SOFT = "rgba(255,255,255,0.82)";
const EMAIL_CARD_BORDER = "rgba(196,181,253,0.38)";
const EMAIL_ROW_BORDER = "rgba(255,255,255,0.14)";
const EMAIL_ROW_BG = "rgba(255,255,255,0.12)";
const EMAIL_CARD_GRADIENT =
  "linear-gradient(135deg,#5b21b6 0%,#7c3aed 42%,#a21caf 100%)";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildBookingCardEmailHtml(
  items: BookingSummaryItem[],
  locale: "pl" | "en",
  options?: {
    title?: string;
    subtitle?: string;
    statusLabel?: string;
    statusColor?: string;
  },
): string {
  const defaultTitle = locale === "pl" ? "Twoje spotkanie" : "Your meeting";
  const title = options?.title ?? defaultTitle;
  const subtitle = options?.subtitle ?? "";
  const statusLabel = options?.statusLabel;
  const statusColor = options?.statusColor ?? "#ddd6fe";

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:0 0 10px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;border:1px solid ${EMAIL_ROW_BORDER};background-color:${EMAIL_ROW_BG};">
              <tr>
                <td style="padding:12px 14px;">
                  <div style="font-size:11px;color:${EMAIL_TEXT_MUTED};text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(item.label)}</div>
                  <div style="font-size:15px;color:${EMAIL_TEXT};font-weight:600;margin-top:4px;line-height:1.4;">${escapeHtml(item.value)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  const statusBadge = statusLabel
    ? `<div style="display:inline-block;margin-bottom:16px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.14);color:${statusColor};font-size:12px;font-weight:600;">${escapeHtml(statusLabel)}</div>`
    : "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:28px auto;">
      <tr>
        <td align="center" style="padding:2px;border-radius:28px;background:${EMAIL_CARD_GRADIENT};background-color:${EMAIL_CARD_BG};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:26px;">
            <tr>
              <td
                bgcolor="${EMAIL_CARD_BG}"
                style="border-radius:26px;padding:28px;background:${EMAIL_CARD_GRADIENT};background-color:${EMAIL_CARD_BG};border:1px solid ${EMAIL_CARD_BORDER};box-shadow:0 24px 60px rgba(91,33,182,0.45);"
              >
                ${statusBadge}
                <div style="font-size:24px;font-weight:700;color:${EMAIL_TEXT};margin-bottom:8px;line-height:1.25;">${escapeHtml(title)}</div>
                ${subtitle ? `<div style="font-size:15px;color:${EMAIL_TEXT_SOFT};margin-bottom:20px;line-height:1.5;">${escapeHtml(subtitle)}</div>` : ""}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

type EmailLayoutOptions = {
  locale: "pl" | "en";
  preheader?: string;
  heading: string;
  intro: string;
  cardHtml: string;
  footerHtml?: string;
  cta?: { label: string; href: string };
};

export function buildEmailLayout(options: EmailLayoutOptions): string {
  const cta = options.cta
    ? `<p style="text-align:center;margin:28px 0 8px;">
        <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;padding:14px 28px;border-radius:16px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 12px 30px rgba(124,58,237,0.35);">${escapeHtml(options.cta.label)}</a>
       </p>`
    : "";

  const footer =
    options.footerHtml ??
    (options.locale === "pl"
      ? `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">MeetMe — umawianie spotkań</p>`
      : `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">MeetMe — meeting scheduling</p>`);

  return `<!DOCTYPE html>
<html lang="${options.locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(options.heading)}</title>
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body, .email-bg { background-color: ${EMAIL_BG} !important; }
    @media (prefers-color-scheme: light) {
      body, .email-bg { background-color: ${EMAIL_BG} !important; }
    }
  </style>
</head>
<body bgcolor="${EMAIL_BG}" class="email-bg" style="margin:0;padding:0;background-color:${EMAIL_BG} !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:${EMAIL_BG};">${escapeHtml(options.preheader ?? options.intro)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${EMAIL_BG}" class="email-bg" style="background-color:${EMAIL_BG} !important;padding:32px 16px;">
    <tr>
      <td bgcolor="${EMAIL_BG}" style="background-color:${EMAIL_BG} !important;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td>
              <p style="text-align:center;color:#c4b5fd;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">MeetMe</p>
              <h1 style="text-align:center;color:#f5f3ff;font-size:28px;font-weight:700;margin:0 0 12px;">${escapeHtml(options.heading)}</h1>
              <p style="text-align:center;color:${EMAIL_TEXT_SOFT};font-size:16px;line-height:1.6;max-width:480px;margin:0 auto 8px;">${escapeHtml(options.intro)}</p>
              ${options.cardHtml}
              ${cta}
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
