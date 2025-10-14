
export interface TripRange {
    id: string; 
    start: number;
    end: number;
    city: string;
}

// 1. Інтерфейс для працівника, який зберігається у Firestore (без trips)
export interface EmployeeData {
    id: number; // employeeId з Firestore
    name: string;
}

// 2. Інтерфейс для відображення в таблиці MonthView (EmployeeData + trips поточного місяця)
export interface EmployeeWithTrips extends EmployeeData {
    trips: TripRange[]; 
}

// 3. Інтерфейс для стану редагування
export interface EditingTripState {
    employeeId: number;
    trip: TripRange;
    employeeName: string;
}