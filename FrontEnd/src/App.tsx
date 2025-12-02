import WaitingRoomDisplay from './components/WaitingRoomDisplay';
import ReceptionPanel from './components/ReceptionPanel';
import DoctorPanel from './components/DoctorPanel';


export default function App() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {/*Panel Sala de Espera */}
      <div>
        <WaitingRoomDisplay
          title='Sala de espera -General'
          specialtyFilter='Medicina General'
        />
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