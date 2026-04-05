import ContactForm from "@/components/ContactForm";

export default function ContactsPage() {
  return (
    <section className="card">
      <h1>Контакты</h1>
      <p>Телефон: +7 (900) 123-45-67</p>
      <p>Email: harkov.dima2005@gmail.com</p>
      <p>Адрес: г. Москва, ул. Путешественников, 10</p>

      <h2 className="section-title">Форма обратной связи</h2>
      <p>Оставьте заявку, и менеджер свяжется с вами в ближайшее время.</p>
      <ContactForm />
    </section>
  );
}
