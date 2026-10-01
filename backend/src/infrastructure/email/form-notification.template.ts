export interface FormNotification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source: string;
  message?: string | null;
  formData?: unknown;
  createdAt?: Date | string;
}

const escape = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char));

const labels: Record<string, string> = {
  CONTACT_FORM: 'Contact form', PRICING_PAGE: 'Quote request', ROI_CALCULATOR: 'ROI calculator',
  NEWSLETTER: 'Newsletter', service: 'Service requested', jobTitle: 'Job title', website: 'Website',
  'contact.form.services.email': 'Email & Collaboration',
  'contact.form.services.cloud': 'Cloud Solutions',
  'contact.form.services.security': 'Cybersecurity',
  'contact.form.services.managed': 'Managed IT Services',
  'contact.form.services.backup': 'Backup & Recovery',
  'contact.form.services.consulting': 'IT Consulting',
  'contact.form.services.other': 'Other',
};

function fields(value: unknown, prefix = ''): [string, string][] {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value.flatMap((item, i) => fields(item, `${prefix} ${i + 1}`));
  if (typeof value === 'object') return Object.entries(value).flatMap(([key, item]) =>
    fields(item, key === 'answers' ? prefix : [prefix, labels[key] ?? key.replace(/[_-]/g, ' ')].filter(Boolean).join(' / ')));
  return [[prefix || 'Answer', labels[String(value)] ?? String(value)]];
}

export function renderFormNotification(lead: FormNotification, adminUrl: string) {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  const date = lead.createdAt ? new Date(lead.createdAt) : undefined;
  const timestamp = date && !Number.isNaN(date.getTime())
    ? date.toLocaleString('en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' }) + ' (Cairo)'
    : 'Not recorded';
  const source = labels[lead.source] ?? lead.source;
  const details: [string, string][] = [
    ['Full name', name], ['Email address', lead.email], ['Phone number', lead.phone || 'Not provided'],
    ['Company', lead.company || 'Not provided'], ...fields(lead.formData),
  ];
  const rows = details.map(([label, value]) => `<tr><td style="padding:14px 0;border-bottom:1px solid #e8edf3"><div style="font-size:11px;line-height:18px;color:#718096;text-transform:uppercase;letter-spacing:1px">${escape(label)}</div><div dir="auto" style="font-size:15px;line-height:24px;color:#20344f;overflow-wrap:anywhere">${escape(value)}</div></td></tr>`).join('');
  const reply = 'mailto:' + encodeURIComponent(lead.email) + '?subject=' + encodeURIComponent('Re: Your Roaya enquiry');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#20344f">
<div style="display:none;max-height:0;overflow:hidden">New ${escape(source)} submission from ${escape(name)}.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #dce4ed;border-radius:16px">
<tr><td style="padding:28px 32px;background:#20344f;border-radius:16px 16px 0 0"><div style="font-size:29px;font-weight:bold;letter-spacing:-1px;color:#fff">roaya<span style="color:#64c7ce">.</span></div><div style="margin-top:8px;font-size:10px;letter-spacing:2px;color:#b7cadf">FORM NOTIFICATIONS</div></td></tr>
<tr><td style="padding:30px 32px 12px"><div style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#27838b">${escape(source).toUpperCase()}</div><h1 style="font-size:27px;line-height:34px;margin:10px 0;color:#20344f">A new enquiry has arrived.</h1><p style="font-size:14px;line-height:23px;color:#718096;margin:0">${escape(name)} submitted a form on your website.</p><p style="font-size:12px;color:#718096;margin:14px 0 0">${escape(timestamp)}</p></td></tr>
<tr><td style="padding:12px 32px 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table></td></tr>
<tr><td style="padding:0 32px 26px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fa;border-left:3px solid #64c7ce"><tr><td style="padding:18px"><div style="font-size:11px;color:#718096;letter-spacing:1px;margin-bottom:8px">CLIENT MESSAGE</div><div dir="auto" style="font-size:15px;line-height:25px;white-space:pre-wrap;overflow-wrap:anywhere">${escape(lead.message || 'No message provided')}</div></td></tr></table></td></tr>
<tr><td style="padding:0 32px 30px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#3d5a80" style="border-radius:8px"><a href="${escape(reply)}" style="display:inline-block;padding:14px 22px;color:#fff;text-decoration:none;font-size:14px;font-weight:bold">Reply to client</a></td><td style="padding-left:18px"><a href="${escape(adminUrl)}" style="font-size:13px;color:#3d5a80;text-decoration:underline">View submission</a></td></tr></table></td></tr>
<tr><td style="padding:20px 32px;background:#f7f9fb;border-top:1px solid #e8edf3;border-radius:0 0 16px 16px"><div style="font-size:11px;line-height:18px;color:#718096">REFERENCE<br><span style="font-family:monospace;color:#3d5a80;word-break:break-all">${escape(lead.id)}</span></div><p style="font-size:11px;line-height:18px;color:#718096;margin:12px 0 0">Roaya · Website form notification</p></td></tr>
</table></td></tr></table></body></html>`;
  const text = ['New form submission', 'Form: ' + source, 'Submission ID: ' + lead.id,
    'Submitted: ' + (date && !Number.isNaN(date.getTime()) ? date.toISOString() : 'Not recorded'),
    ...details.map(([label, value]) => label + ': ' + value), '', 'Message: ' + (lead.message || 'No message provided'),
    '', 'View submission: ' + adminUrl].join('\n');
  return { html, text };
}
