import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   courseStructureKeys,
   courseStructureMutationOptions,
   courseStructureQueryOptions,
} from "@/services/courseStructureApi";
import type { UpdateFacultyPayload, UpdateDepartmentPayload, UpdateCurriculumLevelPayload, UpdateCurriculumSemesterPayload } from "@/types/school";

// ── Faculties ───────────────────────────────

export function useFaculties() {
   return useQuery({
      ...courseStructureQueryOptions.faculties.list(),
      staleTime: 1000 * 60 * 5,
   });
}

export function useCreateFaculty() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.createFaculty(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: courseStructureKeys.faculties.all });
      },
   });
}

export function useUpdateFaculty() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.updateFaculty(),
      onSuccess: async (_, variables: { id: string; payload: UpdateFacultyPayload }) => {
         await Promise.all([
            qc.invalidateQueries({ queryKey: courseStructureKeys.faculties.all }),
            qc.invalidateQueries({ queryKey: courseStructureKeys.faculties.detail(variables.id) }),
         ]);
      },
   });
}

// ── Departments ─────────────────────────────

export function useDepartments(facultyId: string | null) {
   return useQuery({
      ...courseStructureQueryOptions.departments.byFaculty(facultyId!),
      enabled: !!facultyId,
      staleTime: 1000 * 60 * 5,
   });
}

export function useCreateDepartment() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.createDepartment(),
      onSuccess: async () => {
         await Promise.all([
            qc.invalidateQueries({ queryKey: courseStructureKeys.departments.all }),
            qc.invalidateQueries({ queryKey: courseStructureKeys.faculties.all }),
         ]);
      },
   });
}

export function useUpdateDepartment() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.updateDepartment(),
      onSuccess: async (_, variables: { id: string; payload: UpdateDepartmentPayload }) => {
         await Promise.all([
            qc.invalidateQueries({ queryKey: courseStructureKeys.departments.all }),
            qc.invalidateQueries({ queryKey: courseStructureKeys.departments.detail(variables.id) }),
         ]);
      },
   });
}

// ── Levels ──────────────────────────────────

export function useLevels(departmentId: string | null) {
   return useQuery({
      ...courseStructureQueryOptions.levels.byDepartment(departmentId!),
      enabled: !!departmentId,
      staleTime: 1000 * 60 * 5,
   });
}

export function useCreateLevel() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.createLevel(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: courseStructureKeys.levels.all });
      },
   });
}

export function useUpdateLevel() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.updateLevel(),
      onSuccess: async (_, _variables: { id: string; payload: UpdateCurriculumLevelPayload }) => {
         await qc.invalidateQueries({ queryKey: courseStructureKeys.levels.all });
      },
   });
}

// ── Semesters ───────────────────────────────

export function useCurriculumSemesters(levelId: string | null) {
   return useQuery({
      ...courseStructureQueryOptions.semesters.byLevel(levelId!),
      enabled: !!levelId,
      staleTime: 1000 * 60 * 5,
   });
}

export function useCreateCurriculumSemester() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.createSemester(),
      onSuccess: async () => {
         await Promise.all([
            qc.invalidateQueries({ queryKey: courseStructureKeys.semesters.all }),
            qc.invalidateQueries({ queryKey: courseStructureKeys.levels.all }),
         ]);
      },
   });
}

export function useUpdateCurriculumSemester() {
   const qc = useQueryClient();
   return useMutation({
      ...courseStructureMutationOptions.updateSemester(),
      onSuccess: async (_, _variables: { id: string; payload: UpdateCurriculumSemesterPayload }) => {
         await qc.invalidateQueries({ queryKey: courseStructureKeys.semesters.all });
      },
   });
}
