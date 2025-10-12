import React, { useState } from "react";

// *** Додано необхідні інтерфейси (можливо, їх потрібно імпортувати)
interface TripRange {
  id: string;
  start: number;
  end: number;
  city: string;
}

interface Employee {
  id: number;
  name: string;
  trips: TripRange[];
}

interface EmployersListProps {
  employees: Employee[];
  daysInMonth: number;
  // Змінюємо тип функції: тепер вона приймає всі дані форми
  addTripRange: (
    employeeId: number,
    start: number,
    end: number,
    city: string
  ) => void;
}

// Стан для одного рядка додавання
interface AddFormState {
  rangeStart: number | "";
  rangeEnd: number | "";
  selectedCity: string;
}

export const EmployersList: React.FC<EmployersListProps> = ({
  employees,
  daysInMonth,
  addTripRange,
}) => {
  // *** Ключова зміна: Стан для кожного працівника окремо
  const [formState, setFormState] = useState<Record<number, AddFormState>>(
    employees.reduce(
      (acc, emp) => ({
        ...acc,
        [emp.id]: { rangeStart: "", rangeEnd: "", selectedCity: "" },
      }),
      {}
    )
  );

  const handleInputChange = (
    employeeId: number,
    field: keyof AddFormState,
    value: string | number
  ) => {
    setFormState((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const handleAdd = (employeeId: number) => {
    const { rangeStart, rangeEnd, selectedCity } = formState[employeeId];
    const startNum = Number(rangeStart);
    const endNum = Number(rangeEnd);

    if (
      !startNum ||
      !endNum ||
      !selectedCity ||
      startNum > endNum ||
      startNum < 1 ||
      endNum > daysInMonth
    ) {
      alert("Некоректні дані для відрядження."); // Просто для прикладу
      return;
    }

    // Викликаємо функцію, передану з MonthView
    addTripRange(employeeId, startNum, endNum, selectedCity);

    // Скидаємо стан форми лише для цього працівника
    setFormState((prev) => ({
      ...prev,
      [employeeId]: { rangeStart: "", rangeEnd: "", selectedCity: "" },
    }));
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Додати нове відрядження</h3>
      <div className="flex flex-col gap-3">
        {employees.map((emp) => {
          const state = formState[emp.id];
          const canAdd =
            state.rangeStart !== "" &&
            state.rangeEnd !== "" &&
            state.selectedCity.trim() !== "" &&
            Number(state.rangeStart) <= Number(state.rangeEnd) &&
            Number(state.rangeStart) >= 1 &&
            Number(state.rangeEnd) <= daysInMonth;

          return (
            <div key={emp.id} className="flex gap-2 items-center">
              <span className="w-40 font-medium">{emp.name}:</span>
              <input
                type="number"
                placeholder="з (день)"
                value={state.rangeStart}
                onChange={(e) =>
                  handleInputChange(
                    emp.id,
                    "rangeStart",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-20 border rounded px-1 py-1"
                min={1}
                max={daysInMonth}
              />
              <input
                type="number"
                placeholder="до (день)"
                value={state.rangeEnd}
                onChange={(e) =>
                  handleInputChange(
                    emp.id,
                    "rangeEnd",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-20 border rounded px-1 py-1"
                min={1}
                max={daysInMonth}
              />
              <input
                type="text"
                placeholder="Місто"
                value={state.selectedCity}
                onChange={(e) =>
                  handleInputChange(emp.id, "selectedCity", e.target.value)
                }
                className="w-32 border rounded px-1 py-1"
              />
              <button
                onClick={() => handleAdd(emp.id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition disabled:bg-gray-400"
                disabled={!canAdd}
              >
                Додати
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};