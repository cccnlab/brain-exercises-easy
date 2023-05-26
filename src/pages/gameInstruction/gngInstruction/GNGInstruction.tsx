import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GNGInstruction.scss';
import BreadCrumb from '../../../components/breadcrumbs/breadCrumb';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import GNGWindow from '../../../components/gameWindow/gngWindow/GNGWindow';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3';
import combo1SoundSrc from '../../../assets/sound/combo1.mp3';
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import combo3SoundSrc from '../../../assets/sound/combo3.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import instructionProgressbar from '../../../assets/png/progressBar.png';
import instructionPerson from '../../../assets/png/instructionPerson.png';
import instructionFinished from '../../../assets/png/instructionFinished.png';
import { Shuffle } from '../../../scripts/shuffle';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';


let progressBarElement: HTMLProgressElement;
let flashDuration = 300;
let baseFlashInterval = 600;
let correctCountForCombo = 0;
let tempEventGoNoGo: number[] = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
Shuffle(tempEventGoNoGo);
let eventId = [0];
eventId = eventId.concat(tempEventGoNoGo);
eventId = eventId.concat(0);
let trialNumber = eventId.length;
let jitterBase = 400;
let jitterAmplitude = 300;
const Jitter = [Math.random() * jitterAmplitude + jitterBase];
for (let i = 0; i < eventId.length - 1; i++) {
    Jitter.push((Math.random() * jitterAmplitude + jitterBase) + Jitter[i])
}
let timeoutList: any[] = [];

