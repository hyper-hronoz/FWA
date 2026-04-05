import type { Chan } from "@shared/Profile"

export const profiles: Chan[] = [
  {
    id: 1,
    username: "Мику",
    age: 18,
    video: "/videos/test1.mp4",
    avatar: "https://i.pinimg.com/564x/3a/7b/3c/3a7b3c5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Люблю петь и играть на синтезаторе! Ищу того, кто оценит мою музыку 🎵",
    interests: ["Музыка", "Аниме", "Косплей"],
    favoriteAnime: "Vocaloid"
  },
  {
    id: 2,
    username: "Сакура",
    age: 19,
    video: "/videos/test2.mp4",
    avatar: "https://i.pinimg.com/564x/4b/8c/2d/4b8c2d5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Цветущая сакура и сладости - моя страсть. Ищу того, с кем можно разделить сладкие моменты 🍡",
    interests: ["Сладости", "Фотография", "Природа"],
    favoriteAnime: "Cardcaptor Sakura"
  },
  {
    id: 3,
    username: "Рен",
    age: 20,
    video: "/videos/test3.mp4",
    avatar: "https://i.pinimg.com/564x/5c/9d/3e/5c9d3e5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Косплеер и любитель аниме. Могу говорить цитатами из Наруто часами!",
    interests: ["Косплей", "Манга", "Игры"],
    favoriteAnime: "Naruto"
  },
  {
    id: 4,
    username: "Асуна",
    age: 17,
    video: "/videos/test1.mp4",
    avatar: "https://i.pinimg.com/564x/6d/ae/4f/6dae4f5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Готовлю лучше всех в Айнкраде! Ищу своего Кир... то есть, своего героя! ⚔️",
    interests: ["Готовка", "VR", "Мечи"],
    favoriteAnime: "Sword Art Online"
  },
  {
    id: 5,
    username: "Леви",
    age: 22,
    video: "/videos/test2.mp4",
    avatar: "https://i.pinimg.com/564x/7e/bf/5a/7ebf5a5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Чистота - залог здоровья. Ищу того, кто не боится уборки и титанов! 🧹",
    interests: ["Чистота", "Чай", "Разведка"],
    favoriteAnime: "Attack on Titan"
  },
  {
    id: 6,
    username: "Румия",
    age: 18,
    video: "/videos/test3.mp4",
    avatar: "https://i.pinimg.com/564x/8f/cd/6b/8fcd6b5f5b5c5b5c5b5c5b5c5b5c5b5c.jpg",
    bio: "Тусуюсь в Сиббуе, ищу компанию для фотосессий и шопинга! 🛍️",
    interests: ["Мода", "Фото", "Тусовки"],
    favoriteAnime: "NANA"
  }
]

export const getRandomProfiles = (count: number = 5): Chan[] => {
  const shuffled = [...profiles].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
