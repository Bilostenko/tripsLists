import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi"; // Додано FiX

const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

interface TripRange {
  id: string; // Унікальний ID для ідентифікації при редагуванні/видаленні
  start: number;
  end: number;
  city: string;
}

interface Employee {
  id: number;
  name: string;
  trips: TripRange[];
}

// Допоміжна функція для генерації унікального ID
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

// --- Компонент Модалки Редагування ---
interface EditTripModalProps {
  trip: TripRange;
  employeeName: string;
  onSave: (tripId: string, employeeId: number, newTrip: Partial<TripRange>) => void;
  onDelete: (tripId: string, employeeId: number) => void;
  onClose: () => void;
  employeeId: number;
  maxDay: number;
}

const EditTripModal: React.FC<EditTripModalProps> = ({
  trip,
  employeeName,
  onSave,
  onDelete,
  onClose,
  employeeId,
  maxDay,
}) => {
  const [start, setStart] = useState(trip.start);
  const [end, setEnd] = useState(trip.end);
  const [city, setCity] = useState(trip.city);

  const handleSave = () => {
    // Проста валідація
    if (start < 1 || end > maxDay || start > end || !city) return;
    onSave(trip.id, employeeId, { start, end, city });
  };

  const handleDelete = () => {
    onDelete(trip.id, employeeId);
  };

  return (
    // ЗМІНА ТУТ: видалено клас bg-gray-600 bg-opacity-50, додано абсолютне позиціонування
    <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200 pointer-events-auto transform translate-y-[-50px] transition-all duration-300 ease-out">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">
            Редагування відрядження для {employeeName}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Місто</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </label>
          <div className="flex gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">З дня</span>
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                min={1}
                max={maxDay}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">До дня</span>
              <input
                type="number"
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                min={1}
                max={maxDay}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Видалити
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Основний компонент ---
export default function MonthView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Іваненко Іван",
      trips: [{ id: generateUniqueId(), start: 2, end: 5, city: "Прага" }],
    },
    {
      id: 2,
      name: "Петренко Петро",
      trips: [{ id: generateUniqueId(), start: 3, end: 7, city: "Франкфурт" }],
    },
    { id: 3, name: "Коваленко Олег", trips: [] },
  ]);

  // Стан для додавання нового відрядження
  const [rangeStart, setRangeStart] = useState<number | "">("");
  const [rangeEnd, setRangeEnd] = useState<number | "">("");
  const [selectedCity, setSelectedCity] = useState("");

  // Стан для редагування
  interface EditingTripState {
    employeeId: number;
    trip: TripRange;
    employeeName: string;
  }
  const [editingTrip, setEditingTrip] = useState<EditingTripState | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- Функції навігації ---
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };

  // --- CRUD Логіка ---

  // Додавання відрядження на діапазон
  const addTripRange = (employeeId: number) => {
    const startNum = Number(rangeStart);
    const endNum = Number(rangeEnd);

    if (!startNum || !endNum || !selectedCity || startNum > endNum || startNum < 1 || endNum > daysInMonth) return;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;

        return {
          ...emp,
          trips: [
            ...emp.trips,
            { id: generateUniqueId(), start: startNum, end: endNum, city: selectedCity },
          ],
        };
      })
    );

    setRangeStart("");
    setRangeEnd("");
    setSelectedCity("");
  };

  // Початок редагування (виклик при кліку на клітинку з ✈️)
  const startEditTrip = (employee: Employee, trip: TripRange) => {
    setEditingTrip({
      employeeId: employee.id,
      employeeName: employee.name,
      trip: trip,
    });
  };

  // Редагування відрядження (з модалки)
  const editTripRange = (
    tripId: string,
    employeeId: number,
    newTripData: Partial<TripRange>
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;

        const updatedTrips = emp.trips.map((t) =>
          t.id === tripId ? { ...t, ...newTripData } : t
        );

        return { ...emp, trips: updatedTrips };
      })
    );
    setEditingTrip(null);
  };

  // Видалення відрядження (з модалки)
  const removeTripRange = (tripId: string, employeeId: number) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, trips: emp.trips.filter((t) => t.id !== tripId) }
          : emp
      )
    );
    setEditingTrip(null);
  };

  // --- Рендер ---
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Навігація */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded hover:bg-gray-200 transition text-gray-100"
        >
          <FiArrowLeft size={24} />
        </button>

        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded hover:bg-gray-200 transition text-gray-100"
        >
          <FiArrowRight size={24} />
        </button>
      </div>

      {/* Таблиця */}
      <Card className="overflow-x-auto shadow-md">
        <CardContent>
          <div className="min-w-max">
            {/* Шапка */}
            <div
              className="grid border-b pb-2 font-semibold text-sm bg-gray-50"
              style={{
                gridTemplateColumns: `200px repeat(${daysInMonth}, 40px)`,
              }}
            >
              <div className="pl-2">Працівник</div>
              {daysArray.map((day) => (
                <div
                  key={day}
                  className={`text-center ${
                    isWeekend(day) ? "text-red-600" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Рядки працівників */}
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="grid border-b last:border-0 text-sm"
                style={{
                  gridTemplateColumns: `200px repeat(${daysInMonth}, 40px)`,
                }}
              >
                <div className="pl-2 py-1 font-medium text-gray-800">
                  {emp.name}
                </div>

                {daysArray.map((day) => {
                  const weekend = isWeekend(day);

                  // Знаходимо відрядження для цього дня. Беремо перше знайдене.
                  const trip = emp.trips.find(
                    (t) => day >= t.start && day <= t.end
                  );
                  const selected = !!trip;

                  return (
                    <div
                      key={day}
                      className={`text-center cursor-pointer py-1 transition-colors duration-150
                          ${selected ? "bg-gray-800 text-white" : ""}
                          ${!selected && weekend ? "bg-red-100" : ""}
                          ${!selected && !weekend ? "hover:bg-gray-100" : ""}
                        `}
                      title={trip ? `${trip.city} (${trip.start}-${trip.end})` : undefined}
                      // Клік відкриває модалку, якщо є відрядження
                      onClick={() => selected && startEditTrip(emp, trip)}
                    >
                      {selected ? (
                        <div className="text-sm">
                          ✈️ {trip.city.slice(0, 3)}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Панель додавання відрядження (залишив для простоти додавання) */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Додати нове відрядження</h3>
        <div className="flex flex-col gap-3">
          {employees.map((emp) => (
            <div key={emp.id} className="flex gap-2 items-center">
              <span className="w-40 font-medium">{emp.name}:</span>
              <input
                type="number"
                placeholder="з (день)"
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value))}
                className="w-20 border rounded px-1 py-1"
                min={1}
                max={daysInMonth}
              />
              <input
                type="number"
                placeholder="до (день)"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value))}
                className="w-20 border rounded px-1 py-1"
                min={1}
                max={daysInMonth}
              />
              <input
                type="text"
                placeholder="Місто"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-32 border rounded px-1 py-1"
              />
              <button
                onClick={() => addTripRange(emp.id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                disabled={!rangeStart || !rangeEnd || !selectedCity}
              >
                Додати
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Модалка редагування */}
      {editingTrip && (
        <EditTripModal
          trip={editingTrip.trip}
          employeeName={editingTrip.employeeName}
          onSave={editTripRange}
          onDelete={removeTripRange}
          onClose={() => setEditingTrip(null)}
          employeeId={editingTrip.employeeId}
          maxDay={daysInMonth}
        />
      )}
    </div>
  );
}