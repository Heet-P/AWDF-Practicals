import NavBar from './components/NavBar.jsx';
import Header from './components/Header.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Footer from './components/Footer.jsx';

// All page data lives here and flows down to the components as props.
const profile = {
  name: 'Heet',
  tagline: 'B.Tech student building for the web.',
  bio: 'I am a student at CHARUSAT exploring modern web development. I enjoy turning ideas into small, fast and well-structured interfaces with React.',
  email: 'student@charusat.edu.in',
};

const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'Git'];

const projects = [
  { title: 'Weather Widget', description: 'A small app that shows the current forecast for any city.' },
  { title: 'Expense Tracker', description: 'Tracks daily spending and groups it by category.' },
  { title: 'Quiz Game', description: 'A timed multiple-choice quiz with a score board.' },
];

const sections = ['about', 'skills', 'projects'];

export default function App() {
  return (
    <>
      <NavBar sections={sections} />
      <main className="container">
        <Header name={profile.name} tagline={profile.tagline} themeColor="#ff5b1f" />
        <About bio={profile.bio} />
        <Skills skillList={skills} />
        <Projects projects={projects} />
      </main>
      <Footer name={profile.name} email={profile.email} />
    </>
  );
}
