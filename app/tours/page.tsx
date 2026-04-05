const tours = [
  {
    title: "Турция, Анталия",
    description: "7 ночей, all inclusive, перелет и трансфер включены.",
  },
  {
    title: "ОАЭ, Дубай",
    description: "5 ночей в отеле 4*, экскурсия по современному Дубаю.",
  },
  {
    title: "Россия, Сочи",
    description: "Отдых у моря и горные маршруты, идеален для семей.",
  },
];

export default function ToursPage() {
  return (
    <div>
      <h1 className="section-title">Популярные направления</h1>
      <section className="grid">
        {tours.map((tour) => (
          <article className="card" key={tour.title}>
            <h3>{tour.title}</h3>
            <p>{tour.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
