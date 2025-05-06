const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, name, code) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
    <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
    <p>Hola ${name},</p>
    <p>Gracias por registrarte. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
      ${code}
    </div>
    <p>Este código expirará en 15 minutos.</p>
    <p>Si no has solicitado este código, por favor ignora este correo.</p>
    <p>Saludos,<br>El equipo de soporte</p>
  </div> `;

    const subject = "Código de verificación para tu cuenta";
    const response = await sentEmail(email, subject, html);
    return response;
};

const sendResetPassword = async (email, name, newPassword) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
    <h2 style="color: #333; text-align: center;">Restablecer contraseña</h2>
    <p>Hola ${name},</p>
    <p>Aqui tienes tu nueva contraseña:</p>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
      ${newPassword}
    </div>
    <p>Saludos,<br>El equipo de soporte</p>
  </div> `;

    const subject = "Restablecer contraseña para tu cuenta";
    const response = await sentEmail(email, subject, html);
    return response;
};


const sentEmail = async (email, subject, content) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: content
        });
        return true;
    } catch (err) {
        console.error("Email error:", err);
        return false;
    }
}

module.exports = { sendVerificationEmail, sendResetPassword };