function GNGInstruction(props) {
    const navigate = useNavigate();
    const [tutorialStep, setTutorialStep] = useState(1);
    const [tutorialTest, setTutorialTest] = useState('');
    const [tutorialHide, setTutorialHide] = useState(false);
    const [btnOnClicked, setBtnOnClicked] = useState(false);
    const [circleBtnClass, setCircleBtnClass] = useState('');
    const [shouldClick, setShouldClick] = useState(false);
    const [currentColor, setCurrentColor] = useState('');
    const [progressValue, setProgressValue] = useState(30);
    const [clickSound] = useSound(clickSoundSrc);
    const [combo1Sound] = useSound(combo1SoundSrc);
    const [combo2Sound] = useSound(combo2SoundSrc);
    const [combo3Sound] = useSound(combo3SoundSrc);
    const [losingSound] = useSound(losingSoundSrc);
    
    useEffect(() => {
        progressBarElement = document.getElementById("progressBar") as HTMLProgressElement;
        return () => {
            timeoutList.forEach(tm => {
                clearTimeout(tm);
            })
        };
    }, [])

    function clearAllTimeout() {
        for (let i = 0; i < timeoutList.length; i++) {
            clearTimeout(timeoutList[i]);
        }
        timeoutList = [];
    }

    function popColor(popTime, intervalTime, colors) {
        for (let iSeq = 0; iSeq < trialNumber; iSeq++) {
            if (colors[iSeq] === 0) {
                timeoutList.push(
                    setTimeout(function () {
                        setShouldClick(false);
                        setCurrentColor('white');
                    }, (iSeq * intervalTime) + Jitter[iSeq])
                );
            } else if (colors[iSeq] === 1) {
                timeoutList.push(
                    setTimeout(function () {
                        setCircleBtnClass("green")
                        setShouldClick(true);
                        setCurrentColor('green');
                    }, (iSeq * intervalTime) + Jitter[iSeq])
                )

                timeoutList.push(
                    setTimeout(function () {
                        setCircleBtnClass("")
                        setShouldClick(true);
                    }, popTime + (iSeq * intervalTime) + Jitter[iSeq])
                    );
                } else if (colors[iSeq] === 2) {
                    timeoutList.push(
                        setTimeout(function () {
                            setCircleBtnClass("red")
                            setShouldClick(false);
                            setCurrentColor('red');
                        }, (iSeq * intervalTime) + Jitter[iSeq])
                );

                timeoutList.push(
                    setTimeout(function () {
                        setCircleBtnClass("")
                        setShouldClick(false);
                    }, popTime + (iSeq * intervalTime) + Jitter[iSeq])
                );
            }
        }
        tutorialPopIsOver(popTime + ((trialNumber - 1) * intervalTime) + Jitter[trialNumber - 1] + 200);
    }

    function tutorialPopIsOver(waitTheWholeTime: number) {
        timeoutList.push(
            setTimeout(function () {
                if (tutorialTest === '') {
                    setTutorialStep(tutorialStep - 0);
                }

                if (tutorialTest === 'wrong') {
                    setTutorialStep(tutorialStep - 2);
                }

                setTutorialHide(false);
                setProgressValue(30);
                correctCountForCombo = 0;
            }, waitTheWholeTime)
        )
    }

    function instructionControl() {
        if (tutorialStep === 11 && tutorialTest === 'wrong') {
            setTutorialTest('');
            setTutorialStep(tutorialStep - 1);
            setTutorialHide(true);
            setTimeout(() => {
                Shuffle(tempEventGoNoGo);
                let eventId = [0];
                eventId = eventId.concat(tempEventGoNoGo);
                eventId = eventId.concat(0);
                popColor(flashDuration, baseFlashInterval, eventId);
            }, 100);
        } else {
            setTutorialStep(tutorialStep + 1);
            if (tutorialStep !== 4 && tutorialStep !== 9) {
                setTutorialHide(false);
            } else {
                setTutorialHide(true);
            }
        }

        if (tutorialStep === 4) {
            setTimeout(() => {
                setCircleBtnClass("go-flash");
            }, 500);
        } else {
            setCircleBtnClass("");
        }

        if (tutorialStep === 9) {
            popColor(flashDuration, baseFlashInterval, eventId);
        }
    }

    function touchStart(event) {
        event.target.classList.add('clicked');
    }

    function touchEnd(event) {
        event.target.classList.remove('clicked');
    }

    function checkResp(foo) {
        // clickSound();
        if (tutorialStep === 5) {
            // combo1Sound();
            instructionControl();
        }

        if (tutorialStep === 10) {
            if (shouldClick === true) {
                setShouldClick(false);
                if (correctCountForCombo === 3) {
                    correctCountForCombo = 3;
                } else {
                    correctCountForCombo++;
                }

                if (correctCountForCombo === 1) {
                //    combo1Sound();
                   setProgressValue(progressValue + 24);
                } else if (correctCountForCombo === 2) {
                //    combo2Sound();
                   setProgressValue(progressValue + 24);
                } else if (correctCountForCombo === 3) {
                //    combo3Sound();
                   setTutorialTest('right');
                   instructionControl();
                   setProgressValue(progressValue + 24);
                   clearAllTimeout();
                } 
    
            } else {
                // losingSound();
                setProgressValue(30);
                correctCountForCombo = 0;
                if (currentColor === "red") {
                    setTutorialTest('wrong');
                    instructionControl();
                    clearAllTimeout();
                }
            }
        }
    }

    function backToGNGLanding() {
        navigate('/go-nogo');
    }

    return (
        <div className='card' style={{ alignItems: 'center', placeContent: 'center' }}>
            {tutorialHide === false ?
                <div className="tutorial">
                        <div className={'progressBarContainerInstruction' + (tutorialStep === 11 && tutorialTest === 'right' ? '' : ' onHide')}>
                            <img src={instructionProgressbar} alt="progressbar" id="instructionProgressbar"></img>       
                        </div>
                    <div className={'instructionContainer' + (tutorialStep === 12 ? ' centered': '')}>
                        <div className={'TokBtnContainerInstruction' + (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 7 || tutorialStep === 8 || tutorialStep === 11 && tutorialTest === 'wrong'  ? '' : ' onHide')}>
                            {tutorialStep === 2 ? <button id="TokButtonInstruction" className={`tok-btn `}></button> : null}
                            {tutorialStep === 3 ? <button id="TokButtonInstruction" className={`tok-btn green`}></button> : null}
                            {tutorialStep === 7 || tutorialStep === 8 || tutorialStep === 11 ? <button id="TokButtonInstruction" className={`tok-btn red`}></button> : null}
                        </div>
                        <div className="instructionPerson">
                            <img src={instructionPerson} alt="an instruction guy" className={'personStart' + (tutorialStep < 12 ? '': ' onHide')}></img>
                            <img src={instructionFinished} alt="an instruction guy" className={'personEnd' + (tutorialStep === 12 ? '': ' onHide')}></img>
                        </div>
                        <div className="instructionBox">
                            <div className= "instructionText">
                                {tutorialStep === 1 ? <p>สวัสดีครับ วันนี้ผมจะมาสอนวิธี <br></br>เล่นเกม <b>'เขียวไป แดงหยุด'</b></p> : null}
                                {tutorialStep === 2 ? <p>เป้าหมายของเกมนี้คือการ <br></br><b>กดปุ่มบนหน้าจอให้เร็วที่สุด</b> <br></br><b>เมื่อมีสัญญาณไฟ</b></p> : null}
                                {tutorialStep === 3 ? <p>เมื่อสัญญาณไฟ <b style={{ color : `#26A445`}}>สีเขียว</b> สว่างขึ้น <br></br>ให้คุณ <b>กดปุ่มตรงกลางให้เร็วที่สุด</b></p> : null}
                                {tutorialStep === 4 ? <p>เรามาลองเล่นกันดูครับ </p> : null}
                                {tutorialStep === 6 ? <p>สุดยอดไปเลย คุณทำได้ดีมาก! </p> : null}
                                {tutorialStep === 7 ? <p>เพื่อเพิ่มความท้าทาย เกมนี้จะมีไฟ <br></br><b style={{ color : `#E52D27`}}>สีแดง</b> ที่คุณจะต้องระวัง</p> : null}
                                {tutorialStep === 8 ? <p>ถ้า <b style={{ color : `#E52D27`}}>สีแดง</b> สว่างขึ้น <b>ไม่ต้องกดอะไร</b> <br></br><b>และรอสัญญาณไฟอันต่อไป</b></p> : null}
                                {tutorialStep === 9 ? <p>เรามาลองเล่นกันดูครับ <br></br>รอบนี้จะมีไฟ <b style={{ color : `#26A445`}}>สีเขียว</b> และ <b style={{ color : `#E52D27`}}>สีแดง</b></p> : null}
                                {tutorialStep === 11 && tutorialTest === 'wrong' ? <p>อย่าลืมนะครับ ว่าถ้า <b style={{ color : `#E52D27`}}>สีแดง</b> <br></br>สว่างขึ้น <b>ไม่ต้องกดอะไร</b> <br></br><b>และรอสัญญาณไฟอันต่อไป</b></p> : null}
                                {tutorialStep === 11 && tutorialTest === 'right' ? <p>เมื่อแถบนี้เต็ม เกมก็จะจบลง</p> : null}
                                {tutorialStep === 12 ? <p>ยินดีด้วย! คุณได้ผ่านการฝึกเล่น <br></br>เกม <b>'เขียวไป แดงหยุด'</b> แล้ว</p> : null}
                            </div>
                            <div className="instructionControl">
                                <div className="instructionBtnBack">
                                {tutorialStep === 1 || tutorialStep === 6 || tutorialStep === 11 ? null : <button className="backInstruction" onMouseDown={() => {setTutorialStep(tutorialStep - 1)}}>{`< ย้อนกลับ`}</button>}
                                </div>
                                <div className="instructionBtnNext">
                                {tutorialStep === 11 && tutorialTest === 'wrong' ? <button className="nextInstruction" onMouseDown={() => {instructionControl()}}>{`ลองอีกครั้ง >`}</button> : null}
                                {tutorialStep < 12 ?  
                                    <button className={'nextInstruction' + (tutorialTest === 'wrong' ? ' onHide' : '')} onMouseDown={() => {instructionControl()}}>{tutorialStep === 4 || tutorialStep === 9 ? `ลองเล่น >` : `ถัดไป >`}</button> :
                                    <button className="nextInstruction" onMouseDown={() => {backToGNGLanding()}}>{`กลับเมนูเกม >`}</button> }    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            : null}
            <div className='row'>
                <div className='py-4 px-12 sm:py-8 w-full bg-blue-100 shadow-md'>
                    {<BreadCrumb />}
                </div>
                <div id='GNGInstructionBody'>
                <div className="GNGInstructionBodyProgressBar">
                    {<ProgressBar progressValue={progressValue} trialNumber={100}/>}
                </div>
                <div className="GNGInstructionWindow">
                {<GNGWindow checkResp={checkResp} touchStart={touchStart} touchEnd={touchEnd} btnOnClicked={btnOnClicked} circleBtnClass={circleBtnClass}/>}
                </div>
                    <div className="GNGInstructionEnterButton"></div>
                </div>
            </div>
            {<RotateAlert />}
        </div>
    )
}
    export default GNGInstruction;