import React, { useEffect, useState } from 'react'
import './AppHeader.css'
import { useLocation, useNavigate } from 'react-router-dom';

let defaultHeaderText = 'ยังจำ (Youngjum)';
let SSHeaderText = 'จำจด กดตาม';
let CJSHeaderText = 'หากันจนเจอ';
let GNGHeaderText = 'เขียวไป';

function AppHeader() {
  const [headerText, setHeaderText] = useState('');
  const [isHideHomeButton, setIsHideHomeButton] = useState(false);
  const location = useLocation();
  const pathName = location.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    if (pathName === '/landing') {
      setHeaderText(defaultHeaderText);
    } else if (pathName.includes('/spatial-span')) {
      setHeaderText(SSHeaderText);
    } else if (pathName.includes('/conjunction-search')) {
      setHeaderText(CJSHeaderText);
    } else if (pathName.includes('/go-nogo')) {
      setHeaderText(GNGHeaderText);
    }

    if (pathName.includes('/instruction') || pathName.includes('/trial'))   {
      setIsHideHomeButton(true);
    } 
  }, [])
  
  function backToLandingPage() {
    navigate('/landing');
  }

  return (
    <div className="appHeaderContainer">
      <div className="headerText">
        {headerText}
      </div>
      {isHideHomeButton ? undefined : 
        <div className="flexHomeBtn">
          <div className="picInHome">
            <button className='homePic' style={{ color: 'white' }} onClick={backToLandingPage}>
                <span className="bi bi-house-door back-home-icon" ></span>
            </button>
          </div>
          <div className="textInHome">
              <small> กลับหน้าหลัก </small>
          </div>
        </div>
      }
    </div>
  )
}

export default AppHeader