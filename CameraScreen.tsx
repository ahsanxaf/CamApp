import React, {useState, useRef, ReactNode, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Modal,
  Alert,
  NativeModules
} from 'react-native';
import {BarCodeReadEvent, RNCamera, TakePictureResponse} from 'react-native-camera';
import RNFS from 'react-native-fs';
import CameraHeader from './components/CameraHeader';
import SettingsModal from './components/SettingsModal';
import {FlashMode, CameraQuality} from './types/Types';
import {useNamingScheme} from './contexts/NamingSchemeContext';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {SafeAreaView} from 'react-native-safe-area-context';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
// import CameraKitCameraScreen from 'react-native-camera-kit';

const APP_ALBUM_NAME = 'CamApp';
const guidingBoxSize = 200;
const CameraScreen: React.FC<{route: ReactNode}> = ({route}) => {
  const cameraRef = useRef<RNCamera>(null);
  const buttonsScrollViewRef = useRef<ScrollView>(null);
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>(
    'back',
  );
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedQualityStream, setSelectedQualityStream] =
    useState<CameraQuality>('high');
  const [selectedQualityForCapture, setSelectedQualityForCapture] =
    useState<CameraQuality>('medium');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const {namingScheme, setNamingScheme} = useNamingScheme();
  const [selectedSavePath, setSelectedSavePath] = useState<string>(''); // State to store the selected path for saving
  const [isFramingLinesVisible, setIsFramingLinesVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'photo' | 'video' | 'scan'>('photo');
  const [playSoundOnCapture, setPlaySoundOnCapture] = useState(false);
  const [isScanningEnabled, setIsScanningEnabled] = useState(false);
  const [capturedDocumentImage, setCapturedDocumentImage] = useState<string | null | undefined>(null);
  const [captureButtonPosition, setCaptureButtonPosition] = useState({
    x: 0,
    y: 0,
  });
  const [capturedPictures, setCapturedPictures] = useState<string[]>([]); // Store captured picture URIs
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null); // For full-screen display
  const [isSaved, setIsSaved] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);
  const [isGuidingBoxVisible, setIsGuidingBoxVisible] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [zoom, setZoom] = useState(0);
  const CameraZoomModule = NativeModules.CameraZoomModule;


  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = 100;

  useEffect(() => {
    StatusBar.setHidden(true);
    setSelectedMode('photo');

    const handleZoomIn = () => {
      const newZoomLevel = zoomLevel + 0.1; // Increase zoom level by 0.1
      if (newZoomLevel <= 1) {
        setZoomLevel(newZoomLevel); 
      }
    };
    const handleZoomOut = () => {
      const newZoomLevel = zoomLevel - 0.1; // Decrease zoom level by 0.1
      if (newZoomLevel >= 0) {
        setZoomLevel(newZoomLevel); 
      }
    };
    handleZoomIn();
    handleZoomOut();

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Update the capture button's position based on the user's drag gesture
      const newX = captureButtonPosition.x + gestureState.dx;

      // Ensure the capture button stays within the container boundaries
      const containerWidth = screenWidth - buttonWidth;

      // Limit the drag to both left and right within the container boundaries
      if (newX >= 0 && newX <= containerWidth) {
        setCaptureButtonPosition({x: newX, y: 0});
      }
    },
  });

  const handleSoundToggle = (isSoundEnabled: boolean) => {
    setPlaySoundOnCapture(isSoundEnabled);
  };
  const handleScanningToggle = (isScanningEnabled: boolean) => {
    setIsScanningEnabled(isScanningEnabled);
  };
  const toggleFlash = () => {
    flashMode === 'off' ? setFlashMode('on') : setFlashMode('off');
  };

  const handleSettingsPress = () => {
    setShowSettingModal(true);
    console.log('setting button pressed!');
  };

  const handleQualitySelect = async (selectedQuality: CameraQuality) => {
    setSelectedQualityForCapture(selectedQuality);
    console.log('Selected Camera Quality: ', selectedQuality);
  };

  const updateSequence = () => {
    const currentSequence = namingScheme.sequence || '';
    const sequenceParts = currentSequence.split('_');
    let newSequence = currentSequence;

    if (sequenceParts.length > 1) {
      // If the sequence already contains an underscore and a number, increment the number
      const lastPart = sequenceParts[sequenceParts.length - 1];
      if (!isNaN(parseInt(lastPart))) {
        const newNumber = parseInt(lastPart) + 1;
        newSequence =
          sequenceParts.slice(0, sequenceParts.length - 1).join('_') +
          '_' +
          newNumber;
      } else {
        // If the last part is not a number, simply add "_1" to the end
        newSequence += '_1';
      }
    } else {
      newSequence += '_1';
    }

    setNamingScheme(prevScheme => ({...prevScheme, sequence: newSequence}));
  };

  const selectFileName = (data: string) => {
    var fileName = '';
    if (data) {
      if (namingScheme?.type === 'datetime') {
        const currentDate = new Date();
        const formattedDate = currentDate
          .toISOString()
          .replace(/[:-]/g, '')
          .split('.')[0];
        fileName = `${namingScheme.prefix}_${formattedDate}`;
      } else if (namingScheme?.type === 'sequence') {
        fileName = `${namingScheme.prefix} ${namingScheme.sequence}`;
        updateSequence();
      } else if (namingScheme?.type === 'datetime & sequence') {
        const currentDate = new Date();
        const formattedDate = currentDate
          .toISOString()
          .replace(/[:-]/g, '')
          .split('.')[0];
        fileName = `${namingScheme.prefix} ${formattedDate}_${namingScheme.sequence}`;
        updateSequence();
      } else {
        const currentDate = new Date();
        const formattedDate = currentDate
          .toISOString()
          .replace(/[:-]/g, '')
          .split('.')[0];
        const prefix = 'IMG';
        fileName = `${prefix}_${formattedDate}`;
      }
    }
    return fileName;
  };

  const savePicture = async (data: string | undefined) => {
    if (data) {
      // console.info("data: ", data)
      const fileName = selectFileName(data);
      const directoryName: string = APP_ALBUM_NAME;
      requestStoragePermission();
      const folderPath = `${RNFS.ExternalStorageDirectoryPath}/${selectedSavePath}/${directoryName}`;
      // const folderPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/test`;
      console.log('folder path: ', folderPath);
      const folderExists = await RNFS.exists(folderPath);
      if (!folderExists) {
        await RNFS.mkdir(folderPath, {NSURLIsExcludedFromBackupKey: true});
      }
      const filePath = `${folderPath}/${fileName}.jpg`;
      console.info('filePath: ', filePath);
      if (/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
        await RNFS.writeFile(filePath, data, 'base64');
        console.log('Picture saved successfully: ', filePath);
      } else {
        console.error('Invalid base64 data');
      }
    } else {
      console.error('Base64 data is undefined. Unable to save the  picture');
    }
  };

  const saveVideo = async (videoUri: string) => {
    try {
      // Create a directory to save the video
      const directoryName = `${APP_ALBUM_NAME}`;
      const folderPath = `${RNFS.ExternalStorageDirectoryPath}/${selectedSavePath}/${directoryName}`;
      const folderExists = await RNFS.exists(folderPath);

      if (!folderExists) {
        await RNFS.mkdir(folderPath, {NSURLIsExcludedFromBackupKey: true});
      }

      // Generate a unique file name or use a timestamp
      const fileName = selectFileName(videoUri);
      const filePath = `${folderPath}/${fileName}.mp4`;

      // Move the recorded video to the desired location
      await RNFS.moveFile(videoUri, filePath);

      console.log('Video saved successfully:', filePath);
    } catch (error) {
      console.error('Failed to save video:', error);
    }
  };

  const takePicture = async () => {
    if (isScanningEnabled) {
      captureDocument();
      console.info('Captured Document: ', capturedDocumentImage);
    } else {
      setCapturedDocumentImage(null);
      if (cameraRef.current) {
        try {
          const options = {
            quality:
              selectedQualityForCapture === 'low'
                ? 0.4
                : selectedQualityForCapture === 'medium'
                ? 0.7
                : 1,
            base64: true,
            flashMode: flashMode,
            forceUpOrientation: true,
            fixOrientation: true,
          };
          console.log('Capturing picture with flash mode: ', flashMode);
          const data: TakePictureResponse =
            await cameraRef.current.takePictureAsync(options);
          const source = data.uri;
          console.info('source: ', source);
          const base64Data: string | undefined = data.base64;
          console.info('type of base64: ', typeof base64Data);
          savePicture(base64Data);
        } catch (error) {
          console.error('Failed to save picture: ', error);
        }

        // console.log(data.uri);
      }
    }
  };

  const captureDocument = async () => {
    if (cameraRef.current) {
      try {
        const options = {
          quality:
            selectedQualityForCapture === 'low'
              ? 0.4
              : selectedQualityForCapture === 'medium'
              ? 0.7
              : 1,
          base64: true,
          flashMode: flashMode,
          forceUpOrientation: true,
          fixOrientation: true,
        };

        const data: TakePictureResponse =
          await cameraRef.current.takePictureAsync(options);
        const source = data.uri;
        const base64Data: string | undefined = data.base64;

        setCapturedPictures([...capturedPictures, source]);
      } catch (error) {
        console.error('Failed to capture document:', error);
      }
    }
  };

  const startTimer = () => {
    const timerInterval = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
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
        console.info('recording started');
        const recording = await cameraRef.current.recordAsync(options);
        setVideoUri(recording.uri);
        console.log('videouri: ', videoUri);
        stopTimer();
        startTimer();
      } catch (error) {
        console.error('Failed to start recording: ', error);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        console.info('recording stoped');

        // Stop the timer
        stopTimer();

        // Save the recorded video
        if (videoUri) {
          saveVideo(videoUri);
        }
      } catch (error) {
        console.error('Failed to stop recording: ', error);
      }
    }
  };

  const formatRecordingTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const switchCamera = () => {
    setSelectedCamera(prevCamera => (prevCamera === 'back' ? 'front' : 'back'));
  };

  const handleSelectedPath = async (path: string) => {
    if (
      Platform.OS === 'android' &&
      (path.startsWith('content://') || path.startsWith('/storage/'))
    ) {
      try {
        let selectedDirectory = '';
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
      console.log('pathtosave: ', selectedSavePath);
    }
  };

  const handleModeSelect = (mode: 'photo' | 'video' | 'scan') => {
    setSelectedMode(mode);

    // Calculate the offset based on the selected mode
    const offset = mode === 'photo' ? 0 : 100; // Adjust the value as needed

    // Scroll to the selected button
    buttonsScrollViewRef.current?.scrollTo({x: offset, animated: true});
    // Stop recording if video mode is switched off
    if (mode === 'photo' && isRecording) {
      stopRecording();
    }

    setIsGuidingBoxVisible(mode === 'scan');
  };
  const openPicture = (picture: string) => {
    setSelectedPicture(picture);
    setIsSaved(false);
  };

  const closePicture = () => {
    setSelectedPicture(null);
  };
  const saveDocument = async () => {
    const selectedPictureBase64 = await convertToBase64();
    if (selectedPictureBase64) {
      savePicture(selectedPictureBase64);
      setIsSaved(true);
    }
  };
  const convertToBase64 = async () => {
    try {
      // Load the image data
      const imageUri = selectedPicture;
      const imageData = await RNFS.readFile(imageUri || '', 'base64');
      return imageData;
    } catch (error) {
      console.error('Failed to convert to base64:', error);
      return null;
    }
  };
  const deleteItemFromRow = (indexToDelete: number) => {
    setCapturedPictures(prevPictures =>
      prevPictures.filter((_, index) => index !== indexToDelete),
    );
  };
  const toggleScanner = () => {
    setIsScannerVisible(!isScannerVisible);
  };
  // const applyFilter = async (imageUri: any) => {
  //   try {
  //     const filteredImage = new Filter.ImageFilter(imageUri,
  //       Filter.Grayscale
  //     );
  //     return filteredImage;
  //   } catch (error) {
  //     console.error('Failed to apply filter:', error);
  //     return imageUri; // Return the original image if an error occurs
  //   }
  // };
  const handleBarCodeRead = (event: BarCodeReadEvent) => {
    if (selectedMode === 'scan' && event.type.includes('qr')) {
      // Only process the scanned QR code data if scan mode is active and it's a QR code
      // You can access the scanned QR code data using data.data
      const scannedData = event.data;
      setScannedQRCode(scannedData);
      setIsGuidingBoxVisible(false);
  
      // Handle the scanned data as needed (e.g., display it, navigate to a new screen, etc.)
      if (event.data && event.data.length > 0) {
        // Handle the barcode data here
        const barcodeData = event.data;
        Alert.alert('Scanned QR Code', barcodeData, [
          { text: 'OK', onPress: () => {} }, // You can add your custom logic here
        ]);
      }
    }
  };
  const handlePinch = (event: { nativeEvent: { state: number; scale: number; }; }) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newZoom = zoom + event.nativeEvent.scale - 1;
      console.log('aaaaa')
      if (newZoom >= 0 && newZoom <= 1) {
        setZoom(newZoom);
        CameraZoomModule.setZoom(newZoom, (result: any) => {
          if (result) {
            console.log('Zoom set successfully.');
          } else {
            console.error('Failed to set zoom.');
          }
        });
      }
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <PinchGestureHandler onGestureEvent={handlePinch} onHandlerStateChange={handlePinch}>
          <RNCamera
            ref={cameraRef}
            style={styles.cameraPreview}
            type={selectedCamera}
            captureAudio={true}
            flashMode={flashMode}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            autoFocusPointOfInterest={{ x: 0.5, y: 0.5 }}
            zoom={zoom}
            onBarCodeRead={isGuidingBoxVisible ? handleBarCodeRead : undefined}
            playSoundOnCapture={playSoundOnCapture}>
            <CameraHeader
              onPressSettings={handleSettingsPress}
              onPressFlashToggle={toggleFlash}
              flashMode={flashMode}
            />

            {isRecording && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  {formatRecordingTime(recordingTime)}
                </Text>
              </View>
            )}

            {isFramingLinesVisible && (
              <View style={styles.framingLinesContainer}>
                <View style={[styles.verticalLine, {left: '33.3333%'}]} />
                <View style={[styles.verticalLine, {left: '66.6666%'}]} />
                <View style={[styles.horizontalLine, {top: '33.3333%'}]} />
                <View style={[styles.horizontalLine, {top: '66.6666%'}]} />
              </View>
            )} 

            {/* {isGuidingBoxVisible && ( // Show the guiding box when isGuidingBoxVisible is true
              <View style={[styles.guidingBox, {width: guidingBoxSize, height: guidingBoxSize}]} />
            )} */}

            <View style={styles.captureButtonContainer}>
              {/* <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.captureButtonContainer,
                  {left: captureButtonPosition.x},
                ]}>
              </Animated.View> */}
                <TouchableOpacity
                  onPress={() => {
                    if (selectedMode === 'photo') {
                      takePicture();
                    } else if (selectedMode === 'video') {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }
                  }}
                  style={[
                    styles.captureButton,
                    selectedMode === 'video' && styles.recordingButton,
                    isRecording &&
                      selectedMode === 'video' &&
                      styles.recordingBackground,
                  ]}>
                  <View
                    style={[
                      styles.captureButtonInner,
                      selectedMode === 'video' &&
                        isRecording &&
                        styles.recordingCaptureButtonInner, // Apply style for recording
                    ]}
                  />
                </TouchableOpacity>
            </View>
            <View style={styles.switchCameraButtonContainer}>
              {!isRecording && (
                <TouchableOpacity
                  onPress={switchCamera}
                  style={styles.switchCameraButton}>
                  <Image source={require('./assets/sync_icon.png')} />
                </TouchableOpacity>
              )}
            </View>
          </RNCamera>
      </PinchGestureHandler>

      {/* Display captured pictures in a row */}
      {isScanningEnabled && selectedMode === 'photo' && (
        <View style={{backgroundColor: 'rgba(0,0,0,1)', height: '8%'}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pictureRow}
            contentContainerStyle={styles.pictureRowContent}>
            {capturedPictures.map((picture, index) => (
              <View key={index} style={styles.pictureContainer}>
                <TouchableOpacity onPress={() => openPicture(picture)}>
                  <Image
                    source={{uri: picture}}
                    style={styles.pictureThumbnail}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteItemFromRow(index)}
                  style={styles.cancelIconContainer}>
                  <Image source={require('./assets/cancel_small_icon.png')} />
                  {/* <Text>Cancel</Text> */}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {/* {selectedMode === 'scan' && (
      <CameraKitCameraScreen
          showFrame={true}
          scanBarcode={true}
          laserColor={'red'}
          frameColor={'white'}
          colorForScannerFrame={'black'}
          onReadCode={(event: { nativeEvent: { codeStringValue: any; }; }) => {
            // Handle the scanned QR code data here
            console.log('Scanned QR Code:', event.nativeEvent.codeStringValue);
            // You can perform actions with the scanned data here
          }}
        />
      )} */}
  
      {/* Full-screen picture modal */}
      <Modal
        visible={!!selectedPicture}
        transparent={true}
        onRequestClose={closePicture}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closePicture}>
            <Image source={require('./assets/cancel_icon.png')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveDocument}
            disabled={isSaved ? true : false}>
            <Text
              style={[
                styles.saveButtonText,
                {color: isSaved ? 'grey' : 'yellow'},
              ]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          {selectedPicture && (
            <Image
              source={{uri: selectedPicture}}
              style={styles.fullScreenImage}
            />
          )}
        </View>
      </Modal>
      <View
        style={{
          height: '4%',
          backgroundColor: 'black',
          bottom: '0%',
          justifyContent: 'center',
        }}>
        <ScrollView
          ref={buttonsScrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buttonsScrollView}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'photo' ? styles.selectedModeButton : null,
            ]}
            onPress={() => handleModeSelect('photo')}>
            <Text
              style={
                selectedMode === 'photo'
                  ? styles.selectedModeText
                  : styles.modeText
              }>
              Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'video' ? styles.selectedModeButton : null,
            ]}
            onPress={() => handleModeSelect('video')}>
            <Text
              style={
                selectedMode === 'video'
                  ? styles.selectedModeText
                  : styles.modeText
              }>
              Video
            </Text>
          </TouchableOpacity>
          {/* Add the "Scan" mode button */}
          {/* <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'scan' ? styles.selectedModeButton : null,
            ]}
            onPress={() => handleModeSelect('scan')}>
            <Text
              style={
                selectedMode === 'scan'
                  ? styles.selectedModeText
                  : styles.modeText
              }>
              Scan
            </Text>
          </TouchableOpacity> */}
        </ScrollView>
      </View>

      <SettingsModal
        visible={showSettingModal}
        selectedQuality={selectedQualityStream}
        onClose={() => setShowSettingModal(false)}
        onQualitySelect={handleQualitySelect}
        onSavePath={handleSelectedPath}
        isFramingLinesVisible={isFramingLinesVisible}
        onFramingLinesToggle={() => setIsFramingLinesVisible(prev => !prev)}
        onSoundToggle={handleSoundToggle}
        onCollageToggle={handleScanningToggle}
      />
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
    padding: '5%',
  },
  captureButton: {
    padding: 8,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    margin: 5,
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
    color: 'white',
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
    fontWeight: '700',
  },
  buttonsScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  modeText: {
    color: 'white',
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
  recordingBackground: {
    backgroundColor: 'white',
  },
  capturedImageContainer: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    marginRight: 10, // Adjust spacing from capture button
  },
  capturedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  pictureRow: {
    height: '1%',
    marginTop: 0,
  },
  pictureThumbnail: {
    width: 50,
    height: '100%',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  saveButton: {
    position: 'absolute',
    top: 35,
    right: 20,
    zIndex: 1,
  },
  saveButtonText: {
    color: 'yellow',
    fontSize: 16,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pictureRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  pictureContainer: {
    // marginRight: 10, // Adjust spacing between pictures
    position: 'relative',
  },
  cancelIconContainer: {
    position: 'absolute',
    top: -5,
    right: -3,
    zIndex: 1, // Ensure the icon is above the picture
    backgroundColor: 'transparent',
    padding: 5,
  },
  guidingBox: {
    borderWidth: 2, // Adjust the border width as needed
    borderColor: 'green', // Adjust the border color as needed
    position: 'absolute',
    top: '50%', // Adjust the position as needed to center the box vertically
    left: '50%', // Adjust the position as needed to center the box horizontally
    transform: [{ translateX: -(guidingBoxSize / 2) }, { translateY: -(guidingBoxSize / 2) }], // Center the box
    borderRadius: 10, // Adjust the border radius as needed for rounded corners
    // You can add additional styling properties as needed
  },
});
export default CameraScreen;
