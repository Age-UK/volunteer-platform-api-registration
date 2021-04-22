'use strict';
import moment from "moment";
import { postcodeValidator, postcodeValidatorExistsForCountry } from "postcode-validator"
import { RegisteringVolunteer } from "../interfaces/types/iRegisteringVolunteer";
import { RegistrationAttemptValidationResponse } from "../interfaces/types/iRegistrationAttemptValidationResponse";

export class RegistrationUtil {

    registrationAttemptIsValid(req: any): RegistrationAttemptValidationResponse {

        var errors:string[] = [];

        if (req.body.forenames) {
            var forenames = req.body.forenames;
            if (forenames.trim() == "") {
                errors.push('Forename is not specified');
            } else {
                if (this.stringContainsNumber(forenames)) {
                    errors.push('Forename should not contain a number');
                }
            }
        } else {
            errors.push('Forename is not specified');
        }

        if (req.body.surname) {
            var surname = req.body.surname;
            if (surname.trim() == "") {
                errors.push('Surname is not specified');
            } else {
                if (this.stringContainsNumber(surname)) {
                    errors.push('Surname should not contain a number');
                }
            }
        } else {
            errors.push('Surname is not specified');
        }

        if (req.body.telCountryCode && req.body.telephone) {
            let tel = this.convertToE164(req.body.telCountryCode, req.body.telephone);
            if (!this.validatePhoneForE164(tel)) {
                errors.push('Phone number is not valid');
            }
        } else {
            errors.push('Phone number is not specified');
        }

        if (req.body.addressLine1) {
            var addOne = req.body.addressLine1;
            if (addOne.trim() == "") {
                errors.push('Address Line 1 is not specified');
            }
        } else {
            errors.push('Address Line 1 is not specified');
        }

        if (req.body.dateOfBirth) {
            var dob = req.body.dateOfBirth;
            if (dob.trim() == "") {
                errors.push('Date of birth is not specified');
            } else {
                if (!moment(dob.trim(), 'YYYY-MM-DD', true).isValid()) {
                    errors.push('Date of birth should be in format YYYY-MM-DD');
                }
            }
        } else {
            errors.push('Date of birth is not specified');
        }

        if (req.body.postcode) {
            var pc = req.body.postcode;
            if (pc.trim() == "") {
                errors.push('Postcode is not specified');
            } else {
                if (req.body.country == "United Kingdom") {
                    if (!postcodeValidator(req.body.postcode.trim(), 'GB')) {
                        errors.push('Invalid UK post code');
                    }
                }
            }
        } else {
            errors.push('Postcode is not specified');
        }

        if (req.body.email) {
            var em = req.body.email;
            if (em.trim() == "") {
                errors.push('Email is not specified');
            } else {
                if (!this.emailIsValid(req.body.email)) {
                    errors.push('Email is invalid');
                }
            }
        } else {
            errors.push('Email is not specified');
        }

        return {  errors: errors, success: errors.length > 0 ? false : true  };
    }

    stringContainsNumber(val:string): boolean {
        var matches = val.match(/\d+/g);
        if (matches != null) {
            return true;
        }

        return false;
    }

    validatePhoneForE164(phoneNumber:string): boolean {
        const regEx = /^\+[1-9]\d{10,14}$/;
        return regEx.test(phoneNumber);
    };

    emailIsValid(email:string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    convertToE164(countryCode:string, number: string): string {
        let fullTelephone = countryCode.trim();
        let secondaryTelephone = number.trim();

        if (secondaryTelephone) {
            if (secondaryTelephone.startsWith('0')) {
                secondaryTelephone = secondaryTelephone.substring(1);
            }

            fullTelephone = fullTelephone + secondaryTelephone;
        }
        return fullTelephone;
    };

    convertVolunteerToRegisteringVolunteer(req: any): RegisteringVolunteer {
        var dobM = moment(req.body.dateOfBirth);
        var rVolunteer: RegisteringVolunteer;

        rVolunteer = {
            status: 'Pending',
            statusChangedAt: new Date().toString(),
            title: req.body.title,
            forenames: req.body.forenames.trim(),
            surname: req.body.surname.trim(),
            fullName: req.body.forenames + ' ' + req.body.surname,
            telephone: this.convertToE164(req.body.telCountryCode, req.body.telephone),
            email: req.body.email.trim(),
            addressLine1: req.body.addressLine1.trim(),
            addressLine2: req.body.addressLine2 ? req.body.addressLine2.trim() : null,
            town: req.body.town ? req.body.town.trim() : null,
            county: req.body.county ? req.body.county.trim() : null,
            postcode: req.body.postcode.trim(),
            country: req.body.country,
            stayingInTouch: '',
            dateOfBirth: dobM.toDate(),
            divisions: req.body.divisions,
            CommsSMSEnabled: req.body.commsSMSEnabled,
            CommsPostEnabled: req.body.commsPostEnabled,
            CommsEmailEnabled: req.body.commsEmailEnabled,
            CommsPhoneEnabled: req.body.commsPhoneEnabled
        }
        return rVolunteer;
    }


}