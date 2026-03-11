import type { Profile } from "../types/Profile"

export const profiles: Profile[] = [
  {
    id: 1,
    name: "Мику",
    age: 18,
    gender: "female",
    image: "https://i.pinimg.com/564x/3a/7b/3c/3a7b3c5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Люблю петь и играть на синтезаторе! Ищу того, кто оценит мою музыку 🎵",
    interests: ["Музыка", "Аниме", "Косплей"],
    favoriteAnime: "Vocaloid"
  },
  {
    id: 2,
    name: "Сакура",
    age: 19,
    gender: "female",
    image: "https://i.pinimg.com/564x/4b/8c/2d/4b8c2d5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Цветущая сакура и сладости - моя страсть. Ищу того, с кем можно разделить сладкие моменты 🍡",
    interests: ["Сладости", "Фотография", "Природа"],
    favoriteAnime: "Cardcaptor Sakura"
  },
  {
    id: 3,
    name: "Рен",
    age: 20,
    gender: "male",
    image: "https://i.pinimg.com/564x/5c/9d/3e/5c9d3e5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Косплеер и любитель аниме. Могу говорить цитатами из Наруто часами!",
    interests: ["Косплей", "Манга", "Игры"],
    favoriteAnime: "Naruto"
  },
  {
    id: 4,
    name: "Асуна",
    age: 17,
    gender: "female",
    image: "https://i.pinimg.com/564x/6d/ae/4f/6dae4f5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Готовлю лучше всех в Айнкраде! Ищу своего Кир... то есть, своего героя! ⚔️",
    interests: ["Готовка", "VR", "Мечи"],
    favoriteAnime: "Sword Art Online"
  },
  {
    id: 5,
    name: "Леви",
    age: 22,
    gender: "male",
    image: "https://i.pinimg.com/564x/7e/bf/5a/7ebf5a5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Чистота - залог здоровья. Ищу того, кто не боится уборки и титанов! 🧹",
    interests: ["Чистота", "Чай", "Разведка"],
    favoriteAnime: "Attack on Titan"
  },
  {
    id: 6,
    name: "Румия",
    age: 18,
    gender: "female",
    image: "https://i.pinimg.com/564x/8f/cd/6b/8fcd6b5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Тусуюсь в Сиббуе, ищу компанию для фотосессий и шопинга! 🛍️",
    interests: ["Мода", "Фото", "Тусовки"],
    favoriteAnime: "NANA"
  },
  {
    id: 7,
    name: "Гоу",
    age: 21,
    gender: "female",
    image: "https://i.pinimg.com/564x/9f/de/7c/9fde7c5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Бег - моя жизнь! Ищу того, кто составит компанию в марафоне 🏃‍♀️",
    interests: ["Спорт", "Путешествия", "Приключения"],
    favoriteAnime: "Pokemon Journeys"
  },
  {
    id: 8,
    name: "Дэндзи",
    age: 19,
    gender: "male",
    image: "https://i.pinimg.com/564x/ae/ef/8d/aeef8d5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Работаю охотником на демонов. Люблю тосты с джемом. Есть интересное предложение? 🍞",
    interests: ["Еда", "Цепи", "Демоны"],
    favoriteAnime: "Chainsaw Man"
  },
  {
    id: 9,
    name: "Фурин",
    age: 20,
    gender: "female",
    image: "https://i.pinimg.com/564x/bf/fd/9e/bffd9e5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Ищу того, кто будет смотреть со мной звёзды и мечтать о космосе ✨",
    interests: ["Астрономия", "Рисование", "Мечты"],
    favoriteAnime: "Your Name"
  },
  {
    id: 10,
    name: "Харухи",
    age: 17,
    gender: "female",
    image: "https://i.pinimg.com/564x/cd/ae/af/cdaeaf5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Ищу необычных людей! Инопланетяне, путешественники во времени, приветствуются! 👽",
    interests: ["Приключения", "Загадки", "Паранормальное"],
    favoriteAnime: "The Melancholy of Haruhi Suzumiya"
  }
]

// Функция для получения случайных профилей
export const getRandomProfiles = (count: number = 5): Profile[] => {
  const shuffled = [...profiles].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
