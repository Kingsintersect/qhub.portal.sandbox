"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
   usersKeys,
   usersQueryOptions,
   usersMutationOptions,
} from "@/services/usersApi";
import type { UserQueryFilters, StudentQueryFilters } from "@/types/users";

/* ── Stats ── */

export function useUserStats() {
   return useQuery({
      ...usersQueryOptions.stats(),
      staleTime: 1000 * 60 * 5,
   });
}

/* ── Users ── */

export function useUsers(filters?: UserQueryFilters) {
   return useQuery({
      ...usersQueryOptions.list(filters),
      staleTime: 1000 * 60 * 2,
   });
}

export function useUser(id: number) {
   return useQuery({
      ...usersQueryOptions.detail(id),
      enabled: id > 0,
   });
}

export function useToggleUserActive() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.toggleActive(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.all });
         toast.success("User status updated");
      },
      onError: () => toast.error("Failed to update user status"),
   });
}

/* ── Students ── */

export function useStudents(filters?: StudentQueryFilters) {
   return useQuery({
      ...usersQueryOptions.students.list(filters),
      staleTime: 1000 * 60 * 2,
   });
}

export function useStudent(id: number) {
   return useQuery({
      ...usersQueryOptions.students.detail(id),
      enabled: id > 0,
   });
}

export function useUpdateStudent() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.updateStudent(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.students.all });
         toast.success("Student updated");
      },
      onError: () => toast.error("Failed to update student"),
   });
}

/* ── Lecturers ── */

export function useLecturers(filters?: UserQueryFilters) {
   return useQuery({
      ...usersQueryOptions.lecturers.list(filters),
      staleTime: 1000 * 60 * 2,
   });
}

export function useLecturer(id: number) {
   return useQuery({
      ...usersQueryOptions.lecturers.detail(id),
      enabled: id > 0,
   });
}

export function useCreateLecturer() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.createLecturer(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.lecturers.all });
         await qc.invalidateQueries({ queryKey: usersKeys.all });
         toast.success("Lecturer created successfully");
      },
      onError: () => toast.error("Failed to create lecturer"),
   });
}

export function useUpdateLecturer() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.updateLecturer(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.lecturers.all });
         toast.success("Lecturer updated");
      },
      onError: () => toast.error("Failed to update lecturer"),
   });
}

/* ── Course Assignments ── */

export function useCourseOfferings() {
   return useQuery({
      ...usersQueryOptions.courseOfferings(),
      staleTime: 1000 * 60 * 5,
   });
}

export function useLecturerCourses(lecturerId: number) {
   return useQuery({
      ...usersQueryOptions.lecturers.courses(lecturerId),
      enabled: lecturerId > 0,
   });
}

export function useAssignCourse() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.assignCourse(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.lecturers.all });
         toast.success("Course assigned successfully");
      },
      onError: (err) => toast.error(err?.message ?? "Failed to assign course"),
   });
}

export function useUnassignCourse() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.unassignCourse(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.lecturers.all });
         toast.success("Course unassigned");
      },
      onError: () => toast.error("Failed to unassign course"),
   });
}

/* ── Staff ── */

export function useStaffList(filters?: UserQueryFilters) {
   return useQuery({
      ...usersQueryOptions.staff.list(filters),
      staleTime: 1000 * 60 * 2,
   });
}

export function useStaffMember(id: number) {
   return useQuery({
      ...usersQueryOptions.staff.detail(id),
      enabled: id > 0,
   });
}

export function useCreateStaff() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.createStaff(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.staff.all });
         await qc.invalidateQueries({ queryKey: usersKeys.all });
         toast.success("Staff member created successfully");
      },
      onError: () => toast.error("Failed to create staff member"),
   });
}

export function useUpdateStaff() {
   const qc = useQueryClient();
   return useMutation({
      ...usersMutationOptions.updateStaff(),
      onSuccess: async () => {
         await qc.invalidateQueries({ queryKey: usersKeys.staff.all });
         toast.success("Staff member updated");
      },
      onError: () => toast.error("Failed to update staff member"),
   });
}

/* ── Eligible Roles (for staff creation) ── */

export function useStaffEligibleRoles() {
   return useQuery({
      ...usersQueryOptions.staffEligibleRoles(),
      staleTime: 1000 * 60 * 10,
   });
}
