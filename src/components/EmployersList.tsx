import React, { useState } from "react";

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
  <div className="border p-2 rounded bg-gray-50 text-sm w-full sm:max-w-[50vw] mx-auto">
      <h3 className="text-xl font-semibold mb-2">Додати нове відрядження</h3>

      {/* responsive grid: 1 column on very small, 2 on small, 3 on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
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
            <div
              key={emp.id}
              className="bg-white border rounded p-2 flex flex-col gap-2"
            >
              <div className="font-medium text-xl truncate">{emp.name}</div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="з"
                  value={state.rangeStart}
                  onChange={(e) =>
                    handleInputChange(
                      emp.id,
                      "rangeStart",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-14 border rounded px-1 py-0.5 text-sm"
                  min={1}
                  max={daysInMonth}
                />
                <span className="text-sm">—</span>
                <input
                  type="number"
                  placeholder="до"
                  value={state.rangeEnd}
                  onChange={(e) =>
                    handleInputChange(
                      emp.id,
                      "rangeEnd",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-14 border rounded px-1 py-0.5 text-sm"
                  min={1}
                  max={daysInMonth}
                />
              </div>

              <input
                type="text"
                placeholder="Місто"
                value={state.selectedCity}
                onChange={(e) =>
                  handleInputChange(emp.id, "selectedCity", e.target.value)
                }
                className="border rounded px-1 py-0.5 text-sm w-full"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => handleAdd(emp.id)}
                  className="bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 transition disabled:bg-gray-400 text-sm"
                  disabled={!canAdd}
                >
                  Додати
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};