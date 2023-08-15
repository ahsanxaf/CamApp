import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import { RNCamera, TakePictureResponse, RNCameraProps } from 'react-native-camera';
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/FontAwesome';
import CameraHeader from './components/CameraHeader';
import SettingsModal from './components/SettingsModal';
import { useCamera } from 'react-native-camera-hooks';
import { takePicture } from 'react-native-camera-hooks/src/takePicture';
import {GestureHandlerGestureEvent, PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBarBlurBackground } from './views/StatusBarBlurBackground';
import { CaptureButton } from './views/CaptureButton';
// import { useSharedValue } from 'react-native-reanimated';
import { Camera } from 'react-native-vision-camera';
import { useCameraDevices } from 'react-native-vision-camera';
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from './components/Constants';
import { useIsForeground } from './hooks/useIsForeground';
import { useIsFocused } from '@react-navigation/native';

type CameraQuality = 'low' | 'medium' | 'high';
const CameraScreen: React.FC = () => {
  const cameraRef = useRef<RNCamera>(null);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedQualityStream, setSelectedQualityStream] = useState<CameraQuality>('high')
  const [zoom, setZoom] = useState(0);

  // ///new.....................
  // const camera = useRef<Camera>(null);
  // // const Zoom = useSharedValue(0);
  // const [flash, setFlash] = useState<'off' | 'on'>('off');
  // const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  // const isFocussed = useIsFocused();
  // const isForeground = useIsForeground();
  // const isActive = isFocussed && isForeground;
  // // const isPressingButton = useSharedValue(false);

  // const devices = useCameraDevices();
  // const device = devices[selectedCamera];
  // const minZoom = device?.minZoom ?? 1;
  // const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);
  // const supportsFlash = device?.hasFlash ?? false;

  // // const setIsPressingButton = useCallback(
  // //   (_isPressingButton: boolean) => {
  // //     isPressingButton.value = _isPressingButton;
  // //   },
  // //   [isPressingButton],
  // // );

  // //end.....


  // const cameraSound = new Sound('sounds/camera_shutter.mp3', Sound.MAIN_BUNDLE, (error) => {
  //   if(error){
  //     console.error('Error loading sound: ', error);
  //   }
  // });
  const handleSettingsPress = () => {
    setShowSettingModal(true);
    console.log("setting button pressed!");
  };

  const handleQualitySelect  = async(selectedQuality: CameraQuality) => {
    setShowSettingModal(false);
    if(isRecording){
      await stopRecording();
    }
    setSelectedQualityStream(selectedQuality);
    if(isRecording){
      await startRecording();
    }
    console.log('Selected Camera Quality: ', selectedQuality);
  };

  const takePicture1 = async () => {
    if(cameraRef.current){
      try{
        const options = {quality:0.5, base64: true}
        const data: TakePictureResponse = await cameraRef.current.takePictureAsync(options);

        const base64Data:string | undefined = data.base64;
        // console.info("base64Data: ", base64Data)
        if(base64Data){
          const directoryName: string = "camApp"
          const folderPath = `${RNFS.DocumentDirectoryPath}/DCIM/${directoryName}`;
          // const folderPath = RNFS.CachesDirectoryPath + directoryName;
          console.log("folder path: ", folderPath);
        

          const folderExists =  await RNFS.exists(folderPath);

          if(!folderExists){
            await RNFS.mkdir(folderPath, {NSURLIsExcludedFromBackupKey: true})
          }

          const filePath = `${folderPath}/picture_${Date.now()}.jpg`;

          await RNFS.writeFile(filePath, base64Data, 'base64');

          // Move the image to the gallery
          // const newFilePath = `${RNFS.ExternalDirectoryPath}/DCIM/Camera/picture_${Date.now()}.jpg`;
          // await RNFS.moveFile(filePath, newFilePath);

          console.log('Picture saved successfully: ', filePath);
          // SoundPlayer.playSoundFile('sounds/camera_shutter', 'mp3');

          // if(cameraSound.isLoaded()){
          //   cameraSound.play();
          // }
        }else{
          console.error('Base64 data is undefined. Unable to save the  picture')
        }
      }
      catch(error){
        console.error('Failed to save picture: ', error);
      }


      
      // console.log(data.uri);
    }
  };

  const handlePressIn = () => {
    if(!isRecording){
      setIsRecording(true);
      startRecording();
    }
  }

  const handlePressOut = () => {
    if(isRecording){
      setIsRecording(false);
      stopRecording();
    }
  }

  const startRecording = async() => {
    if(cameraRef.current){
      try{
        const videoOptions = {
          quality: RNCamera.Constants.VideoQuality['1080p'],
          maxDuration: 30
        };
        const data = await cameraRef.current.recordAsync(videoOptions);
        console.log('Video recorded')
      }
      catch(error)
      {
        console.error('Error while recording video: ', error);
      }
    }
  }

  const stopRecording = async() => {
    if(cameraRef.current){
      cameraRef.current.stopRecording();
    }
  }

  const switchCamera = () => {
    setSelectedCamera((prevCamera) => (prevCamera === 'back' ? 'front' : 'back'));
  };

  const captureHandle = async() => {
    try{
      const data = await cameraRef.current?.takePictureAsync({quality: 1});
      // console.log(data?.uri);
      if(data?.uri){
        const filePath =  data?.uri;
        console.info(filePath);
        const newFilePath = RNFS.ExternalDirectoryPath + '/mytest.jpg'
        RNFS.moveFile(filePath, newFilePath)
        .then(() => {
          console.log("Image saved at: ", newFilePath);
        }).catch(error => {
          console.log(error);
        })
      }else{
        console.log("Error capturing the picture: data.uri is undefined");
      }
       
    }catch(error){
      console.log("Error while capturing the picture: ", error)
    }
  };

  const handlePinch = (event: GestureHandlerGestureEvent) => {
    if(event.nativeEvent.state === State.ACTIVE && cameraRef.current) {
      const newZoom = zoom + (1 - event.nativeEvent.state) * 0.1;
      setZoom(Math.max(0, Math.min(newZoom, 1)));
      // cameraRef.current?.zoom?.(newZoom);
    }
  };

  return (
    <View style={styles.container}>
      
      <CameraHeader onPressSettings={handleSettingsPress}/>
      {/* <RNCamera
        ref={cameraRef}
        style={styles.cameraPreview}
        type={selectedCamera}
        captureAudio={true} 
        flashMode={RNCamera.Constants.FlashMode.off}
        
        
      /> */} 
      <GestureHandlerRootView style = {{flex: 1}}>
        <PinchGestureHandler onGestureEvent={handlePinch} enabled>
          <RNCamera
            ref={cameraRef}
            style={styles.cameraPreview}
            type={selectedCamera}
            captureAudio={true} 
            flashMode={RNCamera.Constants.FlashMode.off}
            zoom={zoom}>

            <View style={styles.captureButtonContainer}>
              <TouchableOpacity onPress={takePicture1} style={styles.captureButton}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>


            
          </RNCamera>
        </PinchGestureHandler>
      </GestureHandlerRootView>
      {/* <CaptureButton
            camera = {camera}
            onMediaCaptured={takePicture1}
            cameraZoom={Zoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            flash={supportsFlash ? flash : 'off'}
            enabled={isCameraInitialized && isActive}
            setIsPressingButton={setIsPressingButton}/> */}
       

      <View style={styles.switchCameraButtonContainer}>
        <TouchableOpacity onPress={switchCamera} style={styles.switchCameraButton}>
          {/* <Icon name="sync" size={25} color="white" />  */}
          <Image source={require('./assets/sync_icon.png')}/>
        </TouchableOpacity>
      </View>
      <SettingsModal
        visible={showSettingModal}
        selectedQuality={selectedQualityStream}
        onClose={() => setShowSettingModal(false)}
        onQualitySelect={handleQualitySelect }/>     
        {/* <ParentComponent/>      */}
    </View>
  );
};
const styles = StyleSheet.create({
  cameraPreview: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignContent: 'flex-end'
  },
  captureButtonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  captureButton: {
    padding: 13,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
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
  
});
export default CameraScreen;
