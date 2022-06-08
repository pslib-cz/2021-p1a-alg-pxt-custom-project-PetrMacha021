const strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB);
PlanetX_AILens.initModule()
PlanetX_AILens.switchfunc(PlanetX_AILens.FuncList.Ball);

PCAmotor.Servo(PCAmotor.Servos.S1, 110);
strip.setBrightness(10);

const States = {
    Search: 1,
    Found: 2,
    Grabbing: 3,
    // More posibilities
    Finished: 0,
}

let currentState = States.Search;

// Hunt mode
strip.showColor(NeoPixelColors.Red);

let speed: number = 75;

/**
 * Jezdění s robotem
 * @param pp Rychlost pravého předního motoru max. 255
 * @param pz Rychlost pravého zadního motoru max. 255
 * @param lp Rychlost levého předního motoru max. 255
 * @param lz Rychlost levého zadního motoru max. 255
 */
function RunMotor(pp: number, pz: number, lp: number, lz: number) {
    PCAmotor.MotorRun(PCAmotor.Motors.M1, Math.constrain(lp, -255, 255));
    PCAmotor.MotorRun(PCAmotor.Motors.M2, Math.constrain(lz, -255, 255));
    PCAmotor.MotorRun(PCAmotor.Motors.M3, -Math.constrain(pp, -255, 255));
    PCAmotor.MotorRun(PCAmotor.Motors.M4, -Math.constrain(pz, -255, 255));
}

/**
 * Vypne motory
 */
function StopMotor() {
    PCAmotor.MotorStop(PCAmotor.Motors.M1);
    PCAmotor.MotorStop(PCAmotor.Motors.M2);
    PCAmotor.MotorStop(PCAmotor.Motors.M3);
    PCAmotor.MotorStop(PCAmotor.Motors.M4);
}

StopMotor();

basic.forever(() => {
    PlanetX_AILens.cameraImage();
    console.log(`${PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.X)} ${PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y)} ${PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Confidence)}`)
    switch (currentState) {
        case States.Search:
            strip.showColor(NeoPixelColors.Red);
            // RunMotor(100,100,-100,-100);
            if (PlanetX_AILens.checkBall()) {
                currentState = States.Found;
            }
            break;
        case States.Found:
            strip.showColor(NeoPixelColors.Green);
            RunMotor(0, 0, 60, 60);
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.X) >= 0) {
                PCAmotor.Servo(PCAmotor.Servos.S2, 115);
                RunMotor(110, 110, 110, 110);
            }
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) <= 60) currentState = States.Grabbing;
            break;
        case States.Grabbing:
            strip.showColor(NeoPixelColors.Blue);
            PCAmotor.Servo(PCAmotor.Servos.S1, 70);
            basic.pause(800);
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) > 60 || PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) === 0) {
                RunMotor(90, 90, 90, 90);
            } else {
                PCAmotor.Servo(PCAmotor.Servos.S2, 80);
                currentState = States.Finished;
            }
            break;
        default:
            StopMotor();
            strip.showColor(NeoPixelColors.Black);
            basic.showNumber(0);
    }
    basic.pause(100);
});