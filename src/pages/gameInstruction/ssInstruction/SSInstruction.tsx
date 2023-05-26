import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './SSInstruction.scss'
import BreadCrumb from '../../../components/breadcrumbs/breadCrumb';
import SSWindow from '../../../components/gameWindow/ssWindow/SSWindow';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import useSound from 'use-sound';
import clickSoundSrc from '../../../assets/sound/click.mp3'
import combo2SoundSrc from '../../../assets/sound/combo2.mp3';
import losingSoundSrc from '../../../assets/sound/losingStreak.mp3';
import instructionProgressbar from '../../../assets/png/progressBar.png';
import instructionPerson from '../../../assets/png/instructionPerson.png';
import instructionFinished from '../../../assets/png/instructionFinished.png';
import handClick from '../../../assets/png/handClick.png';
import $ from 'jquery';
import RotateAlert from '../../../components/rotateAlert/RotateAlert';

let progressBarElement: HTMLProgressElement;

//Test parameters
const flashDuration: number = 250;
const flashInterval: number = 750;

// Initaial values
let exampleSeq = [2,5];
let tutorial1 = [5,4];
let tutorial2 = [1,4,4];
let thisSeq: number[] = [];
let currSeq: number[] = [];
let currAns: number[] = [];
let isTest: boolean = false;
let timeoutList: any[] = [];

