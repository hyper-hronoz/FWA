import { Navigate, Route, Routes } from "react-router-dom";

import {
  FinishScreen,
  ProfileSettingsPage,
  SwipeScreen,
  useChan
} from "@fwa/shared-ui";

export default function AppRoutes() {
  const { availableProfiles, matches, handleLike, handleSkip, handleRestart, refetch } = useChan();

  return (
    <Routes>
      <Route
        path="swipe"
        element={
          <SwipeScreen
            chan={availableProfiles[0]}
            onLike={handleLike}
            onSkip={handleSkip}
            refetch={refetch}
          />
        }
      />
      <Route path="settings" element={<ProfileSettingsPage />} />
      <Route
        path="finish"
        element={
          <div className="px-4 py-10">
            <FinishScreen
              matches={matches}
              total={Math.max(availableProfiles.length + matches.length, 1)}
              onRestart={handleRestart}
            />
          </div>
        }
      />
      <Route path="*" element={<Navigate to="swipe" replace />} />
    </Routes>
  );
}
