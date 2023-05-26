import React from 'react';
import './SSWindow.css';

function SSWindow(props) {
  
  return (
    <div className="cirBtnContainer">
      <div className="signal readyToClick" id="goSignal"></div>
      <button className="cirButton 1 hoverDisabled" id='cirButton1' onClick={props.checkSeq}><div className="cirButtonBorder" id='border1'></div></button>
      <button className="cirButton 2 hoverDisabled" id='cirButton2' onClick={props.checkSeq}><div className="cirButtonBorder" id='border2'></div></button>
      <button className="cirButton 3 hoverDisabled" id='cirButton3' onClick={props.checkSeq}><div className="cirButtonBorder" id='border3'></div></button>
      <button className="cirButton 4 hoverDisabled" id='cirButton4' onClick={props.checkSeq}><div className="cirButtonBorder" id='border4'></div></button>
      <button className="cirButton 5 hoverDisabled" id='cirButton5' onClick={props.checkSeq}><div className="cirButtonBorder" id='border5'></div></button>
      <button className="cirButton 6 hoverDisabled" id='cirButton6' onClick={props.checkSeq}><div className="cirButtonBorder" id='border6'></div></button>            
    </div>
  )
}

export default SSWindow;