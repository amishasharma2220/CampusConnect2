import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyEvents from "./pages/MyEvents";
import Certificates from "./pages/Certificates";
import StudentProfile from "./pages/StudentProfile";
import ClubDashboard from "./pages/ClubDashboard";
import ClubTeam from "./pages/ClubTeam";
import ClubCompletedEvents from "./pages/ClubCompletedEvents";
import ClubAnalytics from "./pages/ClubAnalytics";
import ClubAttendance from "./pages/ClubAttendance";
import ClubBudget from "./pages/ClubBudget";
import CreateEvent from "./pages/CreateEvent";
import ManageEvents from "./pages/ManageEvents";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Clubs from "./pages/Clubs";
import AcademicCalendar from "./pages/AcademicCalendar";
import EventGuidelines from "./pages/EventGuidelines";
import ClubRegistration from "./pages/ClubRegistration";
import JoinClub from "./pages/JoinClub";
import AdminDashboard from "./pages/AdminDashboard";
import ExploreEvents from "./pages/ExploreEvents";
import HostEvent from "./pages/HostEvent";
import JoinCampusConnect from "./pages/JoinCampusConnect";
import LearnMore from "./pages/LearnMore";
import UniversityAdmin from "./pages/UniversityAdmin";
import VenueFinder from "./pages/VenueFinder";
import Leaderboard from "./pages/Leaderboard";
import EventRegister from "./pages/EventRegister";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";


const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<JoinCampusConnect />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/calendar" element={<AcademicCalendar />} />
          <Route path="/event-guidelines" element={<EventGuidelines />} />
          <Route path="/club-registration" element={<ClubRegistration />} />
          <Route path="/join-club" element={<JoinClub />} />
          <Route path="/explore-events" element={<ExploreEvents />} />
          <Route path="/host-event" element={<HostEvent />} />
          <Route path="/venues" element={<VenueFinder />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/event-register/:id" element={<EventRegister />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/university-admin" element={<UniversityAdmin />} />

          {/* Student Module */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/student/my-events" element={<MyEvents />} />
          <Route path="/student/certificates" element={<Certificates />} />
          <Route path="/student/profile" element={<StudentProfile />} />

          {/* Club / Admin Module */}
          <Route path="/club/dashboard" element={<ClubDashboard />} />
          <Route path="/club/team" element={<ClubTeam />} />
          <Route path="/club/completed" element={<ClubCompletedEvents />} />
          <Route path="/club/analytics" element={<ClubAnalytics />} />
          <Route path="/club/attendance" element={<ClubAttendance />} />
          <Route path="/club/budget" element={<ClubBudget />} />
          <Route path="/club/create-event" element={<CreateEvent />} />
          <Route path="/club/manage-events" element={<ManageEvents />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
