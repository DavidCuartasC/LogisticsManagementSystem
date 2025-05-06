const { PrismaClient, Status } = require('@prisma/client');
const bcrypt = require("bcryptjs");
const { isEmailValid, isPasswordStrong } = require('../utils/validator');
const { sendResetPassword } = require('../services/emailService');
const prisma = new PrismaClient();

const generateNewPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * @swagger
 * /api/v1/password/change:
 *   post:
 *     tags:
 *       - Password
 *     summary: Cambia la contraseña de un usuario.
 *     description: Permite a un usuario autenticado cambiar su contraseña proporcionando su correo, contraseña actual y nueva contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: El correo electrónico del usuario.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: La contraseña actual del usuario.
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 description: La nueva contraseña del usuario.
 *                 example: NewPassword456
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password Changed
 *       400:
 *         description: Solicitud inválida o datos incorrectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password doesn't match
 *       403:
 *         description: El usuario no ha verificado su cuenta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have to verify your account
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operation failed
 */

const changePassword = async (req, res) => {
    let { email, password, newPassword } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password || !newPassword) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (!isEmailValid(email)) {
        return res.status(400).json({
            message: "Invalid email format",
        });
    }

    if (!isPasswordStrong(newPassword)) {
        return res.status(400).json({
            message: "the new Password must be at least 6 characters long",
        });
    }

    try {
        const findUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!findUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        if (findUser?.login?.codeStatus != Status.ACTIVE) {
            return res.status(403).json({
                message: "You have to verify your account",
            });
        }

        const validatePassword = await bcrypt.compare(
            password,
            findUser?.password
        );


        if (!validatePassword) {
            return res.status(400).json({
                message: "Password doesn't match",
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: findUser.id },
            data: {
                password: newPasswordHash,
            },
        });

        res.status(200).json({
            message: "Password Changed"
        });

    } catch (error) {
        res.status(500).json({
            message: "Operation failed",
        });
    }
};

/**
 * @swagger
 * /api/v1/password/signup:
 *   post:
 *     tags:
 *       - Password
 *     summary: Restablece la contraseña de un usuario.
 *     description: Genera una nueva contraseña aleatoria y la envía al correo electrónico del usuario si este existe en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: El correo electrónico registrado del usuario.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente y enviada por correo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset Password
 *       400:
 *         description: Campo de correo electrónico no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email fields are required
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operation failed
 */

const resetPassword = async (req, res) => {
    let { email } = req.body;

    email = email?.toLowerCase().trim();

    if (!email) {
        return res.status(400).json({
            message: "Email fields are required",
        });
    }

    try {
        const findUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!findUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const newPassword = generateNewPassword();
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        console.log("password: "+newPassword);
        await prisma.user.update({
            where: { id: findUser.id },
            data: {
                password: newPasswordHash,
            },
        });

        await sendResetPassword(findUser.email, findUser.firstName + " " + findUser.lastName, newPassword);       

        res.status(200).json({
            message: "Reset Password"
        });

    } catch (error) {
        res.status(500).json({
            message: "Operation failed",
        });
    }
};






module.exports = { changePassword, resetPassword };