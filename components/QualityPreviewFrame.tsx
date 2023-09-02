import React, {useRef, useEffect, useState} from "react";
import { Image, StyleSheet, TouchableOpacity, View, Modal, Text, useWindowDimensions } from 'react-native';
import {RNCameraProps, RNCamera} from 'react-native-camera'
import { CameraQuality } from "../types/Types";


interface QualityPreviewFrameProps {
    visible: boolean;
    selectedQuality: CameraQuality;
    onClose: () => void;
    onQualitySelect: (selectedQuality: CameraQuality) => void;
}

const QualityPreviewFrame: React.FC<QualityPreviewFrameProps> = ({
    visible,
    selectedQuality,
    onClose,
    onQualitySelect,
}) => {

    const cameraRefs: {[key in CameraQuality]: React.RefObject<RNCamera>} = {
        low: useRef<RNCamera>(null),
        medium: useRef<RNCamera>(null),
        high: useRef<RNCamera>(null)
    };

    const [selectedCameraQuality, setSelectedCameraQuality] = useState<CameraQuality>(selectedQuality);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const onCameraReady = () => {
        setIsCameraReady(true);
    };
    
    const startCameraPreview = async() => {
        for (const quality in cameraRefs){
            const cameraRef = cameraRefs[quality as CameraQuality].current;

            if(cameraRef && isCameraReady){
                try{
                    // const cameraQualitySettings = 
                    // getCameraQualitySettings(quality as CameraQuality);
                    cameraRef.resumePreview();
                }catch(error){
                    console.error('Error While Starting Caamera Preview: ', error)
                }
            }
        }
    };

    const stopCameraPreview = () => {
        for (const quality in cameraRefs){
            const cameraRef = cameraRefs[quality as CameraQuality].current;
            if(cameraRef){
                cameraRef.pausePreview();
            }
        }
    };

    useEffect(() => {
        if(visible){
            startCameraPreview();
        }
        else{
            stopCameraPreview();
        }
        
    }, [visible, isCameraReady]);

    const handleQualitySelect = async (quality: CameraQuality) => {
        stopCameraPreview();
        setSelectedCameraQuality(quality);
        onQualitySelect(quality);
        
        let videoQuality = RNCamera.Constants.VideoQuality["720p"];
        if(quality === "low"){
            RNCamera.Constants.VideoQuality["480p"];
        }
        else if(quality === "high"){
            RNCamera.Constants.VideoQuality["1080p"];
        }

        const selectedCameraRef = cameraRefs[quality].current;
        if(selectedCameraRef){
            selectedCameraRef.resumePreview();
            await selectedCameraRef.stopRecording();
            selectedCameraRef.recordAsync({quality: videoQuality});
        }

        // const selectedCameraRef = cameraRefs[quality].current;
        // if(selectedCameraRef){
        //     selectedCameraRef.resumePreview();
        // }
        onClose();
    };

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const modalContentWidth = windowWidth/2;
    const modalContentHeight = windowHeight * 0.3;
    // const getCameraQualitySettings = (quality: CameraQuality) => {
    //     switch(quality){
    //         case 'low':
    //             return RNCamera.Constants.VideoQuality['480p'];
    //         case 'medium':
    //             return RNCamera.Constants.VideoQuality['720p'];
    //         case 'high':
    //             return RNCamera.Constants.VideoQuality['1080p'];
    //         default:
    //             return RNCamera.Constants.VideoQuality['720p'];
    // }
    // };
    
    return(
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => handleQualitySelect('low')} style={styles.button}>
                    {/* <RNCamera 
                        ref={cameraRefs.low} 
                        style={styles.cameraPreview} 
                        type = {RNCamera.Constants.Type.back}
                        // defaultVideoQuality={'480p'}
                        defaultVideoQuality={selectedCameraQuality === "low" ? "480p" : undefined}
                        onCameraReady={onCameraReady}
                    /> */}
                    <Text style={{color: 'red'}}>Low</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleQualitySelect('medium')} style={styles.button}>
                {/* <RNCamera 
                        ref={cameraRefs.medium} 
                        style={styles.cameraPreview} 
                        type = {RNCamera.Constants.Type.back}
                        // defaultVideoQuality={'720p'}
                        defaultVideoQuality={selectedCameraQuality === "medium" ? "720p" : undefined}
                        onCameraReady={onCameraReady}
                    /> */}
                    <Text style={{color: 'green'}}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleQualitySelect('high')} style={styles.button}>
                {/* <RNCamera 
                        ref={cameraRefs.high} 
                        style={styles.cameraPreview} 
                        type = {RNCamera.Constants.Type.back}
                        // defaultVideoQuality={'1080p'}
                        defaultVideoQuality={selectedCameraQuality === "high" ? "1080p" : undefined}
                        onCameraReady={onCameraReady}
                    /> */}
                    <Text style={{color: 'yellow'}}>High</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {      
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginTop: 30
    },
    cameraContainer: {
        width: '25%',
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: 'gray',
    },
      cameraPreview: {
        flex: 1,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 5,
      },
});

export default QualityPreviewFrame;