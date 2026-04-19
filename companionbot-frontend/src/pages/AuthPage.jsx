import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <AuthForm />
      </div>
    </>
  );
}
