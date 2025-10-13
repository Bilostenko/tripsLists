import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
// Припускаємо, що EmployersList був оновлений відповідно до попередньої відповіді
import { EmployersList } from "./EmployersList";

// --- Типи та константи ---
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
  id: string; // Унікальний ID
  start: number;
  end: number;
  city: string;
}

interface Employee {
  id: number;
  name: string;
  trips: TripRange[];
}

// Функція генерації ID
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

// --- Компонент Модалки Редагування ---
interface EditTripModalProps {
  trip: TripRange;
  employeeName: string;
  onSave: (
    tripId: string,
    employeeId: number,
    newTrip: Partial<TripRange>
  ) => void;
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
  // Локальний стан модалки
  const [start, setStart] = useState(trip.start);
  const [end, setEnd] = useState(trip.end);
  const [city, setCity] = useState(trip.city);

  const handleSave = () => {
    // Додано додаткову валідацію, що діапазон є коректним
    if (start < 1 || end > maxDay || start > end || !city) return;
    onSave(trip.id, employeeId, { start, end, city });
    onClose();
  };

  const handleDelete = () => {
    onDelete(trip.id, employeeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-30">
      {" "}
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200 pointer-events-auto">
        {" "}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          {" "}
          <h3 className="text-lg font-semibold">
            Редагування відрядження для {employeeName}
          </h3>{" "}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />{" "}
          </button>{" "}
        </div>{" "}
        <div className="space-y-4">
          {" "}
          <label className="block">
            {" "}
            <span className="text-sm font-medium text-gray-700">
              Місто
            </span>{" "}
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />{" "}
          </label>{" "}
          <div className="flex gap-4">
            {" "}
            <label className="block">
              {" "}
              <span className="text-sm font-medium text-gray-700">
                З дня
              </span>{" "}
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                min={1}
                max={maxDay}
              />{" "}
            </label>{" "}
            <label className="block">
              {" "}
              <span className="text-sm font-medium text-gray-700">
                До дня
              </span>{" "}
              <input
                type="number"
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                min={1}
                max={maxDay}
              />{" "}
            </label>{" "}
          </div>{" "}
        </div>{" "}
        <div className="mt-6 flex justify-between">
          {" "}
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Видалити{" "}
          </button>{" "}
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Зберегти зміни{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

// --- Основний компонент ---
export default function MonthView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // СТАН ПРАЦІВНИКІВ

  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Соцький Руслан", trips: [] },
    { id: 2, name: "Левчук Станіслав", trips: [] },
    { id: 3, name: "Білостенко Дмитро", trips: [] },
    { id: 4, name: "Горбач Дмитро", trips: [] },
    { id: 5, name: "Чолак Євгенія", trips: [] },
    { id: 6, name: "Бирся Денис", trips: [] },
    { id: 7, name: "Сакаль Андрй", trips: [] },
    { id: 8, name: "Максименко Володимир", trips: [] },
  ]);

  interface EditingTripState {
    employeeId: number;
    trip: TripRange;
    employeeName: string;
  }
  const [editingTrip, setEditingTrip] = useState<EditingTripState | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1); // --- Функції навігації ---

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
  }; // --- CRUD Логіка --- // *** ОНОВЛЕННЯ: Функція addTripRange приймає всі дані як аргументи ***

  const addTripRange = (
    employeeId: number,
    startNum: number,
    endNum: number,
    selectedCity: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;

        return {
          ...emp,
          trips: [
            ...emp.trips,
            {
              id: generateUniqueId(),
              start: startNum,
              end: endNum,
              city: selectedCity,
            },
          ],
        };
      })
    );
  }; // Початок редагування (виклик при кліку на клітинку з ✈️)

  const startEditTrip = (employee: Employee, trip: TripRange) => {
    setEditingTrip({
      employeeId: employee.id,
      employeeName: employee.name,
      trip: trip,
    });
  }; // Редагування відрядження (з модалки)

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
  }; // Видалення відрядження (з модалки)

  const removeTripRange = (tripId: string, employeeId: number) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, trips: emp.trips.filter((t) => t.id !== tripId) }
          : emp
      )
    );
    setEditingTrip(null);
  }; // --- Рендер ---

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Панель додавання відрядження */}{" "}
      <EmployersList
        employees={employees}
        daysInMonth={daysInMonth} // Передаємо оновлену функцію
        addTripRange={addTripRange} // *** ВИДАЛЕНО: rangeStart, setRangeStart, rangeEnd, setRangeEnd, selectedCity, setSelectedCity ***
      />
      {/* Навігація */}{" "}
      <div className="flex items-center justify-between">
        {" "}
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded hover:bg-gray-200 transition text-gray-100"
        >
          <FiArrowLeft size={24} />{" "}
        </button>{" "}
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}{" "}
        </h2>{" "}
        <button
          onClick={handleNextMonth}
          className="p-2 rounded hover:bg-gray-200 transition text-gray-100"
        >
          <FiArrowRight size={24} />{" "}
        </button>{" "}
      </div>
      {/* Таблиця */}{" "}
      <Card className="overflow-x-auto shadow-md">
        {" "}
        <CardContent>
          {" "}
          <div className="min-w-max">
            {/* Шапка */}{" "}
            <div
              className="grid border-b pb-2 font-semibold text-sm bg-gray-50"
              style={{
                gridTemplateColumns: `200px repeat(${daysInMonth}, 40px)`,
              }}
            >
              <div className="pl-2">Працівник</div>{" "}
              {daysArray.map((day) => (
                <div
                  key={day}
                  className={`text-center ${
                    isWeekend(day) ? "text-red-600" : ""
                  }`}
                >
                  {day}{" "}
                </div>
              ))}{" "}
            </div>
            {/* Рядки працівників */}{" "}
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="grid border-b last:border-0 text-sm"
                style={{
                  gridTemplateColumns: `200px repeat(${daysInMonth}, 40px)`,
                }}
              >
                {" "}
                <div className="pl-2 py-1 font-medium text-gray-800">
                  {emp.name}{" "}
                </div>{" "}
                {daysArray.map((day) => {
                  const weekend = isWeekend(day);

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
                      title={
                        trip
                          ? `${trip.city} (${trip.start}-${trip.end})`
                          : undefined
                      }
                      onClick={() => selected && startEditTrip(emp, trip)}
                    >
                      {" "}
                      {selected ? (
                        <div className="text-sm">
                          ✈️ {trip.city.slice(0, 3)}{" "}
                        </div>
                      ) : (
                        ""
                      )}{" "}
                    </div>
                  );
                })}{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>
      {/* Модалка редагування */}{" "}
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
      )}{" "}
    </div>
  );
}
