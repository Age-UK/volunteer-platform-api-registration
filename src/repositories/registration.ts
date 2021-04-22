'use strict';
import { RegisteringVolunteer } from '../interfaces/types/iRegisteringVolunteer';
import { RegistrationUtil } from '../modules/registration-util';
import { RegistrationAttemptResponse } from '../interfaces/types/iRegistrationAttemptResponse';
import { CreateVolunteerResponse } from '../interfaces/types/iCreateVolunteerResponse';

export class RegistrationRepository {
    entities: any;
    registrationUtil: RegistrationUtil;
    //events: any;
    sequelize: any;

    constructor(entities: any, sequelize: any) {
        this.entities = entities;
        this.registrationUtil = new RegistrationUtil();
        //this.events = events;
        this.sequelize = sequelize;
    }

    registerVolunteer = async (req: any): Promise<RegistrationAttemptResponse> => {
        let validationCheck = this.registrationUtil.registrationAttemptIsValid(req);
        console.log('validationCheck ' + JSON.stringify(validationCheck));
        var conflictErrors = [];

        if (validationCheck.success) {
            let registeringVolunteer = this.registrationUtil.convertVolunteerToRegisteringVolunteer(req);
            console.log('registeringVolunteer ' + JSON.stringify(registeringVolunteer));

            let emailUnique = await this.emailIsUnique(registeringVolunteer.email);
            console.log('emailUnique ' + emailUnique);
            if (emailUnique == false) {
                conflictErrors.push('A user is already registered with this email address');
                return { success: false, validationErrors: conflictErrors, conflictingRecords: [] };
            } else {
                let postCodeUnique = await this.postCodeIsUnique(registeringVolunteer.postcode);
                console.log('postCodeUnique ' + postCodeUnique);
                console.log('email IS unique');
                if (postCodeUnique == false) {
                    console.log('postcode IS NOT unique');
                    let postcodeMatches = await this.getVolunteersWithMatchingPostCode(registeringVolunteer.postcode);
                    console.log('postcodeMatches ' + JSON.stringify(postcodeMatches));

                    if (postcodeMatches) {
                        var conflictingRecords = [];
                        let nameAddressMatches = postcodeMatches.filter(v => v.volunteerName == registeringVolunteer.fullName && v.addressLine1 == registeringVolunteer.addressLine1);

                        if (nameAddressMatches && nameAddressMatches.length > 0) {
                            console.log('nameAddressMatches ' + JSON.stringify(nameAddressMatches));
                            nameAddressMatches.map(function (n) {
                                conflictingRecords.push(n.id);
                            });
                            return { success: false, validationErrors: [], conflictingRecords: conflictingRecords };
                        }

                        let rVol = await this.createVolunteer(registeringVolunteer);

                        if (rVol && rVol.success == true) {
                            return { success: true, validationErrors: [], conflictingRecords: [], successId: rVol.successId, successEmail: registeringVolunteer.email };
                        }

                        return { success: false, validationErrors: [  rVol.error  ], conflictingRecords: [] };
                    }
                } else {
                    console.log('postcode IS unique');
                    let rVol = await this.createVolunteer(registeringVolunteer);

                    if (rVol && rVol.success == true) {
                        return { success: true, validationErrors: [], conflictingRecords: [], successId: rVol.successId, successEmail: registeringVolunteer.email };
                    }

                    return { success: false, validationErrors: [rVol.error], conflictingRecords: [] };
                }
            }

        } else {
            return { success: false, validationErrors: validationCheck.errors, conflictingRecords: [] };
        }

        return {  success: false, validationErrors: [], conflictingRecords: []  };
    }

    getVolunteersWithMatchingPostCode = async (postcode: string) => {
        let query = 'SELECT CONCAT(v.forenames,\' \',v.surname) AS volunteerName, v.id, v.postcode, v.telephone, v.addressLine1 ' +
            ' FROM volunteer v ' +
            ' WHERE postcode = ' + this.sequelize.escape(postcode);

        return this.sequelize.query(query, {
            type: this.sequelize.QueryTypes.SELECT
        });
    }

    emailIsUnique = async (remail: any): Promise<boolean> => {
        let existingUserCount = await this.entities.user.table.count({
            where: {
                email: remail
            }
        });

        console.log('existingUserCount ' + JSON.stringify(existingUserCount));

        let existingVolunteerCount = await this.entities.volunteer.table.count({
            where: {
                email: remail
            }
        });

        console.log('existingVolunteerCount ' + JSON.stringify(existingVolunteerCount));

        if (existingUserCount == 0 && existingVolunteerCount == 0) {
            return true;
        }

        return false;
    }

    postCodeIsUnique = async (rpostcode: any): Promise<boolean> => {
        let existingVolunteerCount = await this.entities.volunteer.table.count({
            where: {
                postcode: rpostcode
            }
        });

        console.log('existingVolunteerCount postcode' + JSON.stringify(existingVolunteerCount));

        if (existingVolunteerCount == 0) {
            return true;
        }

        return false;
    }

    createVolunteer = async (rVolunteer: RegisteringVolunteer): Promise<CreateVolunteerResponse> => {

        if (!rVolunteer.divisions) {
            return Promise.resolve({ success: false, error: 'At least one division should be selected' });
        }

        if (rVolunteer.divisions.length == 0) {
            return Promise.resolve({ success: false, error: 'At least one division should be selected' });
        }

        let allDivisions = await this.entities.division.table.findAll();

        if (allDivisions && allDivisions.length > 0) {
            var validDivisionIds = [];

            allDivisions.map(function (di) {
                validDivisionIds.push(di.id);
            });
            console.log('valid divisions ' + JSON.stringify(validDivisionIds));

            var divs = rVolunteer.divisions;
            var volunteerInterest = [];

            delete rVolunteer.divisions;
            let vol: any = Object.assign({}, rVolunteer);

            vol.statusChangedAt = new Date();
            delete vol.divisions;
            delete vol.fullName;

            var divsAreValid = true;

            divs.map(function (div) {
                console.log('div ' + div);
                if (validDivisionIds.indexOf(div) == -1) {
                    console.log('division is invalid ' + div);
                    divsAreValid = false;
                }
            });

            console.log('vol.dateOfBirth ' + vol.dateOfBirth);

            if (divsAreValid) {
                let registeredVolunteer = await this.entities.volunteer.table.create(vol);

                if (registeredVolunteer) {
                    divs.map(function (div) {
                        volunteerInterest.push({
                            volunteerId: registeredVolunteer.id,
                            divisionId: div
                        });
                    });

                    await this.entities.volunteerDivisionInterest.table.bulkCreate(volunteerInterest);
                    return Promise.resolve({ success: true, successId: registeredVolunteer.id });
                }
            } else {
                return Promise.resolve({ success: false, error: 'Invalid division(s)' });
            }

            
        }
        
        return Promise.resolve({ success: false, error: 'Registration failed' });
    }

}