function SSInstruction() {
  const inputRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [tutorialStep, setTutorialStep] = useState(1);
  const [tutorialTest, setTutorialTest] = useState('');
  const [tutorialExample, setTutorialExample] = useState(false);
  const [tutorialHide, setTutorialHide] = useState(false);
  const [justWait, setJustWait] = useState(false);
  const [clickSound] = useSound(clickSoundSrc);
  const [combo2Sound] = useSound(combo2SoundSrc);
  const [losingSound] = useSound(losingSoundSrc);
  const [progressValue, setProgressValue] = useState(20);
  const gray = document.getElementById('grayOverlay');

  useEffect(() => {
      gray?.classList.add('show');
      progressBarElement = document.getElementById("progressBar") as HTMLProgressElement;

      return () => {
        timeoutList.forEach(tm => {
            clearTimeout(tm);
        })
      };
  }, [])

  function examplePopCircleButton(popTime = flashDuration, intervalTime = flashInterval) { 
      $('.instructionText').addClass('onDisable');
      $('.backInstruction').addClass('onDisable');
      $('.nextInstruction').addClass('onDisable');
      setJustWait(true);

      timeoutList.push(
          setTimeout(function () {
              $('#goSignalInstruction').html("ตาคุณ");
              $('.cirButtonInstruction').removeClass('hoverDisabled');
              $('.cirButtonInstruction').addClass('readyToClick');
          }, exampleSeq.length * ((popTime) + (intervalTime))) 
      )
      
      for (let i = 0; i < exampleSeq.length; i++){
          if (exampleSeq[i] === 2){
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2Instruction').addClass('pop');
                  }, i * intervalTime)
              )
      
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2Instruction').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }

          if (exampleSeq[i] === 5){
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5Instruction').addClass('pop');
                  }, i * intervalTime)
              )
      
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5Instruction').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
      }
      instructionAnimation();
  }

  function instructionAnimation(){
      let cueAndClickIntervalTime = 500;
      let afterClickIntervalTime = 4200;

      timeoutList.push(
          setTimeout(function () {
              $('.pointingHand').addClass('clickTheButton');
              $('#cirButton2Instruction').addClass('cir2Pop');
              $('#cirButton5Instruction').addClass('cir5Pop');
          }, flashDuration + (exampleSeq.length * flashInterval) + cueAndClickIntervalTime)
      );

      timeoutList.push(
          setTimeout(function () {
              $('#goSignalInstruction').html("");
              $('.cirButtonInstruction').addClass('hoverDisabled');
              $('.cirButtonInstruction').removeClass('readyToClick');
              $('.instructionText').removeClass('onDisable');
              $('.backInstruction').removeClass('onDisable');
              $('.nextInstruction').removeClass('onDisable');
              $('.pointingHand').removeClass('clickTheButton');
              $('#cirButton2Instruction').removeClass('cir2Pop');
              $('#cirButton5Instruction').removeClass('cir5Pop');
              setTutorialExample(true);
              setJustWait(false);
          }, flashDuration + (exampleSeq.length * flashInterval) + cueAndClickIntervalTime + afterClickIntervalTime)
      );
  }

  function timeIntervalPerTrial() {
        $('#goSignal').html("");
        $('.cirButton').addClass('hoverDisabled');
    
        timeoutList.push(
            setTimeout(function() {
            $('#goSignal').html("");
            $('#goSignal').html("3");
            }, 100) 
        )

        timeoutList.push(
            setTimeout(function() {
                $('#goSignal').html("");
                $('#goSignal').html("2");
            }, 1100) 
        )

        timeoutList.push(
            setTimeout(function() {
                $('#goSignal').html("");
                $('#goSignal').html("1");
            }, 2100) 
        )

        timeoutList.push(
            setTimeout(function() {
                $('#goSignal').html("");
            }, 3100) 
        )

        timeoutList.push(
            setTimeout(function() {
                instructionPopCircleButton();
            }, 4100) 
        )
    }

  function instructionPopCircleButton(popTime = flashDuration, intervalTime = flashInterval) {
      isTest = true;
      currAns = [];
      setTutorialTest('');
      $('#goSignal').html("");
      
      timeoutList.push(
          setTimeout(function () {
              $('#goSignal').html("ตาคุณ");
              $('.cirButton').removeClass('hoverDisabled');
              $('.cirButton').addClass('readyToClick');
          }, thisSeq.length * ((popTime/5) + (intervalTime))) 
      )
  
      for (let i = 0; i < thisSeq.length; i++) {
          if (thisSeq[i] === 1) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton1').addClass('pop');
                      currSeq.push(1);
                  }, i * intervalTime)
              )
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton1').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (thisSeq[i] === 2) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2').addClass('pop');
                      currSeq.push(2);
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton2').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (thisSeq[i] === 3) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton3').addClass('pop');
                      currSeq.push(3);
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton3').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (thisSeq[i] === 4) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton4').addClass('pop');
                      currSeq.push(4);
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton4').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (thisSeq[i] === 5) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5').addClass('pop');
                      currSeq.push(5); 
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton5').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          }
  
          if (thisSeq[i] === 6) {
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton6').addClass('pop');
                      currSeq.push(6);
                  }, i * intervalTime)
              )
              
              timeoutList.push(
                  setTimeout(function () {
                      $('#cirButton6').removeClass('pop');
                  }, popTime + (i * intervalTime))
              )
          } 
      }
  } 

  const checkSeq = event => {
      if (isTest === true){
        //   clickSound();
      }

      if (event.currentTarget.classList.contains('1')) {
          currAns.push(1);
          ($('#cirButton1').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton1').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('2')) {
          currAns.push(2);
          ($('#cirButton2').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton2').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('3')) {
          currAns.push(3);
          ($('#cirButton3').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton3').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('4')) { 
          currAns.push(4);
          ($('#cirButton4').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton4').removeClass('clicked') 
              }, 150)
          )
      } else if (event.currentTarget.classList.contains('5')) {
          currAns.push(5);
          ($('#cirButton5').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton5').removeClass('clicked') 
              }, 150)
          )
      } else {
          currAns.push(6);
          ($('#cirButton6').addClass('clicked'));
          timeoutList.push(
              setTimeout(function() {
                  $('#cirButton6').removeClass('clicked') 
              }, 150)
          )
      }

      if (currAns.length === thisSeq.length) {
          timeoutList.push(
              setTimeout(function() {
                  $('.cirButton').removeClass('clicked');
                  $('.cirButton').addClass('hoverDisabled'); 
              }, 150)
          )

          $('#goSignal').html("");
          $('.cirButton').removeClass('readyToClick');
          
          const equalCheck = (currAns, currSeq) => 
              currAns.length === currSeq.length && currAns.every((value, index) => value === currSeq[index]);
              isTest = false;
              setTutorialHide(false);
              
            if (equalCheck(currAns, currSeq)) {
                $('#goSignal').html("ถูก");
                setTutorialTest('right');
                // combo2Sound();
                currSeq = [];

              if (tutorialStep === 5){
                  setProgressValue(60);
              } else if (tutorialStep === 7){
                  setProgressValue(100);
              }

            } else {
                $('#goSignal').html("ผิด");
                setTutorialTest('wrong');
                // losingSound();
                currSeq = [];
            }
      }
  };

  function instructionControl() {
      if (tutorialStep === 2){
          if (tutorialExample === false){
              examplePopCircleButton();
          } else {
              setTutorialExample(false);
              setTutorialStep(tutorialStep + 1);
          }
      } else if (tutorialStep === 4 || tutorialStep === 6){
          if (tutorialStep === 4){
              thisSeq = tutorial1;
              timeIntervalPerTrial();
          } else if (tutorialStep === 6){
              thisSeq = tutorial2;
              timeIntervalPerTrial();
          }
          setTutorialHide(true);
          setTutorialStep(tutorialStep + 1);
      } else if (tutorialStep === 5){
          if (tutorialTest === 'wrong') {
              setTutorialHide(true);
              thisSeq = tutorial1;
              timeIntervalPerTrial();
          } else {
              setTutorialStep(tutorialStep + 1);
          }
      } else if (tutorialStep === 7){
          if (tutorialTest === 'wrong') {
              setTutorialHide(true);
              thisSeq = tutorial2;
              timeIntervalPerTrial();
          } else {
              setTutorialStep(tutorialStep + 1);
          }
      } else {
          setTutorialStep(tutorialStep + 1);
      }
  }

  function backToSSLanding() {
    navigate('/spatial-span');
  }

  return (
    <div className='container-fluid'>
        {tutorialHide === false ? 
        <div className="row">
            <div className="tutorial">
                <div className={'progressBarContainerInstruction' + (tutorialStep === 8 ? '' : ' onHide')}>
                <img src={instructionProgressbar} alt="progressbar" id="instructionProgressbar"></img>       
                </div>
                <div className={'instructionContainer' + (tutorialStep === 9 ? ' centered': '')}>
                <div className={'cirBtnContainerInstruction' + (tutorialStep === 2 ? '' : ' onHide')}>
                    <div className="container">
                        <p className='exampleText'>ตัวอย่าง</p>
                        <img src={handClick} alt="a pointing hand" className={'pointingHand' + (tutorialStep === 2 ? '' : ' onHide')}></img>
                        <div className="signalInstruction" id="goSignalInstruction"></div>
                        <button ref={inputRef} className="cirButtonInstruction 1" id='cirButton1Instruction'></button>
                        <button ref={inputRef} className="cirButtonInstruction 2" id='cirButton2Instruction'></button>
                        <button ref={inputRef} className="cirButtonInstruction 3" id='cirButton3Instruction'></button>
                        <button ref={inputRef} className="cirButtonInstruction 4" id='cirButton4Instruction'></button>
                        <button ref={inputRef} className="cirButtonInstruction 5" id='cirButton5Instruction'></button>
                        <button ref={inputRef} className="cirButtonInstruction 6" id='cirButton6Instruction'></button> 
                    </div>
                </div>
                <div className="instructionPerson">
                    <img src={instructionPerson} alt="an instruction guy" className={'personStart' + (tutorialStep !== 2 && tutorialStep < 9 ? '' : ' onHide')}></img>
                    <img src={instructionFinished} alt="an instruction guy" className={'personEnd' + (tutorialStep === 9 ? '' : ' onHide')}></img>
                </div>
                <div className="instructionBox">
                    <div className= "instructionText">
                        {tutorialStep === 1 ? <p>สวัสดีครับ วันนี้ผมจะมาสอนวิธี <br></br>เล่นเกม <b>'จำจด กดตาม'</b></p> : null}
                        {tutorialStep === 2 ? <p>ในเกมนี้ คุณต้อง<br></br><b>1. จำลำดับของสัญญาณไฟ</b> <br></br>ที่กระพริบบนหน้าจอ <br></br><b>2. กดปุ่มตามให้ถูกต้อง</b></p> : null}
                        {tutorialStep === 3 ? <p>ความเร็วไม่มีผลต่อคะแนนในเกมนี้<br></br>ดังนั้นไม่ต้องรีบกดครับ</p> : null}
                        {tutorialStep === 4 ? <p>เรามาลองเล่นกันดูครับ </p> : null}
                        {tutorialStep === 5 && tutorialTest === 'wrong' ? <p>ยังไม่ถูกต้อง ลองดูอีกทีนะครับ</p> : null}
                        {tutorialStep === 5 && tutorialTest === 'right' ? <p>ถูกต้องครับ! <br></br><br></br> คราวนี้จะลองเพิ่มสัญญาณไฟ<br></br>เป็น 3 ครั้ง</p> : null}
                        {tutorialStep === 6 ? <p>ไฟสามารถกระพริบซ้ำปุ่มเดิมได้ <br></br>เพราะฉะนั้น ดูดี ๆ นะครับ</p> : null}
                        {tutorialStep === 7 && tutorialTest === 'wrong' ? <p>ยังไม่ถูกต้อง ลองดูอีกทีนะครับ</p> : null}
                        {tutorialStep === 7 && tutorialTest === 'right' ? <p>สุดยอด! คุณเรียนรู้ไวมาก <br></br><br></br>เมื่อคุณเล่นไปเรื่อย ๆ เกมจะเพิ่ม <br></br>จำนวนสัญญาณไฟที่คุณต้องจำ </p> : null}
                        {tutorialStep === 8 ? <p>ทุกข้อที่คุณตอบ แถบนี้จะเพิ่มขึ้น <br></br>เมื่อแถบนี้เต็ม เกมก็จะจบลง</p> : null}
                        {tutorialStep === 9 ? <p>ยินดีด้วย! คุณได้ผ่านการฝึกเล่น <br></br>เกม <b>'จำจด กดตาม'</b> แล้ว</p> : null}
                    </div>
                    <div className="instructionControl">
                        <div className="instructionBtnBack">
                            {tutorialStep === 1
                            || tutorialStep === 5 
                            || tutorialStep === 7 
                            || tutorialExample === true 
                            ? null : <button disabled={justWait === true} className="backInstruction" onMouseDown={() => {setTutorialStep(tutorialStep - 1)}}>{`< ย้อนกลับ`}</button>}
                            {tutorialExample === true ? <button disabled={justWait === true} className="backInstruction" onMouseDown={() => {examplePopCircleButton()}}><span className="bi bi-arrow-clockwise"></span>{' ดูอีกครั้ง'}</button> : null}
                        </div>
                        <div className="instructionBtnNext">
                        {tutorialStep === 5 && tutorialTest === 'wrong' || tutorialStep === 7 && tutorialTest === 'wrong' ? <button className="nextInstruction" onMouseDown={() => {instructionControl()}}>{`ลองอีกครั้ง >`}</button> : null}
                        {tutorialStep < 9 ?  
                            <button disabled={justWait === true} className={'nextInstruction' + (tutorialTest === 'wrong' ? ' onHide' : '')} onMouseDown={() => {instructionControl()}}>
                                {tutorialStep === 2 && tutorialExample === false ? `ดูตัวอย่าง >` : null}
                                {tutorialStep === 2 && tutorialExample === true ? `ฉันเข้าใจแล้ว >` : null}
                                {tutorialStep !== 2 && tutorialStep !== 4 && tutorialStep !== 6 ? `ถัดไป >` : null}
                                {tutorialStep === 4 ? `ลองเล่น >` : null}
                                {tutorialStep === 6 ? `เริ่มเลย >` : null}</button> :
                            <button className="nextInstruction" onMouseDown={() => {backToSSLanding()}}>{`กลับเมนูเกม >`}</button> }    
                        </div>
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
            <div id='SSInstructionBody'>
            <div className="SSInstructionBodyProgressBar">
              {<ProgressBar progressValue={progressValue} trialNumber={100}/>}
            </div>
              <div className="SSInstructionWindow">
                {<SSWindow checkSeq={checkSeq}/>}
              </div>
              <div className="SSInstructionEnterButton"></div>
            </div>
        </div>
        {<RotateAlert />}
    </div>
  )
}

export default SSInstruction