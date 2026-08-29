import { GetMe } from "@/features";
import CreateAdminWd from "@/widgets/adminWd/create";

function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <GetMe />
      <CreateAdminWd />
    </div>
  );
}

export default ProfilePage;
