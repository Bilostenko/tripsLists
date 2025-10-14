import React, { useState, useEffect } from "react";
import type { EmployeeData as Employee } from "@/types/index"; // EmployeeData не має trips!
interface EmployersListProps {
  employees: Employee[]; 
  daysInMonth: number;
  addTripRange: (
    employeeId: number,
    start: number,
    end: number,
    city: string
  ) => void;
}

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
  const [formState, setFormState] = useState<Record<number, AddFormState>>({});

  useEffect(() => {
    // Скидаємо/ініціалізуємо форму при зміні списку працівників (наприклад, після завантаження)
    const initialFormState = employees.reduce(
      (acc, emp) => ({
        ...acc,
        [emp.id]: { rangeStart: "", rangeEnd: "", selectedCity: "" },
      }),
      {}
    );
    setFormState(initialFormState);
  }, [employees]);
  const handleInputChange = (
    employeeId: number,
    field: keyof AddFormState,
    value: string | number
  ) => {
    if (!formState[employeeId]) return; 

    setFormState((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const handleAdd = (employeeId: number) => {
    const state = formState[employeeId];
    
    if (!state) return;

    const { rangeStart, rangeEnd, selectedCity } = state;
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
      alert("Некоректні дані для відрядження.");
      return;
    }

    addTripRange(employeeId, startNum, endNum, selectedCity);

    setFormState((prev) => ({
      ...prev,
      [employeeId]: { rangeStart: "", rangeEnd: "", selectedCity: "" },
    }));
  };

  return (
    <div className="border p-2 rounded bg-gray-50 text-sm w-full lg:max-w-7xl xl:max-w-full mx-auto">
      <h3 className="text-xl font-semibold mb-2">Додати нове відрядження</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-1">
        {employees.map((emp) => {
          const state = formState[emp.id];
          
          if (!state) return null; 

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