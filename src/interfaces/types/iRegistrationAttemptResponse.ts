export interface RegistrationAttemptResponse {
    success: boolean;
    validationErrors: string[];
    conflictingRecords: string[];
    successId?: string;
    successEmail?: string;
}