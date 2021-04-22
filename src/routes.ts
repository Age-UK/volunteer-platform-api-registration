// src/routes.ts
console.log('process.env.DEFAULT_LAYER_ROOT ' + process.env.DEFAULT_LAYER_ROOT);
import * as Express from "express";
const router = Express.Router();
import { RegistrationRepository } from "./repositories/registration";
import { RegistrationAttemptResponse } from "./interfaces/types/iRegistrationAttemptResponse";

export default function Routes(entities, sequelize, events) {

    var registrationRepository = new RegistrationRepository(entities, sequelize);

    router.get('/', function (req:any, res:any) {
        console.log('root event handler');
        return res.send('root');
    });

    router.get("/divisions", async (req, res) => {
        var divisions = await entities.division.table.findAll();
        res.json(divisions);
    });

    router.post("/register", async (req, res) => {
        var registerAttempt: RegistrationAttemptResponse = await registrationRepository.registerVolunteer(req);
        return res.json(registerAttempt);
    });

    return router;
}


