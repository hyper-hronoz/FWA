"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Ошибка отправки сообщения.");
      }

      setStatus("Сообщение успешно отправлено. Мы свяжемся с вами.");
      setForm(initialState);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Не удалось отправить форму.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Ваше имя"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Ваш email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        required
      />
      <textarea
        placeholder="Ваше сообщение"
        rows={5}
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Отправка..." : "Отправить"}
      </button>
      {status ? <p>{status}</p> : null}
    </form>
  );
}
