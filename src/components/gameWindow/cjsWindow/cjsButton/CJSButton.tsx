import React from 'react'
import './CJSButton.scss'

function CJSButton(props) {
  return (
    <div>
        {props.searchTarget ?
                <div className="btnContainer">
                    <button id='no-btn' disabled = {props.disabledButton} className='btn no-btn circle lg'
                        onMouseDown={e => props.checkResp(0)}> ไม่มี </button>

                    <button id='yes-btn' disabled = {props.disabledButton} className='btn yes-btn circle lg'
                        onMouseDown={e => props.checkResp(1)}> มี </button>
                </div>
            : null}
    </div>
  )
}

export default CJSButton