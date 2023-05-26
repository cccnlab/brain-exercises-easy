import React from 'react';
import './ScoreSummaryOverlay.scss';
import scoreBadge from '../../assets/png/scoreBadge.png';

function ScoreSummaryOverlay(props) {
  return (
    <div className="summary">
      <div className="summaryContainer">
          <div className="summaryHeader">
              <p className='thisScore'>ตอบถูกทั้งหมด</p>
              <p className='bigScore'>{Math.round(props.accuracy).toLocaleString() + ' %'}</p>
          </div>
          <div className="summaryBadge">
              <img src={scoreBadge} alt='badge' className={'medalBadge'}></img>
              {props.hardGNGDone ? <p className='highestScore'>เผลอกดผิดพลาด: {Math.round(props.falseHit)} %</p> : null}
              <p className='highestScore'>ความเร็วเฉลี่ย: {(props.avgHitRt).toFixed(2)} วินาที</p>
          </div>
          <div className="btnContainerSummary">
              <button className='summaryBtnPlayAgain' onClick={props.refreshPage}>{`เล่นอีกครั้ง`}</button>
              <button className='summaryBtnHome' onClick={props.backToLandingPage}>{`กลับหน้าหลัก`}</button>
          </div>
      </div>
  </div>
  )
}

export default ScoreSummaryOverlay;