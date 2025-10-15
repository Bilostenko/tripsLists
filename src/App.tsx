import Header from "./components/Header";
import MonthView from "./components/MonthView";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <MonthView />
    </div>
  );
}

export default App;
