import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import { saveDataToLocalStorage } from '../../uitls/offline';

function inputIsAllNumeric(text: string): boolean {
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(text);
}

function lengthIsinRange(text: string): boolean {
    return text.length === 4;
}

export default function ParticipantForm(props:{
    setUserPhone: (phone:string)=>void
    setUserId: (id:string)=>void
    setUserSession: (session:string)=>void
}) {
    const navigate = useNavigate();
    const [promptUserId, setPromptUserId] = useState("XXXX");
    const [promptUserPhone, setPromptUserPhone] = useState("XXXX");
    const [promptUserSession, setPromptUserSession] = useState("XXXX");

    return (
      <div className="h-screen">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
            <h2 className="mt-10 text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
              กรุณากรอกข้อมูล
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" >
              <div>
                <label htmlFor="userId" className="block text-sm font-medium leading-6 text-gray-900">
                  หมายเลขผู้เข้าร่วมงานวิจัย (subject#; กรุณากรอกตัวเลขสี่หลัก เช่น 0001)
                </label>
                <div className="mt-2">
                  <input onChange={
                    (e) => {setPromptUserId(e.target.value);}
                  }
                    id="userId"
                    name="userId"
                    type="tel"
                    autoComplete="userId"
                    required
                    className="block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tel" className="block text-sm font-medium leading-6 text-gray-900">
                  หมายเลขโทรศัพท์ 4 ตัวท้าย (last 4 digits of your phone number)
                </label>
                <div className="mt-2">
                  <input onChange={
                    (e) => {setPromptUserPhone(e.target.value);}
                  }
                    id="tel"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="session" className="block text-sm font-medium leading-6 text-gray-900">
                  ทำการทดสอบครั้งที่ (session; กรุณากรอกตัวเลขสี่หลัก เช่น 0001)
                </label>
                <div className="mt-2">
                  <input onChange={
                    (e) => {setPromptUserSession(e.target.value);}
                  }
                    id="session"
                    name="session"
                    type="tel"
                    autoComplete="session"
                    required
                    className="block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
  
              <div>
                <button onClick={()=>{
                  if (promptUserId === 'XXXX' || promptUserPhone === 'XXXX' || promptUserSession === 'XXXX'){
                    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
                  } else {
                    if (!inputIsAllNumeric(promptUserId) || !inputIsAllNumeric(promptUserPhone) || !inputIsAllNumeric(promptUserSession)) {
                      alert("กรุณากรอกเฉพาะตัวเลขเท่านั้น");
                    } else if (!lengthIsinRange(promptUserId) || !lengthIsinRange(promptUserPhone) || !lengthIsinRange(promptUserSession)) {
                      alert("กรุณากรอกเลข 4 หลักเท่านั้น");
                    } else {
                      props.setUserId(promptUserId);
                      props.setUserPhone(promptUserPhone);
                      props.setUserSession(promptUserSession);
                      navigate("/landing");
                      saveDataToLocalStorage('userId', promptUserId);
                      saveDataToLocalStorage('userPhone', promptUserPhone);
                      saveDataToLocalStorage('userSession', promptUserSession);
                    }
                  }
                }}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  เข้าร่วมการทดสอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }