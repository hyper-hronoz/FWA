import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Заполните все поля формы." },
        { status: 400 },
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !adminEmail) {
      return NextResponse.json(
        { message: "Не настроены SMTP переменные окружения." },
        { status: 500 },
      );
    }

    let nm: typeof import("nodemailer");
    try {
      const loaded = await import("nodemailer");
      nm = (loaded.default ?? loaded) as typeof import("nodemailer");
    } catch {
      return NextResponse.json(
        {
          message:
            "Пакет nodemailer не установлен. В корне проекта выполните: npm install nodemailer",
        },
        { status: 500 },
      );
    }

    const transporter = nm.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"Турагенство Без детей" <${smtpUser}>`,
      to: adminEmail,
      subject: "Новая заявка с сайта",
      text: `Имя: ${name}\nEmail: ${email}\nСообщение: ${message}`,
    });

    return NextResponse.json({ message: "Письмо отправлено." }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Ошибка сервера при отправке письма." },
      { status: 500 },
    );
  }
}
