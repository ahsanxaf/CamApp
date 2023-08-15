import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import { RNCamera, TakePictureResponse, RNCameraProps } from 'react-native-camera';
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/FontAwesome';
import CameraHeader from './components/CameraHeader';
import SettingsModal from './components/SettingsModal';
import { useCamera } from 'react-native-camera-hooks';
import { takePicture } from 'react-native-camera-hooks/src/takePicture';
import {GestureHandlerGestureEvent, PinchGestureHandler, State, GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler'


// new strategy .............................................................

import {Camera, useCameraDevices, CameraDeviceFormat, sortFormats, frameRateIncluded} from 'react-native-vision-camera';
import Reanimated from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/core';
import { useIsForeground } from './hooks/useIsForeground';


const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
// end .......................

type CameraQuality = 'low' | 'medium' | 'high';
const CameraScreen: React.FC = () => {
  const cameraRef = useRef<RNCamera>(null);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedQualityStream, setSelectedQualityStream] = useState<CameraQuality>('high')
  const [zoom, setZoom] = useState(0);



  


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
      const options = {quality:0.5, base64: true}
      const data: TakePictureResponse = await cameraRef.current.takePictureAsync(options);

      const base64Data:string | undefined = data.base64;
      if(base64Data){
        const directoryName: string = "camApp"
        const folderPath = `${RNFS.DocumentDirectoryPath}/${directoryName}`
        try{

          const folderExists =  await RNFS.exists(folderPath);

          if(!folderExists){
            await RNFS.mkdir(folderPath)
          }

          const filePath = `${folderPath}/picture_${Date.now()}.jpg`;

          await RNFS.writeFile(filePath, base64Data, 'base64');
          console.log('Picture saved successfully: ', filePath);
          // SoundPlayer.playSoundFile('sounds/camera_shutter', 'mp3');

          // if(cameraSound.isLoaded()){
          //   cameraSound.play();
          // }
        }
        catch(error){
          console.error('Failed to save picture: ', error);
        }
  
      }else{
        console.error('Base64 data is undefined. Unable to save the  picture')
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
      // cameraRef.current?.(newZoom);
    }
  };

  //new..............
    
  const camera = useRef<Camera>(null);
  const [is60Fps, setIs60Fps] = useState(true);
  const [enableHdr, setEnableHdr] = useState(false);
  const [enableNightMode, setEnableNightMode] = useState(false);

  //end

  // new business logic....................

  const devices =  useCameraDevices();
  const device = devices[selectedCamera];
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  // format settings
  const formats = useMemo<CameraDeviceFormat[] | undefined>(() => {
    if(device?.formats === null) return [];
    return device?.formats.sort(sortFormats);
  }, [device?.formats]);

  // region Memos
  const fps = useMemo(() => {
    if(!is60Fps) return 30;

    if(enableNightMode && !device?.supportsLowLightBoost){
      return 30;
    }

    const supportsHdrAt60Fps = formats?.some((f) => f.supportsVideoHDR && f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if(enableHdr && !supportsHdrAt60Fps){
      return 30;
    }

    
    const supports60Fps = formats?.some((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if(!supports60Fps){
      return 30;
    }

    return 60;

  }, [device?.supportsLowLightBoost, enableHdr, formats, is60Fps]);

  const format = useMemo(() => {
    let result = formats;
    if(enableHdr){
      result = result?.filter((f) => f.supportsVideoHDR || f.supportsPhotoHDR);

    }
    return result?.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)))
  }, [formats, fps, enableHdr]);
  // End ..................

  return (
    <View style={styles.container}>
      {device != null && (
        <PinchGestureHandler>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler>
              {/* <ReanimatedCamera  
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format} 
                isActive={isActive}
                video={true}
                photo={true}
                orientation="portrait"/> */}
                <RNCamera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  type={selectedCamera}
                  captureAudio={true} 
                  flashMode={RNCamera.Constants.FlashMode.off}>
              </RNCamera>
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}
    </View>








    // <View style={styles.container}>
      
    //   <CameraHeader onPressSettings={handleSettingsPress}/>
    //   {/* <RNCamera
    //     ref={cameraRef}
    //     style={styles.cameraPreview}
    //     type={selectedCamera}
    //     captureAudio={true} 
    //     flashMode={RNCamera.Constants.FlashMode.off}
        
        
    //   /> */} 
    //   <GestureHandlerRootView style = {{flex: 1}}>
    //     <PinchGestureHandler onGestureEvent={handlePinch} enabled>
    //       <RNCamera
    //         ref={cameraRef}
    //         style={styles.cameraPreview}
    //         type={selectedCamera}
    //         captureAudio={true} 
    //         flashMode={RNCamera.Constants.FlashMode.off}
    //         zoom={zoom}>

    //         <View style={styles.captureButtonContainer}>
    //           <TouchableOpacity onPress={captureHandle} style={styles.captureButton}>
    //             <View style={styles.captureButtonInner} />
    //           </TouchableOpacity>
    //         </View>
    //       </RNCamera>
    //     </PinchGestureHandler>
    //   </GestureHandlerRootView>
       

    //   <View style={styles.switchCameraButtonContainer}>
    //     <TouchableOpacity onPress={switchCamera} style={styles.switchCameraButton}>
    //       {/* <Icon name="sync" size={25} color="white" />  */}
    //       <Image source={require('./assets/sync_icon.png')}/>
    //     </TouchableOpacity>
    //   </View>
    //   <SettingsModal
    //     visible={showSettingModal}
    //     selectedQuality={selectedQualityStream}
    //     onClose={() => setShowSettingModal(false)}
    //     onQualitySelect={handleQualitySelect }/>     
    //     {/* <ParentComponent/>      */}
    // </View>
  );
};
const styles = StyleSheet.create({

container: {
  flex: 1,
  backgroundColor: 'black'
}



  // cameraPreview: {
  //   flex: 1,
  // },
  // container: {
  //   flex: 1,
  //   justifyContent: 'flex-end',
  //   alignContent: 'flex-end'
  // },
  // captureButtonContainer: {
  //   flex: 0,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   position: 'absolute',
  //   bottom: 20,
  //   left: 0,
  //   right: 0,
  // },
  // captureButton: {
  //   padding: 13,
  //   borderRadius: 50,
  //   borderWidth: 3,
  //   borderColor: 'white',
  // },
  // captureButtonInner: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 30,
  //   backgroundColor: 'white',
  // },
  // switchCameraButtonContainer: {
  //   position: 'absolute',
  //   bottom: 16,
  //   right: 16,
  // },
  // switchCameraButton: {
  //   padding: 16,
  //   color: 'white'
  // },
  // switchCameraText: {
  //   color: 'white',
  //   fontSize: 16,
  //   textDecorationLine: 'underline',
  // },
  
});
export default CameraScreen;
