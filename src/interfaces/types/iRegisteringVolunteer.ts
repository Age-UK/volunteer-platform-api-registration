export interface RegisteringVolunteer {
    status: string;
    statusChangedAt: string;
    title: string;
    forenames: string;
    surname: string;
    fullName: string;
    telephone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    county?: string;
    postcode: string;
    country: string;
    stayingInTouch: string;
    CommsSMSEnabled: any;
    CommsPostEnabled: any;
    CommsEmailEnabled: any;
    CommsPhoneEnabled: any;
    dateOfBirth: any;
    divisions?: any;
}