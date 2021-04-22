// src/app.ts
import Express from "express";
import * as bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
// import passport from "./passport";
// import email from "./events/email";
// import Events from "./events";
import AWS from "aws-sdk";
import Mandrill from "mandrill-api/mandrill"

const volplatform = require(process.env.DEFAULT_LAYER_ROOT + '/volplatform');
class App {

    public app: Express.Application;
    public entites: any;
    public sequelize: any;
    public apiRoutes: any;
    public authentication: any;
    public events: any;

    constructor() {
        this.app = Express();
        this.entites = volplatform.layer().entities;
        this.sequelize = volplatform.layer().sequelize;
        
        this.expressConfig();
        this.config();
        
    }
    private expressConfig() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        let sns = new AWS.SNS({ apiVersion: '2010-03-31' });
        let mandrill = new Mandrill.Mandrill(process.env.MANDRILL_API_KEY);
        this.apiRoutes = routes(this.entites, this.sequelize, this.events);
        this.app.use(this.apiRoutes);
    }
    private config() {
    }
}
export default new App().app;