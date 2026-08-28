import { GetMe } from "@/features";

function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <GetMe />
    </div>
  );
}

export default ProfilePage;
