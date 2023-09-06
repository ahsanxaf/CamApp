import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button, StatusBar, Platform } from 'react-native';
import { RNCamera, TakePictureResponse, RNCameraProps } from 'react-native-camera';
import RNFS from 'react-native-fs'
import CameraHeader from './components/CameraHeader';
import SettingsModal from './components/SettingsModal';
import {GestureHandlerGestureEvent, PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler'
import {FlashMode, CameraQuality } from './types/Types';
import {useNamingScheme} from './contexts/NamingSchemeContext';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';



const APP_ALBUM_NAME = 'CamApp';
const CameraScreen: React.FC<{route: ReactNode}> = ({route}) => {
  const cameraRef = useRef<RNCamera>(null);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedQualityStream, setSelectedQualityStream] = useState<CameraQuality>('high')
  const [selectedQualityForCapture, setSelectedQualityForCapture] = useState<CameraQuality>('medium');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const { namingScheme, setNamingScheme } = useNamingScheme();
  const [selectedSavePath, setSelectedSavePath] = useState<string>(''); // State to store the selected path for saving
  const [isFramingLinesVisible, setIsFramingLinesVisible] = useState(false);

  const requestStoragePermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  
      if (result === 'granted') {
        console.log('Storage permission granted');
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
    }
  };

  const toggleFlash = () => {
    flashMode === 'off' ? setFlashMode('on') : setFlashMode('off');
  }

  const handleSettingsPress = () => {
    setShowSettingModal(true);
    console.log("setting button pressed!");
  };

  const handleQualitySelect  = async(selectedQuality: CameraQuality) => {
    setSelectedQualityForCapture(selectedQuality);
    console.log('Selected Camera Quality: ', selectedQuality);
  };

  const updateSequence = () => {
    const currentSequence = namingScheme.sequence || "";
    const sequenceParts = currentSequence.split("_");
    let newSequence = currentSequence;

    if (sequenceParts.length > 1) {
      // If the sequence already contains an underscore and a number, increment the number
      const lastPart = sequenceParts[sequenceParts.length - 1];
      if (!isNaN(parseInt(lastPart))) {
        const newNumber = parseInt(lastPart) + 1;
        newSequence = sequenceParts.slice(0, sequenceParts.length - 1).join("_") + "_" + newNumber;
      } else {
        // If the last part is not a number, simply add "_1" to the end
        newSequence += "_1";
      }
    } else {
      // If the sequence doesn't contain an underscore, add "_1" to the end
      newSequence += "_1";
    }

    setNamingScheme((prevScheme) => ({ ...prevScheme, sequence: newSequence }));
  };

  const selectFileName = (data: string) => {
    var fileName = '';
    if(data){
      if(namingScheme?.type === 'datetime'){
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:-]/g, '').split('.')[0];
        fileName = `${namingScheme.prefix}_${formattedDate}`
      }
      else if(namingScheme?.type === 'sequence'){
        fileName = `${namingScheme.prefix} ${namingScheme.sequence}`
        updateSequence();
      }
      else if(namingScheme?.type === 'datetime & sequence'){
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:-]/g, '').split('.')[0];
        fileName = `${namingScheme.prefix} ${formattedDate}_${namingScheme.sequence}`;
        updateSequence();
      }
      else{
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:-]/g, '').split('.')[0];
        const prefix = 'IMG'
        fileName = `${prefix}_${formattedDate}`;
      }
    }
    return fileName;
  };

  const savePicture = async(data: string | undefined) => {
    if(data){
      const fileName = selectFileName(data);
      const directoryName: string = APP_ALBUM_NAME;
      requestStoragePermission();
      const folderPath = `${RNFS.ExternalStorageDirectoryPath}/${selectedSavePath}/${directoryName}`;
      console.log("folder path: ", folderPath);
      const folderExists =  await RNFS.exists(folderPath);
      if(!folderExists){
        await RNFS.mkdir(folderPath, {NSURLIsExcludedFromBackupKey: true})
      }
      const filePath = `${folderPath}/${fileName}.jpg`;
      console.info('filePath: ', filePath)
      await RNFS.writeFile(filePath, data, 'base64');
      console.log('Picture saved successfully: ', filePath);
    }else{
      console.error('Base64 data is undefined. Unable to save the  picture')
    }
  }

  const takePicture = async (quality: CameraQuality) => {
    if(cameraRef.current){
      try{
        const options = {
          quality: quality === 'low' ? 0.4 : quality === 'medium' ? 0.7 : 1, 
          base64: true, 
          flashMode: flashMode,
          forceUpOrientation: true,
          fixOrientation: true,
        }
        console.log("Capturing picture with flash mode: ", flashMode);
        const data: TakePictureResponse = await cameraRef.current.takePictureAsync(options);
        const source = data.uri
        console.info("source: ", source);
        const base64Data:string | undefined = data.base64;
        console.info('type of base64: ', typeof base64Data)
        savePicture(base64Data);
      }
      catch(error){
        console.error('Failed to save picture: ', error);
      }
 
      // console.log(data.uri);
    }
  };

  const switchCamera = () => {
    setSelectedCamera((prevCamera) => (prevCamera === 'back' ? 'front' : 'back'));
  };
 
  const handleSelectedPath = async (path: string) => {
    if(Platform.OS === 'android' && (path.startsWith('content://') || path.startsWith('/storage/'))){
      try {
        const selectedDirectory = path.split('/').pop();
        setSelectedSavePath(selectedDirectory || '');
      } catch (error) {
        console.error('Error copying file:', error);        
      }
      console.log('pathtosave: ', selectedSavePath)
    }
  };


  return (
    <View style={styles.container}>
      
      <RNCamera
        ref={cameraRef}
        style={styles.cameraPreview}
        type={selectedCamera}
        captureAudio={true} 
        flashMode={flashMode}>

        <CameraHeader 
          onPressSettings={handleSettingsPress}
          onPressFlashToggle = {toggleFlash}
          flashMode={flashMode}/>

          {isFramingLinesVisible && (
            <View style={styles.framingLinesContainer}>
              <View style={[styles.verticalLine, { left: '33.3333%' }]} />
              <View style={[styles.verticalLine, { left: '66.6666%' }]} />
              <View style={[styles.horizontalLine, { top: '33.3333%' }]} />
              <View style={[styles.horizontalLine, { top: '66.6666%' }]} />
            </View>
          )}

        <View style={styles.captureButtonContainer}>
          <TouchableOpacity onPress={() => takePicture(selectedQualityForCapture)} style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
        <View style={styles.switchCameraButtonContainer}>
          <TouchableOpacity onPress={switchCamera} style={styles.switchCameraButton}>
            {/* <Icon name="sync" size={25} color="white" />  */}
            <Image source={require('./assets/sync_icon.png')}/>
          </TouchableOpacity>
        </View>         
      </RNCamera>
        
      <SettingsModal
        visible={showSettingModal}
        selectedQuality={selectedQualityStream}
        onClose={() => setShowSettingModal(false)}
        onQualitySelect={handleQualitySelect }
        onSavePath={handleSelectedPath}
        isFramingLinesVisible={isFramingLinesVisible}
        onFramingLinesToggle={() => setIsFramingLinesVisible(prev => !prev)} />     
        
    </View>
  );
};
const styles = StyleSheet.create({
  cameraPreview: {
    flex: 1,
  },
  top: {
    height: '3.3%',
    backgroundColor: "black",
    opacity: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  },
  captureButtonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    padding: '5%'
  },
  captureButton: {
    padding: 8,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  switchCameraButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  switchCameraButton: {
    padding: 16,
    color: 'white'
  },
  switchCameraText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  framingLinesContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'white', // Adjust color as needed
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'white', // Adjust color as needed
    position: 'absolute',
    top: '50%',
    marginTop: -1,
  },
  
});
export default CameraScreen;
