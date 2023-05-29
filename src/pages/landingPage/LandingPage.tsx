import React from 'react';
import './LandingPage.css';
import GameSelectionCard from '../../components/gameSelectionCard/gameSelectionCard';
import BreadCrumb from '../.././components/breadcrumbs/breadCrumb';
import RotateAlert from '../../components/rotateAlert/RotateAlert';
import SSImage from  '../../assets/png/ss-img.png'
import CJSImage from  '../../assets/png/conjs-img.png'
import GNGImage from  '../../assets/png/gonogo-img.png'

const gameInfos = [
  {
    name: 'เขียวไป แดงหยุด',
    title: 'Go-Nogo',
    domain: 'สมาธิ',
    gameUri: 'go-nogo',
    image: `${GNGImage}`,
  },
  {
    name: 'หากันจนเจอ',
    title: 'Conjunction Search',
    domain: 'ความไว',
    gameUri: 'conjunction-search',
    image: `${CJSImage}`,
  },
  {
    name: 'จำจด กดตาม',
    title: 'Spatial Span',
    domain: 'ความจำ',
    gameUri: 'spatial-span',
    image: `${SSImage}`,
  }
]

function LandingPage() {
  return (
    <div className='h-screen w-full bg-slate-50'>
      <div className="row">
        <div className='py-4 px-12 sm:py-8 w-full bg-blue-100 shadow-md'>
            {<BreadCrumb />}
        </div>
        <div className='w-full px-8 sm:px-12 py-12 sm:py-24'>
            <div id='LandingPageBody'>
              {<GameSelectionCard games={gameInfos} />}
            </div>
        </div>
      </div>
        {<RotateAlert />}
    </div>
  )
}

export default LandingPage