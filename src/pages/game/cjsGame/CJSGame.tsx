import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CJSGame.css';
import BreadCrumb from '../../../components/breadcrumbs/breadCrumb';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import CJSWindow from '../../../components/gameWindow/cjsWindow/CJSWindow';
import ScoreSummaryOverlay from '../../../components/scoreSummaryOverlay/ScoreSummaryOverlay';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3';
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import moment from 'moment';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';
import { Shuffle } from '../../../scripts/shuffle';
import * as vismem from '../../../scripts/vismemCC_simon';
import CJSButton from '../../../components/gameWindow/cjsWindow/cjsButton/CJSButton';
import { saveJSONDataToClientDevice } from '../../../uitls/offline';
import axios from 'axios';

let myCanvas: HTMLCanvasElement;
let canvasContext: CanvasRenderingContext2D;
let trialNumber;
let currTrial = 0;
let backgroundColor = '#E5E5E5';
let stimulusColor = ['#0072FF', '#FFC837']; 
let searchTargetList: any[][] = [
    [
        { description: 'สี่เหลี่ยมสีฟ้า', color: 'blue', shape: 'square' },
        { description: 'สี่เหลี่ยมเหลือง', color: 'yellow', shape: 'square' }
    ],
    [
        { description: 'วงกลมสีฟ้า', color: 'blue', shape: 'circle' },
        { description: 'วงกลมเหลือง', color: 'yellow', shape: 'circle' }
    ]
]
let canvasWidth = 800;
let canvasHeight = 800;
let squareWidth = 55;
let squareHeight = 55;
let radius = squareWidth / 2;
let positionJitter = 8;
let centerX: number;
let centerY: number;
let Xspan = canvasWidth / 2;
let Yspan = canvasHeight / 2;
let XblockNumber = 8;
let YblockNumber = 6;
let Xblock = Xspan * 2 / XblockNumber;
let Yblock = Yspan * 2 / YblockNumber;
let X: number[]
let Y: number[]
let Xs: number[] = [];
let Ys: number[] = [];
let Xtemps: number[] = [];
let Ytemps: number[] = [];
let posId: number[] = [];
let maxSS = Math.floor((XblockNumber * YblockNumber - 1) / 2);
let ceilingSS = 0;
let currSS = 2;
let initialSetSize = 2; // must have same value as currSS
let allSetsizeAndTarget: number[][] = [];
let change = NaN;
let shapeRand: number[] = [];
let ori: number[]
let col: string[]
let oris: number[] = [];
let cols: number[] = [];
let ceilingTimeLimit = 10 * 1000;
let timeLimit = 10 * 1000;
let timeLimitDeclineStep = 1000;
let timeLimitInclineStep = 500;
let checkAns: string[] = [];
let thatRight: string = '';
let responseText: string = '';
let timeoutList: any[] = []; 
let count = 0;
let NupNdown = 5;
let trackRecord = 0;
let levelUpCount = 0;
let STT;
let ET;
let sumRt = 0;
let allRt: number[] = [];
let sumHitRt;
let hitRt: number[] = [];
let hit2SetSizeRt: number[] = [];
let hit6SetSizeRt: number[] = [];
let hit12SetSizeRt: number[] = [];
let hit24SetSizeRt: number[] = [];
let hit44SetSizeRt: number[] = [];
let correctRejection2SetSizeRt: number[] = [];
let correctRejection6SetSizeRt: number[] = [];
let correctRejection12SetSizeRt: number[] = [];
let correctRejection24SetSizeRt: number[] = [];
let correctRejection44SetSizeRt: number[] = [];
let latestHitRtIndex = 0;
let correctButLateCount = 0;
let lateMultiplier = 10000;
let incorrectCount = 0;
let incorrectMultiplier = 20000;
let scorePerTrial = [0];
let sumScores: number = 0;
let scoresMultiplier = 10;
let comboCount: number[] = [];
let rtBound = 10000;
let avgHitRt;
let avgHit2SetSizeRt;
let avgHit6SetSizeRt;
let avgHit12SetSizeRt;
let avgHit24SetSizeRt;
let avgHit44SetSizeRt;
let avgCorrectRejection2SetSizeRt;
let avgCorrectRejection6SetSizeRt;
let avgCorrectRejection12SetSizeRt;
let avgCorrectRejection24SetSizeRt;
let avgCorrectRejection44SetSizeRt;
let hitAccuracy2SetSize;
let hitAccuracy6SetSize;
let hitAccuracy12SetSize;
let hitAccuracy24SetSize;
let hitAccuracy44SetSize;
let correctRejectionAccuracy2SetSize;
let correctRejectionAccuracy6SetSize;
let correctRejectionAccuracy12SetSize;
let correctRejectionAccuracy24SetSize;
let correctRejectionAccuracy44SetSize;
let swiftness: string = '';
let total: number = 0;
let score: number;
let targetMatch: boolean[] = [];
let allStartTime: string[] = [];
let allClickTime: string[] = [];
let allCurrSS: number[] = [];
let gameLogicSchemeResult;
let trialDataResult: any[] = [];
let stimulusDataResult: any[] = [];
let targetDataResult;
let scoringDataResult: any[] = [];
let timeLimitRecord: any[] = [];
let setSizeRecord: any[] = [];
let setSizeInCorrectAns: any[] = [];
let metricDataResult: any[] = [];
let postEntryResult;

