import { View } from 'react-native';
// Wajib menggunakan {} karena menggunakan export const
import { RoomList } from '../components/RoomList'; 

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <RoomList/>
    </View>
  );
}