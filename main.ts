const strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB);
PlanetX_AILens.initModule()
PlanetX_AILens.switchfunc(PlanetX_AILens.FuncList.Ball);

PCAmotor.Servo(PCAmotor.Servos.S1, 90);
strip.setBrightness(10);

const States = {
    Search: 1,
    Found: 2,
    Grabbing: 3,
    SearchSymbol: 4,
    GoToSymbol: 5,
    // More posibilities
    Finished: 0,
}

let currentState = States.Search;

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

let ballInPrevious = false;
let cardInPrevious = false;

while (true) {
    PlanetX_AILens.cameraImage();
    switch (currentState) {
        case States.Search:
            strip.showColor(NeoPixelColors.Red);
            RunMotor(-110, -110, 110, 110);
            if (PlanetX_AILens.checkBall() && PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.X) < 170) {
                if (ballInPrevious) {
                    currentState = States.Found;
                    ballInPrevious = false;
                }
                ballInPrevious = true;
            } else {
                ballInPrevious = false;
            }
            break;
        case States.Found:
            strip.showColor(NeoPixelColors.Green);
            RunMotor(110,-110,-110,110);
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) <= 60 && ballInPrevious) currentState = States.Grabbing;
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.X) >= 0) {
                PCAmotor.Servo(PCAmotor.Servos.S2, 115);
                ballInPrevious = true;
            } else {
                ballInPrevious = false;
            }
            break;
        case States.Grabbing:
            strip.showColor(NeoPixelColors.Blue);
            PCAmotor.Servo(PCAmotor.Servos.S1, 70);
            if (PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) > 80 || PlanetX_AILens.ballData(PlanetX_AILens.Ballstatus.Y) === 0) {
                RunMotor(90, -90, -90, 90);
            } else {
                PCAmotor.Servo(PCAmotor.Servos.S2, 80);
                PlanetX_AILens.switchfunc(PlanetX_AILens.FuncList.Card);
                currentState = States.SearchSymbol;
            }
            break;
        case States.SearchSymbol:
            strip.showColor(NeoPixelColors.Purple);
            PCAmotor.Servo(PCAmotor.Servos.S1, 90);
            RunMotor(-120, -120, 120, 120);
            if (PlanetX_AILens.CardData(PlanetX_AILens.Cardstatus.X) < 130 && PlanetX_AILens.trafficCard(PlanetX_AILens.trafficCards.stop)) {
                console.log(PlanetX_AILens.CardData(PlanetX_AILens.Cardstatus.X));
                if (cardInPrevious) {
                    currentState = States.GoToSymbol;
                }
                cardInPrevious = true;
            } else {
                cardInPrevious = false;
            }
            break;
        case States.GoToSymbol:
            strip.showColor(NeoPixelColors.White);
            StopMotor();
            PCAmotor.Servo(PCAmotor.Servos.S1, 80);
            if (PlanetX_AILens.CardData(PlanetX_AILens.Cardstatus.Y) > 60 || PlanetX_AILens.CardData(PlanetX_AILens.Cardstatus.Y) === 0) {
                RunMotor(90, -90, -90, 90);
            } else {
                PCAmotor.Servo(PCAmotor.Servos.S2, 115);
                RunMotor(-90, 90, 90, -90);
                basic.pause(500);
                currentState = States.Finished;
            }
            break;
        default:
            StopMotor();
            strip.showColor(NeoPixelColors.Black);
            basic.showNumber(0);
    }
    basic.pause(100);
}