import { Route, Routes } from "react-router-dom";

import { API_BASE_URL, LikedPage, ROUTES, useAuthContext } from "@fwa/shared-ui";

import type { Chan } from "@shared/Profile";

export default function AppRoutes() {
  const { authFetch } = useAuthContext();

  const handleSkip = async (profile: Chan) => {
    try {
      const response = await authFetch(`${API_BASE_URL}${ROUTES.girls.unlike(profile.id)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Не удалось убрать карточку из лайкнутых");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Routes>
      <Route path="*" element={<LikedPage onSkip={handleSkip} />} />
    </Routes>
  );
}
