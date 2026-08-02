export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OTP Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center" style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:35px;">
<h1 style="color:#ffffff;margin:0;font-size:30px;">Verify Your Account</h1>
<p style="color:#dbeafe;margin-top:10px;font-size:15px;">
Secure Authentication
</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;">
Hello 👋
</h2>

<p style="font-size:16px;color:#4b5563;line-height:28px;">
We received a request to verify your email address.
Use the One-Time Password (OTP) below to continue.
</p>

<div style="margin:35px 0;text-align:center;">

<div style="
display:inline-block;
background:#eef2ff;
border:2px dashed #4f46e5;
padding:18px 40px;
border-radius:12px;
font-size:36px;
font-weight:bold;
letter-spacing:10px;
color:#1d4ed8;
">
${otp}
</div>

</div>

<p style="text-align:center;color:#6b7280;font-size:15px;">
This OTP is valid for <strong>10 minutes</strong>.
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;">

<p style="font-size:15px;color:#6b7280;line-height:26px;">
<b>Didn't request this?</b><br>
If you didn't request this verification, you can safely ignore this email.
Your account will remain secure.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:#f9fafb;padding:25px;">

<p style="margin:0;font-size:14px;color:#6b7280;">
This is an automated email. Please do not reply.
</p>

<p style="margin-top:8px;font-size:13px;color:#9ca3af;">
© ${new Date().getFullYear()} Muhammad Abbas. All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

