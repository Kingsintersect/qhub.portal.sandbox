export {
   useAppStore as useAuthStore,
   useAppHydrated as useAuthHydrated,
   APP_ROLE_CATALOG,         // ← add so consumers get static data from here too
   APP_ROLE_ORDER,           // ← add
   type AppState as AuthState,
   type AppUser as User,
   type AppRoleDefinition as RoleDefinition,  // ← add
} from './appStore'
