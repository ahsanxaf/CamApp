import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  StatusBar, 
  Platform, 
  ScrollView 
} from 'react-native';
import { RNCamera, TakePictureResponse, RNCameraProps } from 'react-native-camera';
import RNFS from 'react-native-fs'
import CameraHeader from './components/CameraHeader';
import SettingsModal from './components/SettingsModal';
import {FlashMode, CameraQuality } from './types/Types';
import {useNamingScheme} from './contexts/NamingSchemeContext';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';



const APP_ALBUM_NAME = 'CamApp';
const CameraScreen: React.FC<{route: ReactNode}> = ({route}) => {
  const cameraRef = useRef<RNCamera>(null);
  const buttonsScrollViewRef = useRef<ScrollView>(null);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedQualityStream, setSelectedQualityStream] = useState<CameraQuality>('high')
  const [selectedQualityForCapture, setSelectedQualityForCapture] = useState<CameraQuality>('medium');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const { namingScheme, setNamingScheme } = useNamingScheme();
  const [selectedSavePath, setSelectedSavePath] = useState<string>(''); // State to store the selected path for saving
  const [isFramingLinesVisible, setIsFramingLinesVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'photo' | 'video'>('photo');
  const [isPaused, setIsPaused] = useState(false);
  const [recordingIcon, setRecordingIcon] = useState<Element>();

  useEffect(() => {
    StatusBar.setHidden(true);
    setSelectedMode('photo')
  }, []);

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
      // const folderPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/test`;
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
  };

  const saveVideo = async (videoUri: string) => {
    try {
      // Create a directory to save the video
      const directoryName = `${APP_ALBUM_NAME}`; 
      const folderPath = `${RNFS.ExternalStorageDirectoryPath}/${selectedSavePath}/${directoryName}`;
      const folderExists = await RNFS.exists(folderPath);
  
      if (!folderExists) {
        await RNFS.mkdir(folderPath, { NSURLIsExcludedFromBackupKey: true });
      }
  
      // Generate a unique file name or use a timestamp
      const fileName = selectFileName(videoUri); // Customize the file name if needed
      const filePath = `${folderPath}/${fileName}.mp4`;
  
      // Move the recorded video to the desired location
      await RNFS.moveFile(videoUri, filePath);
  
      console.log('Video saved successfully:', filePath);
    } catch (error) {
      console.error('Failed to save video:', error);
    }
  };

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
  const startTimer = () => {
    const timerInterval = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    setTimerIntervalId(timerInterval);
  };

  const stopTimer = () => {
    // Reset the timer and start from zero
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
      setRecordingTime(0);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        const options = {
          quality: RNCamera.Constants.VideoQuality['720p'],
          maxDuration: 500, // Maximum duration of the video (in seconds)
        };
        setIsRecording(true);
        console.info("recording started")
        const recording = await cameraRef.current.recordAsync(options);
        setVideoUri(recording.uri);
        console.log('videouri: ', videoUri)
        stopTimer();
        startTimer();              

      } catch (error) {
        console.error("Failed to start recording: ", error);
      }
    }
  };
  
  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        console.info("recording stoped")

        // Stop the timer
        stopTimer();

        // Save the recorded video
        if (videoUri) {
          saveVideo(videoUri);
        }

      } catch (error) {
        console.error("Failed to stop recording: ", error);
      }
    }
  };

  const formatRecordingTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  

  const switchCamera = () => {
    setSelectedCamera((prevCamera) => (prevCamera === 'back' ? 'front' : 'back'));
  };
 
  const handleSelectedPath = async (path: string) => {
    if(Platform.OS === 'android' && (path.startsWith('content://') || path.startsWith('/storage/'))){
      try {
        let selectedDirectory = ''
        const defaultDirectory = path.split('/').pop();
        const segments = path.split('/'); // Split the URI by '/'
        const indexOfPrimary = segments.indexOf('primary');
        if (indexOfPrimary !== -1 && indexOfPrimary + 1 < segments.length) {
          selectedDirectory = segments.slice(indexOfPrimary + 1).join('/');
        } else {
          console.log('Invalid URI'); 
        }
        
        setSelectedSavePath(selectedDirectory || defaultDirectory || '');
      } catch (error) {
        console.error('Error copying file:', error);        
      }
      console.log('pathtosave: ', selectedSavePath)
    }
  };

  const handleModeSelect = (mode: 'photo' | 'video') => {
    setSelectedMode(mode);
    
    // Calculate the offset based on the selected mode
    const offset = mode === 'photo' ? 0 : 100; // Adjust the value as needed

    // Scroll to the selected button
    buttonsScrollViewRef.current?.scrollTo({ x: offset, animated: true });
    // Stop recording if video mode is switched off
    if (mode === 'photo' && isRecording) {
      stopRecording();
    }
  };

  const handleRecordingStatusChange = () => {
    if (!isRecording) {
      // Start recording
      starttRecording(); // Hide switch camera button during recording
    } else if (isPaused) {
      // Resume recording
      resumeRecording();
    } else {
      // Pause recording
      pauseRecording();
    }
  };

  const starttRecording = async () => {
    // ...
    setIsRecording(true);
    setIsPaused(false);
    const pause = <Image source={require('./assets/pause_icon.png')}/>
    setRecordingIcon(pause); // Change icon to pause
    // ...
  };

  const pauseRecording = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.pausePreview();
        setIsPaused(true);
        const play = <Image source={require('./assets/play_icon.png')}/>
        setRecordingIcon(play); // Change icon to play
      } catch (error) {
        console.error('Failed to pause recording: ', error);
      }
    }
  };

  const resumeRecording = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.resumePreview();
        setIsPaused(false);
        const pause = <Image source={require('./assets/pause_icon.png')}/>
        setRecordingIcon(pause); // Change icon back to pause
      } catch (error) {
        console.error('Failed to resume recording: ', error);
      }
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.cameraPreview}
        type={selectedCamera}
        captureAudio={true} 
        flashMode={flashMode}
        playSoundOnCapture={true}>

        <CameraHeader 
          onPressSettings={handleSettingsPress}
          onPressFlashToggle = {toggleFlash}
          flashMode={flashMode}/>

        {isRecording && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatRecordingTime(recordingTime)}
            </Text>
          </View>
        )}

          {isFramingLinesVisible && (
            <View style={styles.framingLinesContainer}>
              <View style={[styles.verticalLine, { left: '33.3333%' }]} />
              <View style={[styles.verticalLine, { left: '66.6666%' }]} />
              <View style={[styles.horizontalLine, { top: '33.3333%' }]} />
              <View style={[styles.horizontalLine, { top: '66.6666%' }]} />
            </View>
          )}

        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              if (selectedMode === "photo") {
                takePicture(selectedQualityForCapture);
              } else if (selectedMode === "video") {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }
            }}
            style={[styles.captureButton, selectedMode === "video" && styles.recordingButton, isRecording && selectedMode==='video' && styles.recordingBackground]}>
            <View
              style={[
                styles.captureButtonInner,
                selectedMode === "video" && isRecording && styles.recordingCaptureButtonInner, // Apply style for recording
            ]}
          />
          </TouchableOpacity>
          <View style={styles.switchCameraButtonContainer}>
            {!isRecording && (
              <TouchableOpacity onPress={switchCamera} style={styles.switchCameraButton}>
                {/* <Icon name="sync" size={25} color="white" />  */}
                <Image source={require('./assets/sync_icon.png')}/>
              </TouchableOpacity>
            )}
            
          </View> 
        </View> 
    </RNCamera>

      <View style={{height: '4%', backgroundColor: 'black', bottom: '0%', justifyContent: 'center', }}>
          <ScrollView
            ref={buttonsScrollViewRef}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle = {styles.buttonsScrollView}>

            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'photo' ? styles.selectedModeButton : null,
              ]}
                onPress={() => handleModeSelect('photo')}>
              <Text style={selectedMode === 'photo' ? styles.selectedModeText : styles.modeText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'video' ? styles.selectedModeButton : null,
              ]}
              onPress={() => handleModeSelect('video')}>
              <Text style={selectedMode === 'video' ? styles.selectedModeText : styles.modeText}>Video</Text>
            </TouchableOpacity>

          </ScrollView>
      </View>
      
      <SettingsModal
        visible={showSettingModal}
        selectedQuality={selectedQualityStream}
        onClose={() => setShowSettingModal(false)}
        onQualitySelect={handleQualitySelect }
        onSavePath={handleSelectedPath}
        isFramingLinesVisible={isFramingLinesVisible}
        onFramingLinesToggle={() => setIsFramingLinesVisible(prev => !prev)} />     
        
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  cameraPreview: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
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
    backgroundColor: 'white',
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'white', 
    position: 'absolute',
    top: '50%',
    marginTop: -1,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
  selectedModeButton: {
    backgroundColor: 'black', // Background color for the selected button
  },
  selectedModeText: {
    color: 'yellow',
    fontWeight: '700'
  },
  buttonsScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  modeText: {
    color: 'white'
  },
  videoCaptureButtonInner: {
    backgroundColor: 'red', 
  },
  timerContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
  },
  recordingCaptureButtonInner: {
    backgroundColor: 'red', // Change background color when recording
  },
  recordingButton: {
    borderColor: 'red', 
  },
  recordingBackground:{
    backgroundColor: 'white'
  }
  
});
export default CameraScreen;
