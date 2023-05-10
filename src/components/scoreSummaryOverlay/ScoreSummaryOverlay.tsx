import React from 'react';
import './ScoreSummaryOverlay.scss';
import scoreBadge from '../../assets/png/scoreBadge.png';

function ScoreSummaryOverlay(props) {
  return (
    <div className="summary">
      <div className="summaryContainer">
          <div className="summaryHeader">
              <p className='thisScore'>คะแนนครั้งนี้</p>
              <p className='bigScore'>{props.sumScores.toLocaleString()}</p>
          </div>
          <div className="summaryBadge">
              <img src={scoreBadge} alt='badge' className={'medalBadge'}></img>
              {/* <p className='highestScore'>คะแนนสูงสุด: 67,445</p> */}
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