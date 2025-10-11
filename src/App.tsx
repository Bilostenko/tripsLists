import Header from "./components/Header";
import MonthView from "./components/MonthView";
import { EmployersList } from "./components/EmployersList";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <EmployersList />
      <MonthView />
      {/* FOOTER */}
      <footer className="border-t p-3 text-center text-xs text-muted-foreground">
        TravelTracker © 2025 | InterBilos
      </footer>
    </div>
  );
}

export default App;
