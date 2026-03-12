export function useNotifications() {
  const notifyLike = (profile) => {
    if (Notification.permission === "granted") {
      new Notification("Новый лайк ❤️", {
        body: `Ты лайкнул ${profile.name}`,
        icon: profile.image
      })
    }
  }

  return { notifyLike }
}
