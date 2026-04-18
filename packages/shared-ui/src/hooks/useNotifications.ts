import type { Chan } from "@shared/Profile"

export function useNotifications() {
  const notifyLike = (chan: Chan) => {
    if (Notification.permission === "granted") {
      new Notification("Новый лайк ❤️", {
        body: `Ты лайкнул ${chan.username}`,
        icon: chan.avatar
      })
    }
  }

  return { notifyLike }
}
