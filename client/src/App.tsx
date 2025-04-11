import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/navbar";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import EntrepreneurDashboard from "@/pages/entrepreneur/dashboard";
import InvestorDashboard from "@/pages/investor/dashboard";
import CreatePitch from "@/pages/entrepreneur/create-pitch";
import MyPitches from "@/pages/entrepreneur/my-pitches";
import InterestedInvestors from "@/pages/entrepreneur/interested-investors";
import FeedbackPage from "@/pages/entrepreneur/feedback";
import AIMatchesPage from "@/pages/entrepreneur/ai-matches";
import PitchAnalyzerPage from "@/pages/entrepreneur/pitch-analyzer";
import BrowseStartups from "@/pages/investor/browse-startups";
import AIRecommendationsPage from "@/pages/investor/ai-recommendations";
import SavedStartups from "@/pages/investor/saved-startups";
import StartupDetails from "@/pages/startup";
import Profile from "@/pages/profile";
import LiveEvents from "@/pages/live-events";
import { useAuth } from "@/context/auth-context";

function App() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Check if current path is login or register to not display navbar
  const isAuthPage = location === "/login" || location === "/register";
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? "" : "pt-16 min-h-screen"}>
        <Switch>
          <Route path="/" component={() => {
            // Redirect based on user role
            if (!user) return <LoginPage />;
            return user.role === "entrepreneur" ? <EntrepreneurDashboard /> : <InvestorDashboard />;
          }} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          
          {/* Entrepreneur Routes */}
          <Route path="/dashboard" component={() => {
            return user?.role === "entrepreneur" ? <EntrepreneurDashboard /> : <InvestorDashboard />;
          }} />
          <Route path="/create-pitch" component={CreatePitch} />
          <Route path="/my-pitches" component={MyPitches} />
          <Route path="/pitch-analyzer" component={PitchAnalyzerPage} />
          <Route path="/interested-investors" component={InterestedInvestors} />
          <Route path="/feedback" component={FeedbackPage} />
          <Route path="/ai-matches" component={AIMatchesPage} />
          
          {/* Investor Routes */}
          <Route path="/browse-startups" component={BrowseStartups} />
          <Route path="/ai-recommendations" component={AIRecommendationsPage} />
          <Route path="/saved-startups" component={SavedStartups} />
          
          {/* Common Routes */}
          <Route path="/startup/:id" component={StartupDetails} />
          <Route path="/profile" component={Profile} />
          <Route path="/live-events" component={LiveEvents} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

export default App;
