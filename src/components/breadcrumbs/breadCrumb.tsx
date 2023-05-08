import { HomeIcon } from '@heroicons/react/20/solid'
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './breadCrumb.css'
import { getDataFromLocalStorage } from '../../uitls/offline';

export default function BreadCrumb() {
  const [headerText, setHeaderText] = useState('');
  const [gameButtonLink, setGameButtonLink] = useState('#/landing');
  const [disableHomeButton, setDisableHomeButton] = useState('');
  const [disableGameButton, setDisableGameButton] = useState('');
  const [hideUserId, setHideUserId] = useState(false);
  const location = useLocation();
  const pathName = location.pathname;
  
  let id = getDataFromLocalStorage('userId');
  let SSHeaderText = 'จำจด กดตาม';
  let CJSHeaderText = 'หากันจนเจอ';
  let GNGHeaderText = 'เขียวไป แดงหยุด';
  let pages = [
    { name: headerText, href: gameButtonLink, current: false },
  ]

  useEffect(() => {
    if (pathName === '/landing') {
      setHeaderText('หน้าเลือกเกม');
    } else {
      setHideUserId(true);
      if (pathName.includes('/spatial-span')) {
        setHeaderText(SSHeaderText);
        setGameButtonLink('#/spatial-span');
      } else if (pathName.includes('/conjunction-search')) {
        setHeaderText(CJSHeaderText);
        setGameButtonLink('#/conjunction-search');
      } else if (pathName.includes('/go-nogo')) {
        setHeaderText(GNGHeaderText);
        setGameButtonLink('#/go-nogo');
      }
    }

    if (pathName.includes('/instruction') || pathName.includes('/trial')) {
      setDisableHomeButton(' disabled')
      setDisableGameButton(' disabled');
    } 
  }, [])
  
  return (
    <nav className="flex h-fit justify-between" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href={'#/landing'} className={`text-gray-400 hover:text-gray-500 + ${disableHomeButton}`}>
              <HomeIcon className="h-5 w-5 sm:h-8 sm:w-8 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 sm:h-8 sm:w-8 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <a
                href={page.href}
                className={`ml-4 text-sm sm:text-lg font-medium sm:font-medium text-gray-500 + ${disableGameButton}`}
                aria-current={page.current ? 'page' : undefined}
              >
                {page.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
      {hideUserId ? null : 
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <a
              className={`ml-4 text-sm sm:text-lg font-medium sm:font-medium text-gray-500 + ${disableGameButton}`}
            >
              {`ผู้ใช้ : ` + id}
            </a>
          </li>
          <li>
            <div>
              <a href={''} className={`text-gray-400 hover:text-gray-500 + ${disableHomeButton}`}>
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-500" />
              </a>
            </div>
          </li>
        </ol>
      }
    </nav>
  )
}