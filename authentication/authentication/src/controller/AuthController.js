const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../services/emailService");
const { isEmailValid, isPasswordStrong } = require("../utils/validator");
const { generateToken } = require("../utils/jwt");
require("dotenv").config();

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *   - name: Password
 */

/**
 * @swagger
 * /api/v1/authentication/signup:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registra un nuevo usuario.
 *     description: Permite a un usuario registrarse proporcionando su información de correo electrónico, contraseña, y datos personales.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario.
 *                 example: password123
 *               firstName:
 *                 type: string
 *                 description: El primer nombre del usuario.
 *                 example: Juan
 *               middleName:
 *                 type: string
 *                 description: El segundo nombre del usuario (opcional).
 *                 example: Carlos
 *               lastName:
 *                 type: string
 *                 description: El apellido del usuario.
 *                 example: Pérez
 *               secondLastName:
 *                 type: string
 *                 description: El segundo apellido del usuario (opcional).
 *                 example: Rodríguez
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario (opcional).
 *                 example: "+57 3001234567"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario registrado correctamente. Por favor, revise su correo electrónico para el código de verificación.
 *                 userId:
 *                   type: string
 *                   example: "607f1f77bcf86cd799439011"
 *       400:
 *         description: Faltan campos requeridos o el formato es incorrecto.
 *       500:
 *         description: Error al registrar el usuario.
 */
const signUp = async (req, res) => {
  let { email, password, firstName, middleName, lastName, secondLastName, phone } = req.body;

  email = email?.toLowerCase().trim();

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isPasswordStrong(password)) {
    return res.status(400).json({ message: "Password is too short" });
  }

  try {

    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (findUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const code = generateVerificationCode();
    const expirationTime = new Date(Date.now() + 15 * 60000);

    const rolData = await prisma.rol.findFirst({
      where: { name: 'Repartidor' },
    });

    console.log(rolData);
    
    if (!rolData) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const rolId = rolData.id;    

    const user = await prisma.user.create({
      data: {
        firstName, middleName, lastName, secondLastName, phone, email,
        password: hashedPassword,
        rolId: rolId,
        login: {
          code: code, 
          codeExpires: expirationTime
        }
      },
    });

    const emailSent = await sendVerificationEmail(email, firstName + " " + lastName, code);

    if (!emailSent) {
      await prisma.user.delete({
        where: { id: user.id },
      });
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email for verification code.",
      userId: user.id,
      email: user.email,
    });

  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({
      message: "User was not created",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/authentication/verify:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Verifica el código de verificación enviado al correo del usuario.
 *     description: Permite al usuario verificar su cuenta usando el código de verificación que fue enviado por correo electrónico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 description: El código de verificación enviado al correo del usuario.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Cuenta verificada exitosamente y se genera un token de acceso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account verified successfully"
 *                 token:
 *                   type: string
 *                   description: El token JWT generado para el usuario.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZ...5hds7s"
 *       400:
 *         description: El código de verificación es incorrecto o ha expirado.
 *       404:
 *         description: El usuario no fue encontrado.
 *       500:
 *         description: Error al verificar la cuenta.
 */
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  try {
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (findUser?.login?.codeStatus === Status.ACTIVE) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    const now = new Date();
    if (now > findUser?.login?.codeExpires) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    if (findUser?.login?.code !== code) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    const token = generateToken({
      id: findUser?.id
    });

    await prisma.user.update({
      where: { id: findUser?.id },
      data: {
        login: {
          codeStatus: Status.ACTIVE,
          code: null
        }
      },
    });

    res.status(200).json({
      message: "Account verified successfully",
      token,
    });

  } catch (error) {
    console.log("Error during verification:", error);
    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/authentication/resend:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Reenvía el código de verificación al correo electrónico del usuario.
 *     description: Permite al usuario solicitar un nuevo código de verificación si el anterior ha expirado o si no lo ha recibido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: El código de verificación fue reenviado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code sent successfully. Please check your email."
 *       400:
 *         description: El correo electrónico es incorrecto o el usuario ya está verificado.
 *       404:
 *         description: El usuario no fue encontrado.
 *       500:
 *         description: Error al reenviar el código de verificación.
 */
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (findUser?.login?.codeStatus === Status.ACTIVE) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    const newCode = generateVerificationCode();
    const expirationTime = new Date(Date.now() + 15 * 60000);

    await prisma.user.update({
      where: { id: findUser?.id },
      data: {
        login: {
          code: newCode,
          codeExpires: expirationTime
        }
      },
    });

    const emailSent = await sendVerificationEmail(email, findUser?.firstName + " " + findUser?.lastName, newCode);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Verification code sent successfully. Please check your email.",
    });

  } catch (error) {
    console.log("Error resending code:", error);
    res.status(500).json({
      message: "Failed to resend verification code",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/authentication/signin:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Inicia sesión de un usuario.
 *     description: Permite a un usuario iniciar sesión proporcionando su correo electrónico y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: El token JWT generado para el usuario.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZ...5hds7s"
 *       400:
 *         description: Error en el inicio de sesión. El correo electrónico o la contraseña no coinciden.
 *       403:
 *         description: El usuario no ha verificado su cuenta. El código de verificación es necesario.
 *       404:
 *         description: El usuario no fue encontrado.
 *       500:
 *         description: Error al procesar el inicio de sesión.
 */
const signIn = async (req, res) => {
  let { email, password } = req.body;

  email = email?.toLowerCase().trim();

  if (!email || !password) {
    return res.status(400).json({
      message: "Both fields are required",
    });
  }

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
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

    if (!validatePassword || !findUser) {
      return res.status(400).json({
        message: "User or password incorrect",
      });
    }

    const token = generateToken({
      id: findUser?.id
    });

    res.status(200).json({
      message: "Login successfull",
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  signUp,
  signIn,
  verifyCode,
  resendVerificationCode
};