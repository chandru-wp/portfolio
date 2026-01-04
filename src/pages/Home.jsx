 import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Journey from "../components/Journey";
import Contact from "../components/Contact";
import Projects from "../components/Projects";
import GitHubProjects from "../components/GitHubProjects";
import GitHubProfile from "../components/GitHubProfile";
import FloatingAIButton from "../components/FloatingAIButton";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout, isAdmin } = useAuth();
  return (
    <main className="scroll-smooth bg-linear-to-br from-white via-[#f7f9ff] to-[#eef2ff]">

      {/* Navbar */}
      <Navbar />
 

      {/* Main Sections */}
      <section className="animate-fadeIn"><Hero /></section>
      <section className="animate-fadeIn delay-200"><Skills /></section>
      <section className="animate-fadeIn delay-200"><Projects /></section>
   
      <section className="animate-fadeIn delay-500"><Journey /></section>
      <section className="animate-fadeIn delay-600"><Contact /></section>
         <section className="animate-fadeIn delay-400"><GitHubProjects /></section>
          <section className="animate-fadeIn delay-300"><GitHubProfile /></section>

      {/* Floating AI Assistant Button */}
      <FloatingAIButton />

      {/* Extra spacing bottom */}
      
    </main>
  );
}
