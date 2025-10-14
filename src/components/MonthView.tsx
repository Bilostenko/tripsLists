// MonthView.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";

import { EmployersList } from "./EmployersList";
import { db } from "@/firebase/config"; 
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    doc 
} from "firebase/firestore";

import type { 
    TripRange, 
    EmployeeData,          
    EmployeeWithTrips,    
    EditingTripState      
} from "@/types/index"; 

interface LoadedTripData extends TripRange {
    employeeId: number;
}

const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];


// ---  Модалка Редагування --- 
interface EditTripModalProps {
    trip: TripRange;
    employeeName: string;
    onSave: (tripId: string, employeeId: number, newTrip: Partial<TripRange>) => void;
    onDelete: (tripId: string) => void;
    onClose: () => void;
    employeeId: number;
    maxDay: number;
}

const EditTripModal: React.FC<EditTripModalProps> = ({
    trip, employeeName, onSave, onDelete, onClose, employeeId, maxDay,
}) => {
    const [start, setStart] = useState(trip.start);
    const [end, setEnd] = useState(trip.end);
    const [city, setCity] = useState(trip.city);

    const handleSave = () => {
        if (start < 1 || end > maxDay || start > end || !city) return;
        onSave(trip.id, employeeId, { start, end, city });
        onClose();
    };

    const handleDelete = () => {
        onDelete(trip.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200 pointer-events-auto">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-semibold">
                        Редагування відрядження для {employeeName}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-100">
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
                                min={1} max={maxDay}
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">До дня</span>
                            <input
                                type="number"
                                value={end}
                                onChange={(e) => setEnd(Number(e.target.value))}
                                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                min={1} max={maxDay}
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

export default function MonthView() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const [allEmployees, setAllEmployees] = useState<EmployeeData[]>([]); 
    const [employeesWithTrips, setEmployeesWithTrips] = useState<EmployeeWithTrips[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTrip, setEditingTrip] = useState<EditingTripState | null>(null);

    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
    const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

    // --- ЗАВАНТАЖЕННЯ ДАНИХ (FETCH DATA) ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        let currentEmployees = allEmployees;

        try {
            // 1. Завантажити список усіх працівників
            if (currentEmployees.length === 0) {
                const empSnapshot = await getDocs(collection(db, "employees"));
                const loadedEmployees = empSnapshot.docs.map(d => ({ 
                    id: d.data().employeeId, 
                    name: d.data().name,
                })) as EmployeeData[]; 
                setAllEmployees(loadedEmployees);
                currentEmployees = loadedEmployees;
            }
            
            if (currentEmployees.length === 0) {
                setEmployeesWithTrips([]);
                setIsLoading(false);
                return;
            }

            // 2. Завантажити відрядження для ПОТОЧНОГО місяця та року
            const tripsRef = collection(db, "trips");
            const q = query(
                tripsRef,
                where("year", "==", year),
                where("month", "==", month) 
            );
            const tripSnapshot = await getDocs(q);
            
            const loadedTrips: LoadedTripData[] = tripSnapshot.docs.map(d => ({ 
                id: d.id, 
                start: d.data().startDay, 
                end: d.data().endDay,
                city: d.data().city,
                employeeId: d.data().employeeId 
            })) as LoadedTripData[];

            // 3. Згрупувати відрядження за працівником
            const groupedTrips: EmployeeWithTrips[] = currentEmployees.map(emp => {
                const employeeTrips = loadedTrips
                    .filter(t => t.employeeId === emp.id)
                    .map(t => ({ id: t.id, start: t.start, end: t.end, city: t.city }));
                return {
                    ...emp,
                    trips: employeeTrips 
                };
            });
            
            setEmployeesWithTrips(groupedTrips);

        } catch (error) {
            console.error("Помилка завантаження даних:", error);
        } finally {
            setIsLoading(false);
        }
    }, [year, month, allEmployees.length]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]); 

    const addTripRange = async (
        employeeId: number, 
        startNum: number, 
        endNum: number, 
        selectedCity: string
    ) => {
        try {
            await addDoc(collection(db, "trips"), {
                employeeId,
                startDay: startNum,
                endDay: endNum,
                city: selectedCity,
                year: year,
                month: month,
            });
            fetchData(); 
        } catch (e) {
            console.error("Помилка додавання відрядження: ", e);
        }
    };

    const editTripRange = async (
        tripId: string,
        employeeId: number, 
        newTripData: Partial<TripRange>
    ) => {
        try {
            const tripDocRef = doc(db, "trips", tripId);
            await updateDoc(tripDocRef, {
                startDay: newTripData.start,
                endDay: newTripData.end,
                city: newTripData.city
            });
            fetchData();
        } catch (e) {
            console.error("Помилка редагування: ", e);
        }
        setEditingTrip(null);
    };

    const removeTripRange = async (tripId: string) => {
        try {
            const tripDocRef = doc(db, "trips", tripId);
            await deleteDoc(tripDocRef);
            fetchData();
        } catch (e) {
            console.error("Помилка видалення: ", e);
        }
        setEditingTrip(null);
    };

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
            return newDate;
        });
    };

    const isWeekend = (day: number) => {
        const date = new Date(year, month, day);
        const weekday = date.getDay();
        return weekday === 0 || weekday === 6;
    };

    const startEditTrip = (employee: EmployeeWithTrips, day: number) => {
        const trip = employee.trips.find(t => day >= t.start && day <= t.end);
        if (trip) {
            setEditingTrip({
                employeeId: employee.id,
                trip: trip,
                employeeName: employee.name,
            });
        }
    };

    return (
        <div className="p-6 flex flex-col gap-4">

            {/* Панель додавання відрядження */}
            <EmployersList
                employees={allEmployees} 
                daysInMonth={daysInMonth}
                addTripRange={addTripRange}
            />

            {/* ... (Навігація) ... */}
            <div className="flex justify-center items-center my-4">
                <button
                    onClick={() => handleMonthChange(-1)}
                    aria-label="Попередній місяць"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                >
                    <FiArrowLeft size={20} className="text-white" />
                </button>
                <h2 className="text-2xl font-semibold mx-8">
                    {monthNames[month]} {year}
                </h2>
                <button
                    onClick={() => handleMonthChange(1)}
                    aria-label="Наступний місяць"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                >
                    <FiArrowRight size={20} className="text-white" />
                </button>
            </div>


            {/* Таблиця */}
            <Card className="overflow-x-auto shadow-md">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="text-center p-10 text-xl text-blue-500">Завантаження даних...</div>
                    ) : (
                        <div className="min-w-max">
                            <div className="flex sticky left-0 top-0 bg-white z-10 border-b">
                                <div className="w-48 p-2 font-bold border-r">Працівник</div>
                                {daysArray.map(day => (
                                    <div 
                                        key={day} 
                                        className="w-10 text-center p-2 font-bold"
                                        style={{ backgroundColor: isWeekend(day) ? '#ffe6e6' : 'transparent' }}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Рядки працівників */}
                            {employeesWithTrips.map((emp) => (
                                <div key={emp.id} className="flex border-b">
                                    <div className="w-48 p-2 border-r sticky left-0 bg-white truncate">
                                        {emp.name}
                                    </div>
                                    {daysArray.map((day) => {
                                        const isTripDay = emp.trips.some(t => day >= t.start && day <= t.end);
                                        // const trip = emp.trips.find(t => day === t.start); 
                                        
                                        let cellClass = "w-10 h-full py-2 border-r border-gray-200 cursor-pointer text-xs flex justify-center items-center";
                                        
                                        if (isTripDay) {
                                            cellClass += ' bg-gray-800 text-white';
                                        } else if (isWeekend(day)) {
                                            cellClass += ' bg-red-100';
                                        }

                                        return (
                                            <div 
                                                key={day} 
                                                className={cellClass}
                                                onClick={() => isTripDay && startEditTrip(emp, day)}
                                                title={isTripDay ? `${emp.trips.find(t => day >= t.start && day <= t.end)?.city}` : undefined}
                                            >
                                                {isTripDay ? (
                                                    <span>{emp.trips.find(t => day >= t.start && day <= t.end)?.city.slice(0, 3).toUpperCase()}</span>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Модалка редагування відрядження */}
            {editingTrip && (
                <EditTripModal 
                    trip={editingTrip.trip}
                    employeeName={editingTrip.employeeName}
                    onClose={() => setEditingTrip(null)}
                    onSave={editTripRange}
                    onDelete={removeTripRange}
                    employeeId={editingTrip.employeeId}
                    maxDay={daysInMonth}
                />
            )}
        </div>
    );
}