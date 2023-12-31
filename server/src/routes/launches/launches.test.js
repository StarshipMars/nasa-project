const request = require('supertest')
const app = require('../../app')
const {mongoConnect , mongoDisconnect} = require('../../../share-services/mongo');
const planetsController = require('../planets/planets.controller');

describe('Launches API' , ()=>{
    beforeAll(async ()=>{
      await mongoConnect();
      await planetsController.readAndParsePlanets();
    });

    afterAll(async ()=>{
      await mongoDisconnect();
    })

    describe('Test GET /launches', ()=>{
        test('It should respond with 200 success', async ()=>{
            const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200);
    
            //expect(response.statusCode).toBe(200)
        })
    })
    
    describe('Test POST /launch', ()=>{
    
        const comleteLaunchData = {
            mission:'USS Enterprise',
            rocket:'NCC 1701-D',
            target:'Kepler-62 f',
            launchDate:'January 4, 2028'
        }
    
        const launchWithoutDate = {
            mission:'USS Enterprise',
            rocket:'NCC 1701-D',
            target:'Kepler-62 f',
        }
    
        const launchWithoutProperty = {
            mission:'USS Enterprise',
            rocket:'NCC 1701-D',
            launchDate:'January 4, 2028'
        }
    
    
        test('It should response with 201 success', async ()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(comleteLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            const requestDate = new Date(comleteLaunchData.launchDate).valueOf()
            const responseDate = new Date(response.body.launchDate).valueOf()
    
            expect(requestDate).toBeGreaterThanOrEqual(requestDate)
            expect(responseDate).toBeGreaterThanOrEqual(responseDate)
    
            expect(response.body).toMatchObject(launchWithoutDate)
        })
    
        test('It should catch invalid dates', async ()=>{
            const response = await request(app)
             .post('/v1/launches')
             .send(launchWithoutDate)
             .expect('Content-Type', /json/)
             .expect(400);
    
             expect(response.body).toStrictEqual({
                error:'Invalid launch date'
            })
        })
    
        test('It should catch missing required properties', async ()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(launchWithoutProperty)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
               error:'Missing required launch property'
           })
        })
    })
}) 