function CJSGame(props): any {
    const navigate = useNavigate();
    const [clickSound] = useSound(clickSoundSrc);
    const [combo2Sound] = useSound(combo2SoundSrc);
    const [losingSound] = useSound(losingSoundSrc);
    const [searchTarget, setSearchTarget] = useState<{ shape: number, col: number }>();
    const [progressValue, setProgressValue] = useState(0);
    const [disabledButton, setDisabledButton] = useState(false);
    const [isItDone, setIsItDone] = useState(false);

        useEffect(() => {
            initiateData();
            setSearchTarget({ shape: (Math.random() > 0.5 ? 1 : 0), col: (Math.random() > 0.5 ? 1 : 0) });

            return() => {
                timeoutList.forEach(tm => {
                    clearTimeout(tm);
                })
            };
        }, [])

        useEffect(() => {
            if (searchTarget) {
                oris = [];
                cols = [];
                for (let j = 0; j < maxSS; j++) { oris.push(0); oris.push(0)};
                if (searchTarget.shape === 1) {
                    shapeRand = [1];
                } else {
                    shapeRand = [0];
                }
                if (searchTarget.col === 1) {
                    for (let k = 0; k < maxSS; k++) { cols.push(0); cols.push(0)};
                } else {
                    for (let k = 0; k < maxSS; k++) { cols.push(1); cols.push(1)};
                }
                createTargetCanvas();
                createPseudorandomStimuli();
                createCanvas();
                gameLogicSchemeResult = gameLogicScheme(trialNumber, backgroundColor, squareWidth, radius, stimulusColor, positionJitter, XblockNumber, YblockNumber, ceilingTimeLimit, timeLimitDeclineStep, timeLimitInclineStep, canvasHeight, canvasWidth, initialSetSize);
            }
        }, [searchTarget])

    function gameLogicScheme(trialNumber, backgroundColor, squareWidth, radius, stimulusColor, positionJitter, XblockNumber, YblockNumber, ceilingTimeLimit, timeLimitDeclineStep, timeLimitInclineStep, canvasHeight, canvasWidth, initialSetSize){
        gameLogicSchemeResult = {
            "game" : "conjunction-search",
            "schemeName" : "default",
            "version" : "1.0",
            "variant" : "main",
            "parameters" : {
                "trialNumber": {
                    "value" : trialNumber,
                    "unit" : null,
                    "description" : "Total number of trials"
                },
                "backgroundColor": {
                    "value": backgroundColor,
                    "unit": null,
                    "description" : "Background color of test canvas"
                },
                "stimulusShape" : {
                    "value" : [
                        {
                            "shapeName": "square",
                            "parameters": {
                                "squareWidth" : {
                                    "value": squareWidth,
                                    "unit": "px",
                                    "description" : "Square stimulus width"
                                }
                            },
                            "description" : "Square stimulus"
                        }, 
                        {
                            "shapeName": "circle",
                            "parameters": {
                                "radius" : {
                                    "value": radius,
                                    "unit": "px",
                                    "description" : "Circle stimulus radius"
                                }
                            },
                            "description" : "Circle stimulus"
                        }
                    ],
                    "unit" : null,
                    "description" : "Set of possible stimulus shape"
                },
                "stimulusColor": {
                    "value" : stimulusColor,
                    "unit" : null,
                    "description" : "Set of possible stimulus color"
                },
                "positionJitter" : {
                    "value": positionJitter,
                    "unit": "px",
                    "description": "Amplitude of spatial jittering in each axis"
                },
                "XblockNumber": {
                    "value": XblockNumber,
                    "unit": null,
                    "description": "Number of horizontal blocks composing the canvas"
                },
                "YblockNumber": {
                    "value": YblockNumber,
                    "unit": null,
                    "description": "Number of vertical blocks composing the canvas"
                },
                "ceilingTimeLimit" : {
                    "value" : ceilingTimeLimit,
                    "unit": "ms",
                    "description" : "Maximum(&initial) time limit of answer time in each trial"
                },
                "timeLimitDeclineStep" : {
                    "value" : timeLimitDeclineStep,
                    "unit" : "ms",
                    "description" : "Time limit declination step size at the maximum span"
                },
                "timeLimitInclineStep" : {
                    "value" : timeLimitInclineStep,
                    "unit" : "ms",
                    "description" : "Time limit inclination step size at the maximum span"
                },
                "canvasProperty" : {
                    "canvasHeight" : {
                        "value" : canvasHeight,
                        "unit" : "px",
                        "description" : "Height of canvas"
                    },
                    "canvasWidth" : {
                        "value" : canvasWidth,
                        "unit" : "px",
                        "description" : "Width of canvas"
                    }
                },
                "initialSetSize" : {
                    "value": initialSetSize,
                    "unit": null,
                    "description" : "Initial set size"
                }
            },
            "description" : "Conjunction search default scheme"
        }
        return gameLogicSchemeResult;
    }

    function initiateData() {
        hitRt = [];
        allRt = [];
        currSS = 2;
        ceilingSS = 0;
        latestHitRtIndex = 0;
        comboCount = [];
        correctButLateCount = 0;
        incorrectCount = 0;
        count = 0;
        currTrial = 0;
        Xtemps = [];
        Xs = [];
        Ytemps = [];
        Ys = [];
        posId = [];
        hit2SetSizeRt = [];
        hit6SetSizeRt = [];
        hit12SetSizeRt = [];
        hit24SetSizeRt = [];
        hit44SetSizeRt = [];
        correctRejection2SetSizeRt = [];
        correctRejection6SetSizeRt = [];
        correctRejection12SetSizeRt = [];
        correctRejection24SetSizeRt = [];
        correctRejection44SetSizeRt = [];
    }

    function createTargetCanvas() {
        let cv: HTMLCanvasElement = document.getElementById("target-canvas") as HTMLCanvasElement;
        if (cv) {
            let ctx: CanvasRenderingContext2D = cv.getContext("2d") as CanvasRenderingContext2D;
            let xOffset = cv.width / 2;
            if (searchTarget?.col === 1) {
                ctx.strokeStyle = '#FFC837'
                ctx.fillStyle = '#FFC837';
            } else if (searchTarget?.col === 0) {
                ctx.strokeStyle = '#0072FF'
                ctx.fillStyle = '#0072FF';
            }
            if (searchTarget?.shape === 0) {
                ctx.rect(xOffset - 10, cv.height - 21, 20, 20);
            } else if (searchTarget?.shape === 1) {
                ctx.arc(xOffset, cv.height - 11, 10, 0, 2 * Math.PI);
            } 
            ctx.stroke();
            ctx.fill();
        }
    }

    function createPseudorandomStimuli() {
        allSetsizeAndTarget = [];
        let allSetsizeRange = [2, 6, 12, 24, 44];
        let trialsPerSetsize = 16; 
        let targetCondition = 2; // target appear or disappear
        let trialsPerCondition = trialsPerSetsize / targetCondition; 

        for (let iSetsize = 0; iSetsize < allSetsizeRange.length; iSetsize++) {
            for (let iRep = 0; iRep < trialsPerCondition; iRep++) {
                for (let iTarget = 0; iTarget < targetCondition; iTarget++) {
                    allSetsizeAndTarget.push([allSetsizeRange[iSetsize],iTarget])
                }
            }
        }
        Shuffle(allSetsizeAndTarget);
        trialNumber = trialsPerSetsize * allSetsizeRange.length;
    }
    
    function createCanvas() {
        myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        canvasContext = myCanvas.getContext("2d") as CanvasRenderingContext2D;
        centerX = myCanvas.width / 2;
        centerY = myCanvas.height / 2;

        for (var ix = 0; ix < XblockNumber; ix++) {
            Xtemps.push(Math.round(Xblock / 2) + Xblock * ix - Xspan + centerX);
        }

        for (var iy = 0; iy < YblockNumber; iy++) {
            Ytemps.push(Math.round(Yblock / 2) + Yblock * iy - Yspan + centerY);
        }

        for (ix = 0; ix < XblockNumber; ix++) {
            for (iy = 0; iy < YblockNumber; iy++) {
                Xs.push(Xtemps[ix]);
                Ys.push(Ytemps[iy]);
                posId.push(count);
                count++;
            }
        }

        myCanvas.hidden = false;
        initialT(0, allSetsizeAndTarget[currTrial][0]);
    }

    function initialT(_waittime, SS) {
        setDisabledButton(false);
        setSizeRecord.push(SS);
        timeLimitRecord.push(timeLimit);
        if (!ceilingSS) {
            ceilingSS = SS + 1;
        };
        vismem.erase(canvasContext);
        vismem.clear();
        allCurrSS.push(allSetsizeAndTarget[currTrial][0]);
        shuffleSS(SS);
        targetData(squareWidth, ori, col);
        makeBackground(backgroundColor);
        makeSearchArray(X, Y, squareWidth, squareHeight, ori, col);
        stimulusData(realX, realY, squareWidth, ori, col);
        vismem.drawObjects(canvasContext, vismem.objects);
        let dT = new Date();
        STT = dT.getTime();
        allStartTime.push(thisTime());
    }

    function shuffleSS(setSize) {
        Shuffle(posId);
        X = []; for (let ix = 0; ix < setSize + 1; ix++) { X.push(Xs[posId[ix]]) };
        Y = []; for (let iy = 0; iy < setSize + 1; iy++) { Y.push(Ys[posId[iy]]) };
        ori = []; for (let j = 0; j < setSize; j++) { ori.push(oris[j]) };
        col = []; for (let j = 0; j < setSize; j++) { col.push(stimulusColor[cols[j]]) };
        // add the target or not
        if (allSetsizeAndTarget[currTrial][1] === 0) {
            ori.push(oris[setSize]);
            col.push(stimulusColor[cols[setSize]]);
        } else {
            ori.push(1 - oris[setSize]);
            col.push(stimulusColor[1 - cols[setSize]]);
        }
    }

    function makeBackground(backgroundColor) {
        // Fill background
        vismem.makeRectangle('bg', centerX, centerY, canvasWidth, canvasHeight, false, backgroundColor, backgroundColor);
    }

    let realX: number[] = [];
    let realY: number[] = [];
    function makeSearchArray(numarrayX, numarrayY, squareWidth, squareHeight, orienVec, colorVec) {
        for (let i = 0; i < orienVec.length; i++) {
            if (orienVec[i] === shapeRand[0]) {
                vismem.makeCircle('c', numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter, numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter, radius, false, colorVec[i], colorVec[i]);
            } else {
                vismem.makeRectangle('s', numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter, numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter, squareHeight, squareWidth, false, colorVec[i], colorVec[i], 0, 0);
            }
            realX.push(numarrayX[i] + (Math.random() - 0.5) * 2 * positionJitter);
            realY.push(numarrayY[i] + (Math.random() - 0.5) * 2 * positionJitter);
        }
        if (searchTarget) {
            // Find Target from Object
            let find = vismem.objects.find(x => x.id === (searchTarget.shape === 0 ? 's' : 'c') && x.color === stimulusColor[searchTarget.col])
            change = find ? 1 : 0
            targetMatch.push(find ? true : false);
        }
    }
    
    function targetData(width, ori, col) {
        let thisShape = "";
        let thisParameterName = "";
        let thisValue = 0;
        let obj_in_trial: any[] = [];
        let obj_to_append;
        if (shapeRand[0] === 1) {
            thisShape = "circle";
                thisParameterName = "radius";
                thisValue = radius;
            } else {
                thisShape = "square";
                thisParameterName = "width";
                thisValue = width;
            }

            if (searchTarget) {
                obj_to_append = {
                    "shape" : thisShape,
                    "shapeParams" : {
                        "parameterName" : thisParameterName,
                        "value" : thisValue,
                        "unit" : "px"
                    },
                    "color" : stimulusColor[searchTarget.col]
                }
                obj_in_trial.push(obj_to_append);
            }
        targetDataResult = obj_in_trial[obj_in_trial.length - 1];
        return targetDataResult;
    }

    function stimulusData(x, y, width, ori, col) {
        let thisShape = "";
        let thisParameterName = "";
        let thisValue = 0;
        let obj_in_trial: any[] = [];
        
        for (let i = 0; i < col.length; i++){
            let obj_to_append;
            if (shapeRand[0] === 0) {
                thisShape = "circle";
                thisParameterName = "radius";
                thisValue = radius;
            } else {
                thisShape = "square";
                thisParameterName = "width";
                thisValue = width;
            }
                obj_to_append = {
                "type" : "distractor",
                "display" : {
                    "shape" : thisShape,
                    "shapeParams" : {
                        "parameterName" : thisParameterName,
                        "value" : thisValue,
                        "unit" : "px"
                    },
                    "color" : col[i]
                },
                "position" : {
                    "x" : {
                        "value" : x[i],
                        "unit" : "px"
                    },
                    "y" : {
                        "value" : y[i],
                        "unit" : "px"
                    }
                }
            }   
            obj_in_trial.push(obj_to_append);
        }
        obj_in_trial[obj_in_trial.length - 1].type = "target";

        if (targetMatch[currTrial] === true){
            if (obj_in_trial[obj_in_trial.length - 1].display.shape  === "circle"){
                obj_in_trial[obj_in_trial.length - 1].display.shape  = "square";
            } else {
                obj_in_trial[obj_in_trial.length - 1].display.shape  = "circle";
            }
        }
        stimulusDataResult.push(obj_in_trial);
        return stimulusDataResult;
    }

    function trialData(targetMatch, allStartTime, allCurrSS, allClickTime, checkAns, stimulusDataResult){
        let thisAns;
        let obj_in_trial: any[] = [];
        for (let i = 0; i < targetMatch.length; i++){
            let obj_to_append;
            if (checkAns[i] === 'right' || checkAns[i] === 'late'){
                thisAns = true;
            } else {
                thisAns = false;
            }
            obj_to_append = {
                "hasTarget" : targetMatch[i],
                "startTime" : allStartTime[i],
                "setSize" : allCurrSS[i],
                "answerTime" : allClickTime[i],
                "hasTargetAnswerBool" : thisAns,
                "stimulusData" : stimulusDataResult[i]
            }
            obj_in_trial.push(obj_to_append);
        }
        trialDataResult.push(obj_in_trial[obj_in_trial.length - 1]);
        return trialDataResult;
    }
    
    function checkResp(foo) {
        setProgressValue(progressValue + 1);
        // clickSound();
        let dT2 = new Date();
        ET = dT2.getTime();
        allClickTime.push(thisTime());
        let rt = ET - STT;
        allRt.push(rt);
        if (change === foo) {
            // combo2Sound();
            if (rt < timeLimit) {
                trackRecord = trackRecord + 1;
                thatRight = 'right';
                checkAns.push(thatRight);
                hitRt.push(rt);
                if (levelUpCount === 0) {
                    comboCount.push(0);
                } else if (levelUpCount === 1) {
                    comboCount.push(1);
                } else if (levelUpCount === 2) {
                    comboCount.push(2);
                } else if (levelUpCount === 3) {
                    comboCount.push(3);
                } else if (levelUpCount === 4) {
                    comboCount.push(4);
                } else if (levelUpCount === 5) {
                    comboCount.push(5);
                }
            } else {
                // combo2Sound();
                thatRight = 'late';
                trackRecord = 0;
                checkAns.push(thatRight);
                correctButLateCount++;
            }

            // check if target appear or disappear
            if (allSetsizeAndTarget[currTrial][1] === 0){
                // disappear
                // check setsize that correct rejection
                if (allSetsizeAndTarget[currTrial][0] === 2){
                    correctRejection2SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                    correctRejection6SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                    correctRejection12SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                    correctRejection24SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                    correctRejection44SetSizeRt.push(rt);
                }
            } else {
                // appear
                // check setsize that hit
                if (allSetsizeAndTarget[currTrial][0] === 2){
                    hit2SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 6) {
                    hit6SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 12) {
                    hit12SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 24) {
                    hit24SetSizeRt.push(rt);
                } else if (allSetsizeAndTarget[currTrial][0] === 44) {
                    hit44SetSizeRt.push(rt);
                }
            }
        } else {
            // losingSound();
            thatRight = 'wrong';
            trackRecord = 0;
            checkAns.push(thatRight);
            incorrectCount++;
        }
        trialDataResult = trialData(targetMatch, allStartTime, allCurrSS, allClickTime, checkAns, stimulusDataResult);
        trialIsOver();
    }

    function trialIsOver() {
        vismem.erase(canvasContext);
        vismem.clear();
        makeBackground(backgroundColor)
        vismem.drawObjects(canvasContext, vismem.objects);
        if (trackRecord >= NupNdown) {
            if (allSetsizeAndTarget[currTrial][0] < maxSS * 2 - 2) {
                // currSS = currSS + 2;
                ceilingSS = allSetsizeAndTarget[currTrial][0] + 1;
                if (levelUpCount === 5) {
                    levelUpCount = 5;
                } else {
                    levelUpCount++
                }
            } else {
                ceilingSS = allSetsizeAndTarget[currTrial][0] + 1;
                timeLimit = timeLimit - timeLimitDeclineStep;
            }
        }

        if (trackRecord === 0 && allSetsizeAndTarget[currTrial][0] > 4) {
            // currSS = currSS - 2;
            timeLimit = timeLimit + timeLimitInclineStep;
            if (timeLimit > ceilingTimeLimit) {
                timeLimit = ceilingTimeLimit;
            }
        }
        currTrial = currTrial + 1;
        if (currTrial >= trialNumber) {
            summarySetSize();
            summaryScore();
            Done();
        } else {
            trialConclude();
        }
    }

    function trialConclude() {
        setDisabledButton(true);
        vismem.erase(canvasContext);
        vismem.clear();
        makeBackground(backgroundColor);
        vismem.drawObjects(canvasContext, vismem.objects);
        
        let textHeight = 0;
        if (thatRight === 'wrong'){
            responseText = "ผิด";
            textHeight = 36;
        } else {
            responseText = "ถูก";
            textHeight = 20;
        }

        canvasContext.font = "120px Sarabun"
        let textWidth = canvasContext.measureText(responseText).width;
        timeoutList.push(
            setTimeout(function() {
                let text = vismem.makeText('t', centerX - textWidth/2, centerY + textHeight, responseText, "Black", canvasContext.font);
                vismem.drawText(canvasContext, text);
            }, 100),

            setTimeout(function() {
                vismem.erase(canvasContext);
                vismem.clear();
                makeBackground(backgroundColor);
                vismem.drawObjects(canvasContext, vismem.objects);
            }, 600),

            setTimeout(function() {
                initialT(0, allSetsizeAndTarget[currTrial][0]);
            }, 900)
        )
    }

    function summarySetSize() {
        let sumHit2SetSizeRt;
        let sumHit6SetSizeRt;
        let sumHit12SetSizeRt;
        let sumHit24SetSizeRt;
        let sumHit44SetSizeRt;
        let sumCorrectRejection2SetSizeRt;
        let sumCorrectRejection6SetSizeRt;
        let sumCorrectRejection12SetSizeRt;
        let sumCorrectRejection24SetSizeRt;
        let sumCorrectRejection44SetSizeRt;
        let appearOrDisappearCondition = 2; // appear or disappear
        let setSizeCondition = 5; // [2, 6, 12, 24, 44] setsize
        let trialNumberPerCondition = allSetsizeAndTarget.length / (appearOrDisappearCondition * setSizeCondition);

        // feature section
        // 2 setsize section
        hitAccuracy2SetSize = hit2SetSizeRt.length / trialNumberPerCondition * 100;
        if (hit2SetSizeRt.length !== 0){
            sumHit2SetSizeRt = hit2SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit2SetSizeRt.push(0);
            sumHit2SetSizeRt = hit2SetSizeRt;
        }

        avgHit2SetSizeRt = sumHit2SetSizeRt / 1000 / hit2SetSizeRt.length;

        correctRejectionAccuracy2SetSize = correctRejection2SetSizeRt.length / trialNumberPerCondition * 100;
        if (correctRejection2SetSizeRt.length !== 0){
            sumCorrectRejection2SetSizeRt = correctRejection2SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection2SetSizeRt.push(0);
            sumCorrectRejection2SetSizeRt = correctRejection2SetSizeRt;
        }

        avgCorrectRejection2SetSizeRt = sumCorrectRejection2SetSizeRt / 1000 / correctRejection2SetSizeRt.length;

        // 6 setsize section
        hitAccuracy6SetSize = hit6SetSizeRt.length / trialNumberPerCondition * 100;
        if (hit6SetSizeRt.length !== 0){
            sumHit6SetSizeRt = hit6SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit6SetSizeRt.push(0);
            sumHit6SetSizeRt = hit6SetSizeRt;
        }

        avgHit6SetSizeRt = sumHit6SetSizeRt / 1000 / hit6SetSizeRt.length;

        correctRejectionAccuracy6SetSize = correctRejection6SetSizeRt.length / trialNumberPerCondition * 100;
        if (correctRejection6SetSizeRt.length !== 0){
            sumCorrectRejection6SetSizeRt = correctRejection6SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection6SetSizeRt.push(0);
            sumCorrectRejection6SetSizeRt = correctRejection6SetSizeRt;
        }

        avgCorrectRejection6SetSizeRt = sumCorrectRejection6SetSizeRt / 1000 / correctRejection6SetSizeRt.length;

        // 12 setsize section
        hitAccuracy12SetSize = hit12SetSizeRt.length / trialNumberPerCondition * 100;
        if (hit12SetSizeRt.length !== 0){
            sumHit12SetSizeRt = hit12SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit12SetSizeRt.push(0);
            sumHit12SetSizeRt = hit2SetSizeRt;
        }

        avgHit12SetSizeRt = sumHit12SetSizeRt / 1000 / hit12SetSizeRt.length;

        correctRejectionAccuracy12SetSize = correctRejection12SetSizeRt.length / trialNumberPerCondition * 100;
        if (correctRejection12SetSizeRt.length !== 0){
            sumCorrectRejection12SetSizeRt = correctRejection12SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection12SetSizeRt.push(0);
            sumCorrectRejection12SetSizeRt = correctRejection12SetSizeRt;
        }

        avgCorrectRejection12SetSizeRt = sumCorrectRejection12SetSizeRt / 1000 / correctRejection12SetSizeRt.length;

        // 24 setsize section
        hitAccuracy24SetSize = hit24SetSizeRt.length / trialNumberPerCondition * 100;
        if (hit24SetSizeRt.length !== 0){
            sumHit24SetSizeRt = hit24SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit24SetSizeRt.push(0);
            sumHit24SetSizeRt = hit24SetSizeRt;
        }

        avgHit24SetSizeRt = sumHit24SetSizeRt / 1000 / hit24SetSizeRt.length;

        correctRejectionAccuracy24SetSize = correctRejection24SetSizeRt.length / trialNumberPerCondition * 100;
        if (correctRejection24SetSizeRt.length !== 0){
            sumCorrectRejection24SetSizeRt = correctRejection24SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection24SetSizeRt.push(0);
            sumCorrectRejection24SetSizeRt = correctRejection24SetSizeRt;
        }

        avgCorrectRejection24SetSizeRt = sumCorrectRejection24SetSizeRt / 1000 / correctRejection24SetSizeRt.length;

        // 44 setsize section
        hitAccuracy44SetSize = hit44SetSizeRt.length / trialNumberPerCondition * 100;
        if (hit44SetSizeRt.length !== 0){
            sumHit44SetSizeRt = hit44SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hit44SetSizeRt.push(0);
            sumHit44SetSizeRt = hit44SetSizeRt;
        }

        avgHit44SetSizeRt = sumHit44SetSizeRt / 1000 / hit44SetSizeRt.length;

        correctRejectionAccuracy44SetSize = correctRejection44SetSizeRt.length / trialNumberPerCondition * 100;
        if (correctRejection44SetSizeRt.length !== 0){
            sumCorrectRejection44SetSizeRt = correctRejection44SetSizeRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            correctRejection44SetSizeRt.push(0);
            sumCorrectRejection44SetSizeRt = correctRejection44SetSizeRt;
        }

        avgCorrectRejection44SetSizeRt = sumCorrectRejection44SetSizeRt / 1000 / correctRejection44SetSizeRt.length;
    }

    function summaryScore() {
        for (let correctIndex = latestHitRtIndex; correctIndex < comboCount.length; correctIndex++) {
            latestHitRtIndex = correctIndex;
            let rtScore = rtBound - hitRt[correctIndex];
            let comboMultiplier = 0;
            if (comboCount[correctIndex] === 0) {
                comboMultiplier = 1;
            } else if (comboCount[correctIndex] === 1) {
                comboMultiplier = 1.05;
            } else if (comboCount[correctIndex] === 2) {
                comboMultiplier = 1.10;
            } else if (comboCount[correctIndex] === 3) {
                comboMultiplier = 1.20;
            } else if (comboCount[correctIndex] === 4) {
                comboMultiplier = 1.50;
            } else if (comboCount[correctIndex] === 5) {
                comboMultiplier = 2.00;
            }
            rtScore *= comboMultiplier;
            scorePerTrial.push(rtScore);
        }
        sumScores = scorePerTrial.reduce((sum, score) => {
            return sum + score;
        });

        sumRt = allRt.reduce((sum, scores) => {
            return sum + scores;
        });

        if (hitRt.length !== 0){
            sumHitRt = hitRt.reduce((sum, score) => {
                return sum + score;
            });
        } else {
            hitRt.push(0);
            sumHitRt = hitRt;
        }

        avgHitRt = sumHitRt / 1000 / hitRt.length;
        if (avgHitRt < 1) {
            swiftness = "เร็วมาก";
        }
        else if (avgHitRt < 2) {
            swiftness = "เร็ว";
        }
        else {
            swiftness = "ปานกลาง";
        }

        total = Math.max(10000, Math.round((sumScores - (incorrectCount * incorrectMultiplier + correctButLateCount * lateMultiplier)) * scoresMultiplier / trialNumber));

        return total;
    }

    function Done() {
        setIsItDone(true);
        score = total;
        hightestSetSizeCheck(checkAns, setSizeRecord);
        scoringDataResult = scoringData(rtBound, incorrectMultiplier, lateMultiplier, scoresMultiplier, trialNumber, total);
        metricDataResult = metricData(trialNumber, incorrectCount, correctButLateCount, setSizeInCorrectAns, timeLimitRecord, hitRt, avgHitRt, swiftness);
        postEntryResult = postEntry(targetDataResult, trialDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult);
        axios.post('https://exercise-vercel-svelte-backend.vercel.app/api/easy/conjunction_search', postEntryResult)
            .then(function (postEntryResult) {
                console.log(postEntryResult)
            })
            .catch(function (error) {
                console.log('error')
            });
            saveJSONDataToClientDevice(postEntryResult, `Subject${props.userId}_visualsearch_easy_session${props.userSession}_${thisTime().toString()}`);
    }

    function scoringData(rtBound, incorrectMultiplier, lateMultiplier, scoresMultiplier, trialNumber, total){
        scoringDataResult = [{
            "scoringModel" : {
                "scoringName" : "default",
                "parameters" : {
                    "rtBound" : {
                        "value" : rtBound,
                        "unit" : null,
                        "description" : "rtBound - hitRt = rtScore"
                    },
                    "incorrectMultiplier" : {
                        "value" : incorrectMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for incorrectCount"
                    },
                    "lateMultiplier" : {
                        "value" : lateMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for correctButLateCount"
                    },
                    "scoresMultiplier" : {
                        "value" : scoresMultiplier,
                        "unit" : null,
                        "description" : "Multiplier for total score"
                    },
                    "trialNumber" : {
                        "value" : trialNumber,
                        "unit" : null,
                        "description" : "Total number of trials"
                    }
                },
                "description" : `score = (sumScores - (incorrectCount * incorrectMultiplier + correctButLateCount * lateMultiplier)) * scoresMultiplier / trialNumber; comboMultiplier depends on comboCount if comboCount = [0, 1, 2, 3, 4, 5] -> comboMultiplier = [1, 1.05, 1.10, 1.20, 1.50, 2]`
            },
            "score" : total
        }]
        return scoringDataResult;
    }

    function hightestSetSizeCheck(checkAns, setSizeRecord){
        for (let i = 0; i < checkAns.length; i++){
            if (checkAns[i] === 'right' || checkAns[i] === 'late'){
                setSizeInCorrectAns.push(setSizeRecord[i])
            } 
        }
        setSizeInCorrectAns.sort((a,b) => a-b);
        return setSizeInCorrectAns;
    }

    function metricData(trialNumber, incorrectCount, correctButLateCount, setSizeInCorrectAns, timeLimitRecord, hitRt, avgHitRt, swiftness){
        timeLimitRecord.sort((a,b) => a-b);
        hitRt.sort((a,b) => a-b);
        let metricName 
            = ['correctCount', 
               'incorrectCount', 
               'correctButLateCount', 
               'highestSetSize', 
               'lowestTimeLimit', 
               'fastestHitReactionTime', 
               'averageHitReactionTime', 
               'swiftness',
               'hitAccuracy2SS',
               'avgHitReactionTime2SS',
               'hitAccuracy6SS',
               'avgHitReactionTime6SS',
               'hitAccuracy12SS',
               'avgHitReactionTime12SS',
               'hitAccuracy24SS',
               'avgHitReactionTime24SS',
               'hitAccuracy44SS',
               'avgHitReactionTime44SS',
               'correctRejectionAccuracy2SS',
               'avgCorrectRejectionTime2SS',
               'correctRejectionAccuracy6SS',
               'avgCorrectRejectionTime6SS',
               'correctRejectionAccuracy12SS',
               'avgCorrectRejectionTime12SS',
               'correctRejectionAccuracy24SS',
               'avgCorrectRejectionTime24SS',
               'correctRejectionAccuracy44SS',
               'avgCorrectRejectionTime44SS',];
        let metricValue 
            = [trialNumber - incorrectCount, 
               incorrectCount, 
               correctButLateCount, 
               setSizeInCorrectAns[setSizeInCorrectAns.length - 1], 
               timeLimitRecord[1], 
               hitRt[0], 
               avgHitRt, 
               swiftness,
               hitAccuracy2SetSize,
               avgHit2SetSizeRt,
               hitAccuracy6SetSize,
               avgHit6SetSizeRt,
               hitAccuracy12SetSize,
               avgHit12SetSizeRt,
               hitAccuracy24SetSize,
               avgHit24SetSizeRt,
               hitAccuracy44SetSize,
               avgHit44SetSizeRt,
               correctRejectionAccuracy2SetSize,
               avgCorrectRejection2SetSizeRt,
               correctRejectionAccuracy6SetSize,
               avgCorrectRejection6SetSizeRt,
               correctRejectionAccuracy12SetSize,
               avgCorrectRejection12SetSizeRt,
               correctRejectionAccuracy24SetSize,
               avgCorrectRejection24SetSizeRt,
               correctRejectionAccuracy44SetSize,
               avgCorrectRejection44SetSizeRt,];
        let metricUnit = [null, null, null, null, 'ms', 'ms', 's', null, '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's', '%', 's'];
        let metricDescription 
            = ['Total number of correct trials', 
               'Total number of incorrect trials', 
               'Total number of correct but late trials', 
               'The highest set size that user reached', 
               'The lowest time limit for trials that user reached', 
               'The fastest hit reaction time that user reached', 
               'The average of all hit reaction time', 
               'The quality of all hit reaction time',
               'The accuracy of 2 setsize hit',
               'The average reaction time of all 2 setsize hit',
               'The accuracy of 6 setsize hit',
               'The average reaction time of all 6 setsize hit',
               'The accuracy of 12 setsize hit',
               'The average reaction time of all 12 setsize hit',
               'The accuracy of 24 setsize hit',
               'The average reaction time of all 24 setsize hit',
               'The accuracy of 44 setsize hit',
               'The average reaction time of all 44 setsize hit',
               'The accuracy of 2 setsize correct rejection',
               'The average reaction time of all 2 setsize correct rejection',
               'The accuracy of 6 setsize correct rejection',
               'The average reaction time of all 6 setsize correct rejection',
               'The accuracy of 12 setsize correct rejection',
               'The average reaction time of all 12 setsize correct rejection',
               'The accuracy of 24 setsize correct rejection',
               'The average reaction time of all 24 setsize correct rejection',
               'The accuracy of 44 setsize correct rejection',
               'The average reaction time of all 44 setsize correct rejection',];
        for (let i = 0; i < metricName.length; i++){
            let obj_to_append
            obj_to_append = {
                "metricName" : metricName[i],
                "value" : metricValue[i],
                "unit" : metricUnit[i],
                "description" : metricDescription[i]
            }
            metricDataResult.push(obj_to_append);
        }    
        return metricDataResult;
    }

    function postEntry(targetDataResult, trialDataResult, gameLogicSchemeResult, scoringDataResult, metricDataResult){
        postEntryResult = {
            "date" : `${thisTime().toString()}`,
            "userId" : props.userId,
            "userPhone" : props.userPhone,
            "userSession" : props.userSession,
            "data" : {
                "rawData" : {
                    "target" : targetDataResult,
                    "trialData" : trialDataResult
                },
                "gameLogicScheme" : gameLogicSchemeResult,
                "scoringData" : scoringDataResult,
                "metricData" : metricDataResult
            }
        }
        return postEntryResult;
    }

    function touchStart(event) {
        event.target.classList.add('clicked');
    }

    function touchEnd(event) {
        event.target.classList.remove('clicked');
    }

    function refreshPage(){
        window.location.reload();
    } 

    function backToLandingPage(){
        navigate('/landing');
        refreshPage();
    }

    return (
     <div className='container-fluid'>
        <div className='row'>
            <div className='py-4 px-12 sm:py-8 w-full bg-blue-100 shadow-md'>
              {<BreadCrumb />}
            </div>
            <div id='CJSGameBody' className='col'>
              <div className="CJSGameBodyProgressBar">
                {<ProgressBar progressValue={progressValue} trialNumber={trialNumber}/>}
              </div>
              <div className="CJSGameWindow">
                {<CJSWindow searchTarget={searchTarget} searchTargetList={searchTargetList} canvasWidth={canvasWidth} canvasHeight={canvasHeight}/>}
              </div>
              <div className="CJSGameEnterButton">
                {<CJSButton searchTarget={searchTarget} disabledButton={disabledButton} checkResp={checkResp}/>}
              </div>
            </div>
        </div>
        {isItDone ? 
        <div>
            {<ScoreSummaryOverlay accuracy={((trialNumber - incorrectCount) / trialNumber) * 100} avgHitRt={avgHitRt} refreshPage={refreshPage} backToLandingPage={backToLandingPage}/>}
        </div>
        : null}
        {<RotateAlert />}
    </div>
    )
}


export default CJSGame;

function endTime() { 
    let d = new Date();
    return d.getTime();
}

function thisTime() {
    let thisTime = moment().format('YYYY-MM-DDTkk:mm:ss.SSSSSS');
    return thisTime;
}