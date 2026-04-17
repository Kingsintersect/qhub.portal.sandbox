import { create } from "zustand";

export type CourseStructureStep =
   | "faculties"
   | "departments"
   | "levels"
   | "semesters";

interface CourseStructureState {
   currentStep: CourseStructureStep;
   setCurrentStep: (step: CourseStructureStep) => void;

   selectedFacultyId: string | null;
   selectedFacultyName: string | null;
   setSelectedFaculty: (id: string, name: string) => void;
   clearSelectedFaculty: () => void;

   selectedDepartmentId: string | null;
   selectedDepartmentName: string | null;
   setSelectedDepartment: (id: string, name: string) => void;
   clearSelectedDepartment: () => void;

   selectedLevelId: string | null;
   selectedLevelName: string | null;
   setSelectedLevel: (id: string, name: string) => void;
   clearSelectedLevel: () => void;

   reset: () => void;
}

const initialState = {
   currentStep: "faculties" as CourseStructureStep,
   selectedFacultyId: null,
   selectedFacultyName: null,
   selectedDepartmentId: null,
   selectedDepartmentName: null,
   selectedLevelId: null,
   selectedLevelName: null,
};

export const useCourseStructureStore = create<CourseStructureState>()((set) => ({
   ...initialState,
   setCurrentStep: (step) => set({ currentStep: step }),

   setSelectedFaculty: (id, name) =>
      set({ selectedFacultyId: id, selectedFacultyName: name, currentStep: "departments" }),
   clearSelectedFaculty: () =>
      set({
         selectedFacultyId: null,
         selectedFacultyName: null,
         selectedDepartmentId: null,
         selectedDepartmentName: null,
         selectedLevelId: null,
         selectedLevelName: null,
         currentStep: "faculties",
      }),

   setSelectedDepartment: (id, name) =>
      set({ selectedDepartmentId: id, selectedDepartmentName: name, currentStep: "levels" }),
   clearSelectedDepartment: () =>
      set({
         selectedDepartmentId: null,
         selectedDepartmentName: null,
         selectedLevelId: null,
         selectedLevelName: null,
         currentStep: "departments",
      }),

   setSelectedLevel: (id, name) =>
      set({ selectedLevelId: id, selectedLevelName: name, currentStep: "semesters" }),
   clearSelectedLevel: () =>
      set({
         selectedLevelId: null,
         selectedLevelName: null,
         currentStep: "levels",
      }),

   reset: () => set(initialState),
}));
