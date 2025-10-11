import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const EmployersList: React.FC = () => {
  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* MAIN */}
  <main className="flex-grow flex justify-center items-start p-6">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-medium mb-2">Список працівників</h2>

            {/* Форма додавання */}
            <div className="flex gap-2">
              <Input placeholder="Введіть прізвище працівника" />
              <Button>Додати</Button>
            </div>

            {/* Список працівників */}
            <ul className="list-disc pl-6 mt-4 text-sm text-muted-foreground">
              <li>Іваненко Іван</li>
              <li>Петренко Петро</li>
              <li>Коваленко Олег</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
