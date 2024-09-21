import nodemailer from 'nodemailer';

export async function sendMail({
    to,
    name,
    subject,
    body,
}: {
    to: string;
    name: string;
    subject: string;
    body: string; // This will be HTML content
}) {
    const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;
    
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD,
        },
    });

    try {
        const testResult = await transport.verify();
        console.log("SMTP Server is ready:", testResult);
    } catch (error) {
        console.error("Error verifying SMTP server:", error);
        return;
    }

    try {
        const sendResult = await transport.sendMail({
            from: SMTP_EMAIL,
            to,
            subject,
            html: body, // Use HTML content for the email body
        });
        console.log("Email sent:", sendResult);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
