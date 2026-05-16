import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata = {
  title: "Mon Profil | AbsenceFlow",
  description: "Gérez vos informations personnelles et vos paramètres de sécurité.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <p className="text-slate-500 mt-2">
          Gérez vos informations personnelles et vos paramètres de sécurité.
        </p>
      </div>

      <div className="max-w-4xl">
        <ProfileForm />
      </div>
    </div>
  );
}
