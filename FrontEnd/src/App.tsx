import WaitingRoomDisplay from './components/WaitingRoomDisplay';
import ReceptionPanel from './components/ReceptionPanel';
import DoctorPanel from './components/DoctorPanel';
import React from 'react'


export default function App(){
  return (
    <div className='grid grid.cols-1 md:grid-clos-3 gap-4 p-6 bg-gray-50 min-h-screen'>
      <div>
        <WaitingRoomDisplay title='Sala de espera -General' specialtyFilter='Medicina General'/>
      </div>
      <div>
        <ReceptionPanel />
      </div>
      <div>
        <DoctorPanel specialty='Medicina General' />
      </div>
    </div>
  );
}