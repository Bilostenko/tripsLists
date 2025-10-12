import Header from "./components/Header";
import MonthView from "./components/MonthView";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <MonthView />
      <footer className="border-t p-3 text-center text-xs text-muted-foreground">
        TravelTracker © 2025 | InterBilos
      </footer>
    </div>
  );
}

export default App;
