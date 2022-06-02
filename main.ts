const strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB);
PlanetX_AILens.initModule()
PlanetX_AILens.switchfunc(PlanetX_AILens.FuncList.Ball);

PCAmotor.Servo(PCAmotor.Servos.S1, 110);
strip.setBrightness(10);
strip.setPixelColor(0, NeoPixelColors.Red);

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

basic.forever(() => {
    PlanetX_AILens.cameraImage();
    if (PlanetX_AILens.checkBall() && PlanetX_AILens.ballColor(PlanetX_AILens.ballColorList.Blue)) {
        RunMotor(150, 150, 150, 150);
    } else {
        StopMotor();
    }
    basic.pause(250);
});
